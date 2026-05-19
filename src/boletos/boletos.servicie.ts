import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Boleto } from './entities/boleto.entity';
import { ProgramacionRuta } from '../programaciones-ruta/entities/programacion-ruta.entity';
import { MetodoPagoCiudadano } from '../metodos-pago-ciudadano/entities/metodos-pago-ciudadano.entity';
import { Paradero } from '../paradero/entities/paradero.entity';
import { Ciudadano } from '../ciudadanos/entities/ciudadano.entity';

import { Historial } from '../historial/entities/historial.entity';
import { Nodo } from '../nodos/entities/nodo.entity';
import { TipoValidacion } from '../historial/enums/tipo-validacion.enum';

import { CreateBoletoDto } from './dto/create- boleto.dto';
import { DescensoBoletoDto } from './dto/descenso-boleto.dto';
import { EstadoBoleto } from './enums/estado-boleto.enum';
import { EstadoProgramacion } from '../programaciones-ruta/enums/estado-programacion.enum';
import { Between } from 'typeorm';
import { TipoMetodoPago } from '../metodos-pago/enums/tipo-metodo-pago.enum';

@Injectable()
export class BoletosService {
  constructor(
    @InjectRepository(Boleto)
    private readonly boletoRepo: Repository<Boleto>,

    @InjectRepository(ProgramacionRuta)
    private readonly programacionRepo: Repository<ProgramacionRuta>,

    @InjectRepository(MetodoPagoCiudadano)
    private readonly metodoPagoRepo: Repository<MetodoPagoCiudadano>,

    @InjectRepository(Paradero)
    private readonly paraderoRepo: Repository<Paradero>,

    @InjectRepository(Ciudadano)
    private readonly ciudadanoRepo: Repository<Ciudadano>,

    @InjectRepository(Historial)
    private readonly historialRepository: Repository<Historial>,

    @InjectRepository(Nodo)
    private readonly nodoRepository: Repository<Nodo>,
  ) {}

  private async buscarNodoPorRutaYParadero(
    rutaId: number,
    paraderoId: number,
  ): Promise<Nodo> {
    const nodo = await this.nodoRepository.findOne({
      where: {
        ruta: {
          id: rutaId,
        },
        paradero: {
          id: paraderoId,
        },
      },
      relations: ['ruta', 'paradero'],
    });

    if (!nodo) {
      throw new NotFoundException(
        `No se encontró un nodo para la ruta ${rutaId} y el paradero ${paraderoId}`,
      );
    }

    return nodo;
  }

  private async registrarHistorial(
    boleto: Boleto,
    nodo: Nodo,
    tipo: TipoValidacion,
  ): Promise<void> {
    if (!boleto.id) {
      throw new InternalServerErrorException(
        'No se pudo registrar historial porque el boleto no tiene ID',
      );
    }

    if (!nodo.id) {
      throw new InternalServerErrorException(
        'No se pudo registrar historial porque el nodo no tiene ID',
      );
    }

    const historialExistente = await this.historialRepository.findOne({
      where: {
        boletoId: boleto.id,
        tipo,
      },
    });

    if (historialExistente) {
      return;
    }

    const historial = this.historialRepository.create({
      boleto,
      boletoId: boleto.id,
      nodo,
      nodoId: nodo.id,
      tipo,
    });

    await this.historialRepository.save(historial);
  }

  private async registrarHistorialAbordaje(
    boleto: Boleto,
    rutaId: number,
    paraderoAbordajeId: number,
  ): Promise<void> {
    const nodoAbordaje = await this.buscarNodoPorRutaYParadero(
      rutaId,
      paraderoAbordajeId,
    );

    await this.registrarHistorial(
      boleto,
      nodoAbordaje,
      TipoValidacion.ABORDAJE,
    );
  }

  private async registrarHistorialDescenso(
    boleto: Boleto,
    rutaId: number,
    paraderoDescensoId: number,
  ): Promise<void> {
    const nodoDescenso = await this.buscarNodoPorRutaYParadero(
      rutaId,
      paraderoDescensoId,
    );

    await this.registrarHistorial(
      boleto,
      nodoDescenso,
      TipoValidacion.DESCENSO,
    );
  }

  // ─── HU-ENTR-2-003: Abordaje ───────────────────────────────────────────────
  async abordar(dto: CreateBoletoDto): Promise<{
    boleto: Boleto;
    saldoRestante: number | null;
    mensaje: string;
  }> {
    // 1. Verificar que la programación existe y está EN CURSO
    const programacion = await this.programacionRepo.findOne({
      where: { id: dto.programacionRutaId },
      relations: ['ruta', 'bus'],
    });

    if (!programacion) {
      throw new NotFoundException(
        `Programación #${dto.programacionRutaId} no encontrada`,
      );
    }

    if (programacion.estado !== EstadoProgramacion.EN_CURSO) {
      throw new BadRequestException(
        'La programación no está en curso actualmente',
      );
    }

    if (!programacion.ruta?.id) {
      throw new NotFoundException(
        'La programación no tiene una ruta asociada',
      );
    }

    // 2. Verificar capacidad del bus
    const boletosActivos = await this.boletoRepo.count({
      where: {
        programacionRutaId: dto.programacionRutaId,
        estado: EstadoBoleto.ACTIVO,
      },
    });

    const capacidad = programacion.bus?.capacidadMaximaPasajeros ?? 0;

    if (boletosActivos >= capacidad) {
      throw new BadRequestException(
        `El bus está lleno (${boletosActivos}/${capacidad} pasajeros). No se puede realizar el abordaje`,
      );
    }

    // 3. Validar ciudadano
    const ciudadano = await this.ciudadanoRepo.findOne({
      where: { id: dto.ciudadanoId },
    });

    if (!ciudadano) {
      throw new NotFoundException(
        `Ciudadano #${dto.ciudadanoId} no encontrado`,
      );
    }

    // 4. Validar método de pago
    const metodoPago = await this.metodoPagoRepo.findOne({
      where: { id: dto.metodoPagoCiudadanoId },
      relations: ['metodoPago', 'ciudadano'],
    });

    if (!metodoPago) {
      throw new NotFoundException(
        `Método de pago #${dto.metodoPagoCiudadanoId} no encontrado`,
      );
    }

    if (!metodoPago.activo) {
      throw new BadRequestException('El método de pago no está activo');
    }

    if (metodoPago.ciudadano?.id !== dto.ciudadanoId) {
      throw new BadRequestException(
        'El método de pago no pertenece al ciudadano indicado',
      );
    }

    const tarifa = Number(programacion.ruta?.tarifa ?? 0);
    let saldoRestante: number | null = null;

    // 5. Si es RECARGABLE: validar y descontar saldo
    if (metodoPago.metodoPago?.tipo === TipoMetodoPago.RECARGABLE) {
      const saldoActual = Number(metodoPago.saldo ?? 0);

      if (saldoActual < tarifa) {
        throw new BadRequestException(
          `Saldo insuficiente. Saldo actual: $${saldoActual.toFixed(2)}, Tarifa: $${tarifa.toFixed(2)}`,
        );
      }

      saldoRestante = parseFloat((saldoActual - tarifa).toFixed(2));
      metodoPago.saldo = saldoRestante;

      await this.metodoPagoRepo.save(metodoPago);
    }

    // 6. Validar paradero de abordaje
    const paraderoAbordaje = await this.paraderoRepo.findOne({
      where: { id: dto.paraderoAbordajeId },
    });

    if (!paraderoAbordaje) {
      throw new NotFoundException(
        `Paradero #${dto.paraderoAbordajeId} no encontrado`,
      );
    }

    // 7. Validar que ese paradero exista como nodo dentro de la ruta
    await this.buscarNodoPorRutaYParadero(
      programacion.ruta.id,
      dto.paraderoAbordajeId,
    );

    // 8. Crear boleto
    const boleto = this.boletoRepo.create({
      ciudadanoId: dto.ciudadanoId,
      programacionRutaId: dto.programacionRutaId,
      metodoPagoCiudadanoId: dto.metodoPagoCiudadanoId,
      paraderoAbordajeId: dto.paraderoAbordajeId,
      montoTarifa: tarifa,
      saldoRestante,
      timestampAbordaje: new Date(),
      estado: EstadoBoleto.ACTIVO,
    });

    const boletoCreado = await this.boletoRepo.save(boleto);

    if (!boletoCreado.id) {
      throw new InternalServerErrorException(
        'No se pudo obtener el ID del boleto creado',
      );
    }

    // 9. Crear historial automático de abordaje
    await this.registrarHistorialAbordaje(
      boletoCreado,
      programacion.ruta.id,
      dto.paraderoAbordajeId,
    );

    return {
      boleto: await this.findOne(boletoCreado.id),
      saldoRestante,
      mensaje: 'Abordaje exitoso',
    };
  }

  // ─── HU-ENTR-2-004: Descenso ───────────────────────────────────────────────
  async descender(id: number, dto: DescensoBoletoDto): Promise<{
    boleto: Boleto;
    mensaje: string;
  }> {
    // 1. Buscar boleto y verificar que está activo
    const boleto = await this.boletoRepo.findOne({
      where: { id },
      relations: [
        'programacionRuta',
        'programacionRuta.ruta',
        'ciudadano',
        'metodoPagoCiudadano',
        'paraderoAbordaje',
        'paraderoDescenso',
      ],
    });

    if (!boleto) {
      throw new NotFoundException(`Boleto #${id} no encontrado`);
    }

    if (boleto.estado !== EstadoBoleto.ACTIVO) {
      throw new BadRequestException(
        'El boleto no está activo; no se puede registrar el descenso',
      );
    }

    if (!boleto.programacionRuta?.ruta?.id) {
      throw new NotFoundException(
        'No se pudo obtener la ruta asociada al boleto',
      );
    }

    // 2. Validar paradero de descenso
    const paraderoDescenso = await this.paraderoRepo.findOne({
      where: { id: dto.paraderoDescensoId },
    });

    if (!paraderoDescenso) {
      throw new NotFoundException(
        `Paradero #${dto.paraderoDescensoId} no encontrado`,
      );
    }

    // 3. Validar que ese paradero exista como nodo dentro de la ruta
    await this.buscarNodoPorRutaYParadero(
      boleto.programacionRuta.ruta.id,
      dto.paraderoDescensoId,
    );

    // 4. Cerrar viaje
    boleto.paraderoDescensoId = dto.paraderoDescensoId;
    boleto.timestampDescenso = new Date();
    boleto.estado = EstadoBoleto.COMPLETADO;

    const boletoActualizado = await this.boletoRepo.save(boleto);

    if (!boletoActualizado.id) {
      throw new InternalServerErrorException(
        'No se pudo obtener el ID del boleto actualizado',
      );
    }

    // 5. Crear historial automático de descenso
    await this.registrarHistorialDescenso(
      boletoActualizado,
      boleto.programacionRuta.ruta.id,
      dto.paraderoDescensoId,
    );

    return {
      boleto: await this.findOne(boletoActualizado.id),
      mensaje: 'Viaje completado - Gracias por usar nuestro servicio',
    };
  }

  // ─── Consultas ─────────────────────────────────────────────────────────────
  async findAll(): Promise<Boleto[]> {
    return this.boletoRepo.find({
      relations: [
        'ciudadano',
        'programacionRuta',
        'programacionRuta.ruta',
        'programacionRuta.bus',
        'metodoPagoCiudadano',
        'paraderoAbordaje',
        'paraderoDescenso',
      ],
      order: { creadoEn: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Boleto> {
    const boleto = await this.boletoRepo.findOne({
      where: { id },
      relations: [
        'ciudadano',
        'programacionRuta',
        'programacionRuta.ruta',
        'programacionRuta.bus',
        
        'metodoPagoCiudadano',
        'paraderoAbordaje',
        'paraderoDescenso',
      ],
    });

    if (!boleto) {
      throw new NotFoundException(`Boleto #${id} no encontrado`);
    }

    return boleto;
  }

  async findByCiudadano(ciudadanoId: number): Promise<Boleto[]> {
    return this.boletoRepo.find({
      where: { ciudadanoId },
      relations: [
        'programacionRuta',
        'programacionRuta.ruta',
        'programacionRuta.bus',
        'metodoPagoCiudadano',
        'paraderoAbordaje',
        'paraderoDescenso',
      ],
      order: { creadoEn: 'DESC' },
    });
  }

  async findByProgramacion(programacionRutaId: number): Promise<Boleto[]> {
    return this.boletoRepo.find({
      where: { programacionRutaId },
      relations: ['ciudadano', 'paraderoAbordaje', 'paraderoDescenso'],
    });
  }
  async ingresosPorMetodo(meses: number): Promise<any> {
  const fechaInicio = new Date();
  fechaInicio.setMonth(fechaInicio.getMonth() - meses);

  const boletos = await this.boletoRepo.find({
    where: {
      estado: EstadoBoleto.COMPLETADO,
      creadoEn: Between(fechaInicio, new Date()),
    },
    relations: ['metodoPagoCiudadano', 'metodoPagoCiudadano.metodoPago'],
  });

  // Agrupar por mes y tipo de método de pago
  const resultado: Record<string, Record<string, number>> = {};

  for (const boleto of boletos) {
    const fecha = new Date(boleto.creadoEn);
    const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    const tipo = boleto.metodoPagoCiudadano?.metodoPago?.tipo ?? 'desconocido';
    const monto = Number(boleto.montoTarifa ?? 0);

    if (!resultado[mes]) resultado[mes] = {};
    resultado[mes][tipo] = (resultado[mes][tipo] ?? 0) + monto;
  }

  // Ordenar por mes
  const mesesOrdenados = Object.keys(resultado).sort();
  const tiposUnicos = [...new Set(boletos.map(
    b => b.metodoPagoCiudadano?.metodoPago?.tipo ?? 'desconocido'
  ))];

  // Total por método
  const totalesPorMetodo: Record<string, number> = {};
  for (const tipo of tiposUnicos) {
    totalesPorMetodo[tipo] = mesesOrdenados.reduce(
      (acc, mes) => acc + (resultado[mes][tipo] ?? 0), 0
    );
  }

  return {
    meses: mesesOrdenados,
    tipos: tiposUnicos,
    datos: resultado,
    totalesPorMetodo,
    totalGeneral: Object.values(totalesPorMetodo).reduce((a, b) => a + b, 0),
  };
  
}

}