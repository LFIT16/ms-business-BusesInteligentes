import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Recargas } from './entities/recargas.entity';
import { CreateRecargasDto } from './dto/create-recargas.dto';
import { EstadoRecarga } from './enums/estado-recarga.enum';
import { MetodoPagoCiudadano } from '../metodos-pago-ciudadano/entities/metodos-pago-ciudadano.entity';
import { TipoMetodoPago } from 'src/metodos-pago/enums/tipo-metodo-pago.enum';
import { EpaycoService } from 'src/epayco/epayco.service';

@Injectable()
export class RecargasService {
  constructor(
    @InjectRepository(Recargas)
    private readonly recargasRepository: Repository<Recargas>,

    @InjectRepository(MetodoPagoCiudadano)
    private readonly metodoPagoCiudadanoRepository: Repository<MetodoPagoCiudadano>,

    private readonly epaycoService: EpaycoService,
  ) {}

  private generarReferenciaInterna(): string {
    return `REC-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  private calcularComision(monto: number): number {
    return 0;
  }

  async create(createRecargaDto: CreateRecargasDto): Promise<any> {
    const metodoPagoCiudadano =
      await this.metodoPagoCiudadanoRepository.findOne({
        where: {
          id: createRecargaDto.metodoPagoCiudadanoId,
        },
        relations: ['metodoPago', 'ciudadano'],
      });

    if (!metodoPagoCiudadano) {
      throw new NotFoundException('La tarjeta recargable no existe');
    }

    if (!metodoPagoCiudadano.activo) {
      throw new BadRequestException('La tarjeta no está activa');
    }

    if (metodoPagoCiudadano.metodoPago?.tipo !== TipoMetodoPago.RECARGABLE) {
      throw new BadRequestException(
        'Solo se pueden recargar tarjetas de tipo recargable',
      );
    }

    const monto = Number(createRecargaDto.monto);
    const comision = this.calcularComision(monto);
    const totalPagar = monto + comision;

    const recarga = this.recargasRepository.create({
      metodoPagoCiudadano,
      metodoPagoCiudadanoId: metodoPagoCiudadano.id,
      monto,
      comision,
      totalPagar,
      estado: EstadoRecarga.PENDIENTE,
      referenciaInterna: this.generarReferenciaInterna(),
      aplicada: false,
    });

    const recargaGuardada = await this.recargasRepository.save(recarga);

    if (!recargaGuardada.id || !recargaGuardada.referenciaInterna) {
      throw new BadRequestException(
        'No se pudo generar la información de la recarga para ePayco',
      );
    }

    const checkoutData = this.epaycoService.crearDatosCheckout({
      referenciaInterna: recargaGuardada.referenciaInterna,
      monto: totalPagar,
      descripcion: `Recarga tarjeta transporte #${recargaGuardada.referenciaInterna}`,
      email: 'usuario@correo.com',
      recargaId: recargaGuardada.id,
    });

    return {
      ...recargaGuardada,
      checkoutData,
    };
  }

  async findAll(): Promise<Recargas[]> {
    return await this.recargasRepository.find({
      relations: [
        'metodoPagoCiudadano',
        'metodoPagoCiudadano.ciudadano',
        'metodoPagoCiudadano.metodoPago',
      ],
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Recargas> {
    const recarga = await this.recargasRepository.findOne({
      where: { id },
      relations: [
        'metodoPagoCiudadano',
        'metodoPagoCiudadano.ciudadano',
        'metodoPagoCiudadano.metodoPago',
      ],
    });

    if (!recarga) {
      throw new NotFoundException(`Recarga #${id} no encontrada`);
    }

    return recarga;
  }

  async aplicarRecarga(id: number): Promise<Recargas> {
    const recarga = await this.recargasRepository.findOne({
      where: { id },
      relations: ['metodoPagoCiudadano'],
    });

    if (!recarga) {
      throw new NotFoundException(`Recarga #${id} no encontrada`);
    }

    if (recarga.aplicada) {
      return recarga;
    }

    const tarjeta = recarga.metodoPagoCiudadano;

    if (!tarjeta) {
      throw new BadRequestException('La recarga no tiene tarjeta asociada');
    }

    const saldoActual = Number(tarjeta.saldo ?? 0);
    const monto = Number(recarga.monto ?? 0);

    tarjeta.saldo = saldoActual + monto;

    recarga.estado = EstadoRecarga.APROBADA;
    recarga.aplicada = true;

    await this.metodoPagoCiudadanoRepository.save(tarjeta);

    return await this.recargasRepository.save(recarga);
  }

    async confirmacionEpayco(body: any): Promise<{ received: boolean }> {

      const referenciaInterna =
        body.x_id_invoice ||
        body.x_id_factura ||
        body.x_extra2;

      const refPayco = body.x_ref_payco;
      const transactionId = body.x_transaction_id;
      const response = body.x_response;

      if (!referenciaInterna) {
        console.log('Confirmación sin referencia interna');
        return { received: true };
      }

      const recarga = await this.recargasRepository.findOne({
        where: {
          referenciaInterna,
        },
        relations: ['metodoPagoCiudadano'],
      });

      if (!recarga) {
        console.log('No se encontró recarga con referencia:', referenciaInterna);
        return { received: true };
      }

      recarga.referenciaEpayco = refPayco;
      recarga.transaccionEpayco = transactionId;
      recarga.payloadEpayco = body;

      if (response === 'Aceptada' || response === 'Aprobada') {
        await this.aplicarRecarga(recarga.id!);
      } else if (response === 'Rechazada') {
        recarga.estado = EstadoRecarga.RECHAZADA;
        await this.recargasRepository.save(recarga);
      } else {
        recarga.estado = EstadoRecarga.FALLIDA;
        await this.recargasRepository.save(recarga);
      }

      return { received: true };
    }

  async respuestaEpayco(query: any, res: any): Promise<any> {
    console.log('Respuesta ePayco recibida:', query);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

    return res.redirect(`${frontendUrl}/#/recargas/list`);
  }

  async findByCiudadano(ciudadanoId: number) {
    return await this.recargasRepository.find({
      where: {
        metodoPagoCiudadano: {
          ciudadano: {
            id: ciudadanoId,
          },
        },
      },
      relations: [
        'metodoPagoCiudadano',
        'metodoPagoCiudadano.ciudadano',
        'metodoPagoCiudadano.metodoPago',
      ],
      order: {
        id: 'DESC',
      },
    });
  }
}