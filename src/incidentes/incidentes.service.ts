import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository }       from 'typeorm';

import { Incidente }      from './entities/incidente.entity';
import { IncidentesBus }  from '../incidentes-bus/entities/incidentes-bus.entity';
import { Foto }           from '../fotos/entities/foto.entity';

import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { GravedadIncidente }  from './enums/gravedad-incidente.enum';
import { Turno } from '../turnos/entities/turno.entity';
import { GpsService } from '../gps/gps.service';
import { EstadoIncidente } from './enums/estado-incidente.enum';

@Injectable()
export class IncidentesService {
  constructor(
    @InjectRepository(Incidente)
    private readonly incidenteRepo: Repository<Incidente>,

    @InjectRepository(IncidentesBus)
    private readonly incidenteBusRepo: Repository<IncidentesBus>,

    @InjectRepository(Foto)
    private readonly fotoRepo: Repository<Foto>,

    @InjectRepository(Turno)
    private readonly turnoRepo: Repository<Turno>,

    private readonly gpsService: GpsService,
  ) {}

  // ─── HU-ENTR-2-007: Reportar incidente ────────────────────────────────────
  async reportar(dto: CreateIncidenteDto): Promise<Incidente> {

    const gps = await this.obtenerGpsDelBus(dto.busId);
    const turno = await this.obtenerTurnoActivoDelBus(dto.busId);

    const conductorId = dto.conductorId || turno?.conductorId || null;
    const turnoId = dto.turnoId || turno?.id || null;
    
    // 1. Crear incidente
    const incidente = this.incidenteRepo.create({
      tipo:        dto.tipo,
      gravedad:    dto.gravedad,
      descripcion: dto.descripcion,
      conductorId: dto.conductorId,
      turnoId:     dto.turnoId,
      gpsId: gps.id,
      latitud: gps.latitud !== null ? Number(gps.latitud) : null,
      longitud: gps.longitud !== null ? Number(gps.longitud) : null,
      fechaGps: gps.ultimaActualizacion || new Date(),
    });
    const incidenteGuardado = await this.incidenteRepo.save(incidente);

    // 2. Crear IncidentesBus
    const incidenteBus = this.incidenteBusRepo.create({
      busId:       dto.busId,
      incidenteId: incidenteGuardado.id,
    });
    const incidenteBusGuardado = await this.incidenteBusRepo.save(incidenteBus);

    // 3. Guardar fotos vinculadas al IncidentesBus (máx 5)
    if (dto.fotos && dto.fotos.length > 0) {
      const fotosAGuardar = dto.fotos.slice(0, 5).map(f =>
        this.fotoRepo.create({
          urlFoto:        f.urlFoto,
          descripcion:    f.descripcion,
          incidenteBusId: incidenteBusGuardado.id,
        })
      );
      await this.fotoRepo.save(fotosAGuardar);
    }

    // 4. Notificación si gravedad es alta o crítica
    if (
      dto.gravedad === GravedadIncidente.ALTO ||
      dto.gravedad === GravedadIncidente.CRITICO
    ) {
      console.warn(
        `⚠️ [ALERTA SUPERVISOR] Incidente ${dto.gravedad.toUpperCase()} ` +
        `reportado en Bus #${dto.busId}. Tipo: ${dto.tipo}. ` +
        `Incidente #${incidenteGuardado.id}`,
      );
      // TODO: Implementar notificación real cuando exista módulo Empresa/Supervisor
    }

    return await this.findOneDetallado(incidenteGuardado.id);
  }

  private async obtenerGpsDelBus(busId: number) {
    try {
      const gps = await this.gpsService.findByBus(busId);

      if (!gps.activo) {
        throw new BadRequestException(
          'El GPS del bus está inactivo. No se puede registrar la ubicación del incidente.',
        );
      }

      if (gps.latitud === null || gps.longitud === null) {
        throw new BadRequestException(
          'El GPS del bus no tiene ubicación registrada.',
        );
      }

      return gps;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'El bus no tiene GPS asignado. No se puede reportar el incidente.',
      );
    }
  }

  private async obtenerTurnoActivoDelBus(busId: number): Promise<Turno | null> {
    const turnos = await this.turnoRepo.find({
      where: {
        busId,
      },
      order: {
        id: 'DESC',
      },
    });

    const ahora = new Date();

    const turnoActivo = turnos.find(turno => {
      const inicio = new Date(turno.horaInicio);
      const fin = new Date(turno.horaFin);

      return (
        turno.estadoTurno === 'en_curso' ||
        (ahora >= inicio && ahora <= fin)
      );
    });

    return turnoActivo || null;
  }

  // ─── HU-ENTR-2-008: Consulta por bus ──────────────────────────────────────
  async findByBus(
    busId: number,
    tipo?: string,
    estado?: string,
  ): Promise<any[]> {
    const incidentesBus = await this.incidenteBusRepo.find({
      where: { busId },
      relations: ['bus', 'fotos', 'incidente'],
      order: { fechaRegistro: 'DESC' },
    });

    const resultado: any[] = [];

    for (const ib of incidentesBus) {
      const incidente = await this.incidenteRepo.findOne({
        where: { id: ib.incidenteId },
      });
      if (!incidente) continue;
      if (tipo   && incidente.tipo   !== tipo)   continue;
      if (estado && incidente.estado !== estado) continue;

      resultado.push({
        ...incidente,
        incidenteBusId: ib.id,
        bus: ib.bus,
        fotos: ib.fotos || [],
        fechaRegistroBus: ib.fechaRegistro,
      });
    }

    return resultado;
  }

  async getStatsByBus(busId: number): Promise<any> {
    const incidentes = await this.findByBus(busId);

    const total = incidentes.length;

    const resueltos = incidentes.filter(
      incidente => incidente.estado === EstadoIncidente.RESUELTO,
    ).length;

    const pendientes = incidentes.filter(
      incidente => incidente.estado === EstadoIncidente.PENDIENTE,
    ).length;

    const enRevision = incidentes.filter(
      incidente => incidente.estado === EstadoIncidente.EN_REVISION,
    ).length;

    const porTipo: Record<string, number> = {};

    for (const incidente of incidentes) {
      porTipo[incidente.tipo] =
        (porTipo[incidente.tipo] || 0) + 1;
    }

    return {
      total,
      pendientes,
      enRevision,
      resueltos,
      tasaResolucion:
        total > 0
          ? Math.round((resueltos / total) * 100)
          : 0,
      porTipo,
    };
  }

  async findOne(id: number): Promise<Incidente> {
    const incidente = await this.incidenteRepo.findOne({
      where: { id },
    });

    if (!incidente) {
      throw new NotFoundException(`Incidente #${id} no encontrado`);
    }

    return incidente;
  }

  async findOneDetallado(id: number): Promise<any> {
    const incidente = await this.findOne(id);

    const incidenteBus = await this.incidenteBusRepo.findOne({
      where: {
        incidenteId: id,
      },
      relations: [
        'bus',
        'fotos',
      ],
    });

    return {
      ...incidente,
      incidenteBusId: incidenteBus?.id || null,
      bus: incidenteBus?.bus || null,
      fotos: incidenteBus?.fotos || [],
    };
  }

  async update(id: number, dto: UpdateIncidenteDto): Promise<Incidente> {
    const incidente = await this.findOne(id);

    if (dto.estado) {
      incidente.estado = dto.estado;
    }

    if (dto.comentario !== undefined) {
      incidente.comentario = dto.comentario;
    }

    return await this.incidenteRepo.save(incidente);
  }
}