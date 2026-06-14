import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Gps } from './entities/gps.entity';
import { CreateGpsDto } from './dto/create-gps.dto';
import { UpdateGpsDto } from './dto/update-gps.dto';
import { IncidentesBus } from '../incidentes-bus/entities/incidentes-bus.entity';
import { EstadoIncidente } from '../incidentes/enums/estado-incidente.enum';

@Injectable()
export class GpsService {
  constructor(
    @InjectRepository(Gps)
    private readonly gpsRepository: Repository<Gps>,

    @InjectRepository(IncidentesBus)
    private readonly incidentesBusRepository: Repository<IncidentesBus>,
  ) {}

  async create(createGpsDto: CreateGpsDto): Promise<Gps> {
    const existeCodigo = await this.gpsRepository.findOne({
      where: {
        codigo: createGpsDto.codigo,
      },
    });

    if (existeCodigo) {
      throw new BadRequestException(
        'Ya existe un GPS con este código.',
      );
    }

    const existeBus = await this.gpsRepository.findOne({
      where: {
        busId: Number(createGpsDto.busId),
      },
    });

    if (existeBus) {
      throw new BadRequestException(
        'Este bus ya tiene un GPS asignado.',
      );
    }

    const gps = this.gpsRepository.create({
      codigo: createGpsDto.codigo,
      busId: Number(createGpsDto.busId),
      latitud: createGpsDto.latitud ?? null,
      longitud: createGpsDto.longitud ?? null,
      velocidad: createGpsDto.velocidad ?? null,
      rumbo: createGpsDto.rumbo ?? null,
      activo: createGpsDto.activo ?? true,
      ultimaActualizacion:
        createGpsDto.latitud !== undefined &&
        createGpsDto.longitud !== undefined
          ? new Date()
          : null,
    });

    return await this.gpsRepository.save(gps);
  }

  async findAll(): Promise<Gps[]> {
    return await this.gpsRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async findUbicacionesActivas(): Promise<Gps[]> {
    return await this.gpsRepository.find({
      where: { activo: true },
      relations: ['bus'],
      order: {
        ultimaActualizacion: 'DESC',
      },
    });
  }

  async tieneIncidenteActivo(busId: number): Promise<boolean> {
    const incidente = await this.incidentesBusRepository
      .createQueryBuilder('ib')
      .innerJoin('ib.incidente', 'incidente')
      .where('ib.busId = :busId', { busId })
      .andWhere('incidente.estado != :resuelto', {
        resuelto: EstadoIncidente.RESUELTO,
      })
      .getOne();

    return !!incidente;
  }

  async findOne(id: number): Promise<Gps> {
    const gps = await this.gpsRepository.findOne({
      where: { id },
    });

    if (!gps) {
      throw new NotFoundException('GPS no encontrado.');
    }

    return gps;
  }

  async findByBus(busId: number): Promise<Gps> {
    const gps = await this.gpsRepository.findOne({
      where: {
        busId,
      },
      relations: ['bus'],
    });

    if (!gps) {
      throw new NotFoundException(
        'Este bus no tiene GPS asignado.',
      );
    }

    return gps;
  }

  async update(id: number, updateGpsDto: UpdateGpsDto): Promise<Gps> {
    const gps = await this.findOne(id);

    if (
      updateGpsDto.codigo &&
      updateGpsDto.codigo !== gps.codigo
    ) {
      const existeCodigo = await this.gpsRepository.findOne({
        where: {
          codigo: updateGpsDto.codigo,
        },
      });

      if (existeCodigo) {
        throw new BadRequestException(
          'Ya existe un GPS con este código.',
        );
      }
    }

    if (
      updateGpsDto.busId &&
      Number(updateGpsDto.busId) !== gps.busId
    ) {
      const existeBus = await this.gpsRepository.findOne({
        where: {
          busId: Number(updateGpsDto.busId),
        },
      });

      if (existeBus) {
        throw new BadRequestException(
          'Este bus ya tiene un GPS asignado.',
        );
      }
    }

    gps.codigo = updateGpsDto.codigo ?? gps.codigo;
    gps.busId = updateGpsDto.busId
      ? Number(updateGpsDto.busId)
      : gps.busId;
    gps.latitud =
      updateGpsDto.latitud !== undefined
        ? Number(updateGpsDto.latitud)
        : gps.latitud;
    gps.longitud =
      updateGpsDto.longitud !== undefined
        ? Number(updateGpsDto.longitud)
        : gps.longitud;
    gps.velocidad =
      updateGpsDto.velocidad !== undefined
        ? Number(updateGpsDto.velocidad)
        : gps.velocidad;
    gps.rumbo =
      updateGpsDto.rumbo !== undefined
        ? Number(updateGpsDto.rumbo)
        : gps.rumbo;
    gps.activo =
      updateGpsDto.activo !== undefined
        ? updateGpsDto.activo
        : gps.activo;

    if (
      updateGpsDto.latitud !== undefined &&
      updateGpsDto.longitud !== undefined
    ) {
      gps.ultimaActualizacion = new Date();
    }

    return await this.gpsRepository.save(gps);
  }

  async activarGpsDelBus(busId: number): Promise<Gps> {
    const gps = await this.findByBus(busId);

    gps.activo = true;
    gps.ultimaActualizacion = new Date();

    return await this.gpsRepository.save(gps);
  }

  async desactivarGpsDelBus(busId: number): Promise<Gps> {
    const gps = await this.findByBus(busId);

    gps.activo = false;
    gps.ultimaActualizacion = new Date();

    return await this.gpsRepository.save(gps);
  }

  async actualizarUbicacion(
    busId: number,
    latitud: number,
    longitud: number,
    velocidad?: number,
    rumbo?: number,
  ): Promise<Gps> {
    const gps = await this.findByBus(busId);

    if (!gps.activo) {
      throw new BadRequestException(
        'El GPS del bus no está activo.',
      );
    }

    gps.latitud = Number(latitud);
    gps.longitud = Number(longitud);
    gps.velocidad =
      velocidad !== undefined ? Number(velocidad) : gps.velocidad;
    gps.rumbo = rumbo !== undefined ? Number(rumbo) : gps.rumbo;
    gps.ultimaActualizacion = new Date();

    return await this.gpsRepository.save(gps);
  }

  async simularMovimiento(busId: number): Promise<Gps> {
    const gps = await this.findByBus(busId);

    if (!gps.activo) {
      throw new BadRequestException(
        'El GPS del bus no está activo.',
      );
    }

    const latitudActual = Number(gps.latitud || 5.0569);
    const longitudActual = Number(gps.longitud || -75.487);

    const movimientoLat = (Math.random() - 0.5) * 0.012;
    const movimientoLng = (Math.random() - 0.5) * 0.012;

    gps.latitud = Number((latitudActual + movimientoLat).toFixed(7));
    gps.longitud = Number((longitudActual + movimientoLng).toFixed(7));
    gps.velocidad = Number((20 + Math.random() * 25).toFixed(2));
    gps.rumbo = Number((Math.random() * 360).toFixed(2));
    gps.ultimaActualizacion = new Date();

    return await this.gpsRepository.save(gps);
  }

  async remove(id: number): Promise<{ message: string }> {
    const gps = await this.findOne(id);

    await this.gpsRepository.remove(gps);

    return {
      message: 'GPS eliminado correctamente.',
    };
  }
}