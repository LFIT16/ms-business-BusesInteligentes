import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository }       from 'typeorm';

import { Incidente }      from './entities/incidente.entity';
import { IncidentesBus }  from '../incidentes-bus/entities/incidentes-bus.entity';
import { Foto }           from '../fotos/entities/foto.entity';

import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { GravedadIncidente }  from './enums/gravedad-incidente.enum';

@Injectable()
export class IncidentesService {
  constructor(
    @InjectRepository(Incidente)
    private readonly incidenteRepo: Repository<Incidente>,

    @InjectRepository(IncidentesBus)
    private readonly incidenteBusRepo: Repository<IncidentesBus>,

    @InjectRepository(Foto)
    private readonly fotoRepo: Repository<Foto>,
  ) {}

  // ─── HU-ENTR-2-007: Reportar incidente ────────────────────────────────────
  async reportar(dto: CreateIncidenteDto): Promise<Incidente> {

    // 1. Crear incidente
    const incidente = this.incidenteRepo.create({
      tipo:        dto.tipo,
      gravedad:    dto.gravedad,
      descripcion: dto.descripcion,
      conductorId: dto.conductorId,
      turnoId:     dto.turnoId,
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

    return incidenteGuardado;
  }

  // ─── HU-ENTR-2-008: Consulta por bus ──────────────────────────────────────
  async findByBus(
    busId: number,
    tipo?: string,
    estado?: string,
  ): Promise<any[]> {
    const incidentesBus = await this.incidenteBusRepo.find({
      where: { busId },
      relations: ['fotos'],
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
        fotos:          ib.fotos,
      });
    }

    return resultado;
  }

  async getStatsByBus(busId: number): Promise<any> {
    const incidentes = await this.findByBus(busId);
    const total      = incidentes.length;
    const resueltos  = incidentes.filter(i => i.estado === 'resuelto').length;

    const porTipo: Record<string, number> = {};
    for (const i of incidentes) {
      porTipo[i.tipo] = (porTipo[i.tipo] || 0) + 1;
    }

    return {
      total,
      resueltos,
      tasaResolucion: total > 0 ? Math.round((resueltos / total) * 100) : 0,
      porTipo,
    };
  }

  async findOne(id: number): Promise<Incidente> {
    const incidente = await this.incidenteRepo.findOne({ where: { id } });
    if (!incidente)
      throw new NotFoundException(`Incidente #${id} no encontrado`);
    return incidente;
  }

  async update(id: number, dto: UpdateIncidenteDto): Promise<Incidente> {
    const incidente = await this.findOne(id);
    if (dto.estado)     incidente.estado     = dto.estado;
    if (dto.comentario !== undefined) incidente.comentario = dto.comentario;
    return this.incidenteRepo.save(incidente);
  }
}