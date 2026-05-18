import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgramacionRuta } from './entities/programacion-ruta.entity';
import { Turno } from '../turnos/entities/turno.entity';
import { CreateProgramacionRutaDto } from './dto/create-programacion-ruta.dto';
import { UpdateProgramacionRutaDto } from './dto/update-programacion-ruta.dto';
import { EstadoProgramacion } from './enums/estado-programacion.enum';
import { EstadoTurno } from '../turnos/enums/estado-turno.enum';
import { Recurrencia } from './enums/recurrencia.enum';

@Injectable()
export class ProgramacionesRutaService {
  constructor(
    @InjectRepository(ProgramacionRuta)
    private readonly repo: Repository<ProgramacionRuta>,

    @InjectRepository(Turno)
    private readonly turnosRepo: Repository<Turno>,
  ) {}

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async findOrFail(id: number): Promise<ProgramacionRuta> {
    const prog = await this.repo.findOne({ where: { id } });
    if (!prog) throw new NotFoundException(`Programación #${id} no encontrada`);
    return prog;
  }

  /**
   * Convierte fecha (YYYY-MM-DD) + hora (HH:mm) a objeto Date para comparaciones.
   */
  private toDateTime(fecha: string, hora: string): Date {
    return new Date(`${fecha}T${hora.length === 5 ? hora + ':00' : hora}`);
  }

  /**
   * Valida que el bus no tenga otra programación activa en el mismo horario.
   * Se considera que dos programaciones solapan si son el mismo bus,
   * la misma fecha y la misma horaSalida (dentro de tolerancia).
   */
  private async validarSolapamientoBus(
    busId: number,
    fechaSalida: string,
    horaSalida: string,
    excludeId?: number,
  ): Promise<void> {
    const qb = this.repo
      .createQueryBuilder('p')
      .where('p.busId = :busId', { busId })
      .andWhere('p.estado IN (:...estados)', {
        estados: [EstadoProgramacion.PROGRAMADO, EstadoProgramacion.EN_CURSO],
      })
      .andWhere('p.fechaSalida = :fechaSalida', { fechaSalida })
      .andWhere('p.horaSalida = :horaSalida', { horaSalida });

    if (excludeId) qb.andWhere('p.id != :excludeId', { excludeId });

    const conflicto = await qb.getOne();
    if (conflicto) {
      throw new ConflictException(
        `El bus ya tiene una programación activa el ${fechaSalida} a las ${horaSalida}`,
      );
    }
  }

  /**
   * Valida que exista un turno (pendiente o en_curso) para el bus
   * que cubra la fecha y hora de salida programada.
   */
  private async validarTurnoDisponible(
    busId: number,
    fechaSalida: string,
    horaSalida: string,
  ): Promise<void> {
    const salidaDateTime = this.toDateTime(fechaSalida, horaSalida);

    const turno = await this.turnosRepo
      .createQueryBuilder('t')
      .where('t.busId = :busId', { busId })
      .andWhere('t.estadoTurno IN (:...estados)', {
        estados: [EstadoTurno.PENDIENTE, EstadoTurno.EN_CURSO],
      })
      .andWhere('t.horaInicio <= :salida AND t.horaFin >= :salida', {
        salida: salidaDateTime,
      })
      .getOne();

    if (!turno) {
      throw new BadRequestException(
        `El bus #${busId} no tiene un conductor asignado (turno activo) que cubra el ${fechaSalida} a las ${horaSalida}`,
      );
    }
  }

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  async create(dto: CreateProgramacionRutaDto): Promise<ProgramacionRuta> {
    await this.validarSolapamientoBus(dto.busId, dto.fechaSalida, dto.horaSalida);
    await this.validarTurnoDisponible(dto.busId, dto.fechaSalida, dto.horaSalida);

    const prog = this.repo.create({
      rutaId:          dto.rutaId,
      busId:           dto.busId,
      fechaSalida:     dto.fechaSalida,
      horaSalida:      dto.horaSalida,
      recurrencia:     dto.recurrencia     ?? Recurrencia.NINGUNA,
      toleranciaSalida: dto.toleranciaSalida ?? 5,
      estado:          EstadoProgramacion.PROGRAMADO,
    });

    return this.repo.save(prog);
  }

  async findAll(estado?: EstadoProgramacion): Promise<ProgramacionRuta[]> {
    const where = estado ? { estado } : {};
    return this.repo.find({
      where,
      relations: ['ruta', 'bus'],
      order: { fechaSalida: 'DESC', horaSalida: 'ASC' },
    });
  }

  async findOne(id: number): Promise<ProgramacionRuta> {
    const prog = await this.repo.findOne({
      where: { id },
      relations: ['ruta', 'bus'],
    });
    if (!prog) throw new NotFoundException(`Programación #${id} no encontrada`);
    return prog;
  }

  async update(id: number, dto: UpdateProgramacionRutaDto): Promise<ProgramacionRuta> {
    const prog = await this.findOrFail(id);

    if (prog.estado !== EstadoProgramacion.PROGRAMADO) {
      throw new BadRequestException('Solo se pueden editar programaciones en estado "programado"');
    }

    const busId       = dto.busId       ?? prog.busId;
    const fechaSalida = dto.fechaSalida ?? prog.fechaSalida;
    const horaSalida  = dto.horaSalida  ?? prog.horaSalida;

    await this.validarSolapamientoBus(busId, fechaSalida, horaSalida, id);
    await this.validarTurnoDisponible(busId, fechaSalida, horaSalida);

    Object.assign(prog, {
      rutaId:           dto.rutaId           ?? prog.rutaId,
      busId,
      fechaSalida,
      horaSalida,
      recurrencia:      dto.recurrencia      ?? prog.recurrencia,
      toleranciaSalida: dto.toleranciaSalida ?? prog.toleranciaSalida,
    });

    await this.repo.save(prog);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const prog = await this.findOrFail(id);

    if (prog.estado !== EstadoProgramacion.PROGRAMADO) {
      throw new BadRequestException('Solo se pueden eliminar programaciones en estado "programado"');
    }

    await this.repo.remove(prog);
    return { message: `Programación #${id} eliminada correctamente` };
  }

  async cancelar(id: number): Promise<ProgramacionRuta> {
    const prog = await this.findOrFail(id);

    if (prog.estado === EstadoProgramacion.FINALIZADO || prog.estado === EstadoProgramacion.CANCELADO) {
      throw new BadRequestException('La programación ya está finalizada o cancelada');
    }

    prog.estado = EstadoProgramacion.CANCELADO;
    await this.repo.save(prog);
    return this.findOne(id);
  }
  
}