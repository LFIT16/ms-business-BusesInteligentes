import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository }       from 'typeorm';

import { Boleto }              from './entities/boleto.entity';
import { ProgramacionRuta }    from '../programaciones-ruta/entities/programacion-ruta.entity';
import { MetodoPagoCiudadano } from '../metodos-pago-ciudadano/entities/metodos-pago-ciudadano.entity';
import { Paradero }            from '../paradero/entities/paradero.entity';
import { Ciudadano }           from '../ciudadanos/entities/ciudadano.entity';

import { CreateBoletoDto }  from './dto/create- boleto.dto';
import { DescensoBoletoDto } from './dto/descenso-boleto.dto';
import { EstadoBoleto }      from './enums/estado-boleto.enum';
import { EstadoProgramacion } from '../programaciones-ruta/enums/estado-programacion.enum';
import { TipoMetodoPago }    from '../metodos-pago/enums/tipo-metodo-pago.enum';

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
  ) {}

  // ─── HU-ENTR-2-003: Abordaje ───────────────────────────────────────────────
  async abordar(dto: CreateBoletoDto): Promise<{
    boleto: Boleto; saldoRestante: number | null; mensaje: string;
  }> {

    // 1. Verificar que la programación existe y está EN CURSO
    const programacion = await this.programacionRepo.findOne({
      where: { id: dto.programacionRutaId },
      // ruta y bus son eager en ProgramacionRuta → se cargan solos
    });
    if (!programacion)
      throw new NotFoundException(`Programación #${dto.programacionRutaId} no encontrada`);
    if (programacion.estado !== EstadoProgramacion.EN_CURSO)
      throw new BadRequestException('La programación no está en curso actualmente');

    // 2. Verificar capacidad del bus
    const boletosActivos = await this.boletoRepo.count({
      where: { programacionRutaId: dto.programacionRutaId, estado: EstadoBoleto.ACTIVO },
    });
    const capacidad = programacion.bus?.capacidadMaximaPasajeros ?? 0;
    if (boletosActivos >= capacidad)
      throw new BadRequestException(
        `El bus está lleno (${boletosActivos}/${capacidad} pasajeros). No se puede realizar el abordaje`,
      );

    // 3. Validar ciudadano
    const ciudadano = await this.ciudadanoRepo.findOne({ where: { id: dto.ciudadanoId } });
    if (!ciudadano)
      throw new NotFoundException(`Ciudadano #${dto.ciudadanoId} no encontrado`);

    // 4. Validar método de pago
    const metodoPago = await this.metodoPagoRepo.findOne({
      where: { id: dto.metodoPagoCiudadanoId },
      relations: ['metodoPago'],
    });
    if (!metodoPago)
      throw new NotFoundException(`Método de pago #${dto.metodoPagoCiudadanoId} no encontrado`);
    if (!metodoPago.activo)
      throw new BadRequestException('El método de pago no está activo');

    const tarifa = Number(programacion.ruta?.tarifa ?? 0);
    let saldoRestante: number | null = null;

    // 5. Si es RECARGABLE: validar y descontar saldo
    if (metodoPago.metodoPago?.tipo === TipoMetodoPago.RECARGABLE) {
      const saldoActual = Number(metodoPago.saldo ?? 0);
      if (saldoActual < tarifa)
        throw new BadRequestException(
          `Saldo insuficiente. Saldo actual: $${saldoActual.toFixed(2)}, Tarifa: $${tarifa.toFixed(2)}`,
        );
      saldoRestante = parseFloat((saldoActual - tarifa).toFixed(2));
      metodoPago.saldo = saldoRestante;
      await this.metodoPagoRepo.save(metodoPago);
    }

    // 6. Validar paradero de abordaje
    const paraderoAbordaje = await this.paraderoRepo.findOne({ where: { id: dto.paraderoAbordajeId } });
    if (!paraderoAbordaje)
      throw new NotFoundException(`Paradero #${dto.paraderoAbordajeId} no encontrado`);

    // 7. Crear boleto
    const boleto = this.boletoRepo.create({
      ciudadanoId:          dto.ciudadanoId,
      programacionRutaId:   dto.programacionRutaId,
      metodoPagoCiudadanoId: dto.metodoPagoCiudadanoId,
      paraderoAbordajeId:   dto.paraderoAbordajeId,
      montoTarifa:          tarifa,
      saldoRestante,
      timestampAbordaje:    new Date(),
      estado:               EstadoBoleto.ACTIVO,
    });

    const boletoCreadо = await this.boletoRepo.save(boleto);

    return {
      boleto: boletoCreadо,
      saldoRestante,
      mensaje: 'Abordaje exitoso',
    };
  }

  // ─── HU-ENTR-2-004: Descenso ───────────────────────────────────────────────
  async descender(id: number, dto: DescensoBoletoDto): Promise<{
    boleto: Boleto; mensaje: string;
  }> {

    // 1. Buscar boleto y verificar que está activo
    const boleto = await this.findOne(id);
    if (boleto.estado !== EstadoBoleto.ACTIVO)
      throw new BadRequestException('El boleto no está activo; no se puede registrar el descenso');

    // 2. Validar paradero de descenso
    const paraderoDescenso = await this.paraderoRepo.findOne({ where: { id: dto.paraderoDescensoId } });
    if (!paraderoDescenso)
      throw new NotFoundException(`Paradero #${dto.paraderoDescensoId} no encontrado`);

    // 3. Cerrar viaje
    boleto.paraderoDescensoId = dto.paraderoDescensoId;
    boleto.timestampDescenso  = new Date();
    boleto.estado             = EstadoBoleto.COMPLETADO;

    const boletoActualizado = await this.boletoRepo.save(boleto);

    return {
      boleto: boletoActualizado,
      mensaje: 'Viaje completado - Gracias por usar nuestro servicio',
    };
  }

  // ─── Consultas ─────────────────────────────────────────────────────────────
  async findAll(): Promise<Boleto[]> {
    return this.boletoRepo.find({
      relations: ['ciudadano', 'programacionRuta', 'metodoPagoCiudadano',
                  'paraderoAbordaje', 'paraderoDescenso'],
      order: { creadoEn: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Boleto> {
    const boleto = await this.boletoRepo.findOne({
      where: { id },
      relations: ['ciudadano', 'programacionRuta', 'metodoPagoCiudadano',
                  'paraderoAbordaje', 'paraderoDescenso'],
    });
    if (!boleto) throw new NotFoundException(`Boleto #${id} no encontrado`);
    return boleto;
  }

  async findByCiudadano(ciudadanoId: number): Promise<Boleto[]> {
    return this.boletoRepo.find({
      where: { ciudadanoId },
      relations: ['programacionRuta', 'metodoPagoCiudadano',
                  'paraderoAbordaje', 'paraderoDescenso'],
      order: { creadoEn: 'DESC' },
    });
  }

  async findByProgramacion(programacionRutaId: number): Promise<Boleto[]> {
    return this.boletoRepo.find({
      where: { programacionRutaId },
      relations: ['ciudadano', 'paraderoAbordaje', 'paraderoDescenso'],
    });
  }
}