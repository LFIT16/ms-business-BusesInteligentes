import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Turno } from './entities/turno.entity';
import { Bus } from '../buses/entities/bus.entity';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { IniciarTurnoDto } from './dto/iniciar-turno.dto';
import { EstadoTurno } from './enums/estado-turno.enum';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TurnosService {
  constructor(
    @InjectRepository(Turno)
    private readonly turnosRepository: Repository<Turno>,

    @InjectRepository(Bus)
    private readonly busesRepository: Repository<Bus>,
  ) {}

  // ─── Helpers privados ───────────────────────────────────────────────────────

  private async findTurnoOrFail(id: number): Promise<Turno> {
    const turno = await this.turnosRepository.findOne({ where: { id } });
    if (!turno) throw new NotFoundException(`Turno #${id} no encontrado`);
    return turno;
  }

  private async findBusOrFail(id: number): Promise<Bus> {
    const bus = await this.busesRepository.findOne({ where: { id } });
    if (!bus) throw new NotFoundException(`Bus #${id} no encontrado`);
    return bus;
  }

  private async validarSolapamientoConductor(
    conductorId: number,
    horaInicio: Date,
    horaFin: Date,
    excludeId?: number,
  ): Promise<void> {
    const qb = this.turnosRepository
      .createQueryBuilder('t')
      .where('t.conductorId = :conductorId', { conductorId })
      .andWhere('t.estadoTurno IN (:...estados)', {
        estados: [EstadoTurno.PENDIENTE, EstadoTurno.EN_CURSO],
      })
      .andWhere('t.horaInicio < :horaFin AND t.horaFin > :horaInicio', {
        horaInicio,
        horaFin,
      });

    if (excludeId) qb.andWhere('t.id != :excludeId', { excludeId });

    const conflicto = await qb.getOne();
    if (conflicto) {
      throw new ConflictException(
        `El conductor ya tiene un turno asignado entre ${conflicto.horaInicio.toISOString()} y ${conflicto.horaFin.toISOString()}`,
      );
    }
  }

  private async validarSolapamientoBus(
    busId: number,
    horaInicio: Date,
    horaFin: Date,
    excludeId?: number,
  ): Promise<void> {
    const qb = this.turnosRepository
      .createQueryBuilder('t')
      .where('t.busId = :busId', { busId })
      .andWhere('t.estadoTurno IN (:...estados)', {
        estados: [EstadoTurno.PENDIENTE, EstadoTurno.EN_CURSO],
      })
      .andWhere('t.horaInicio < :horaFin AND t.horaFin > :horaInicio', {
        horaInicio,
        horaFin,
      });

    if (excludeId) qb.andWhere('t.id != :excludeId', { excludeId });

    const conflicto = await qb.getOne();
    if (conflicto) {
      throw new ConflictException(
        `El bus ya está asignado a otro turno entre ${conflicto.horaInicio.toISOString()} y ${conflicto.horaFin.toISOString()}`,
      );
    }
  }

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  async create(dto: CreateTurnoDto): Promise<Turno> {
    const horaInicio = new Date(dto.horaInicio);
    const horaFin    = new Date(dto.horaFin);

    await this.findBusOrFail(dto.busId);
    await this.validarSolapamientoConductor(dto.conductorId, horaInicio, horaFin);
    await this.validarSolapamientoBus(dto.busId, horaInicio, horaFin);

    const turno = this.turnosRepository.create({
      conductorId: dto.conductorId,
      busId:       dto.busId,
      horaInicio,
      horaFin,
      estadoTurno: EstadoTurno.PENDIENTE,
    });

    return this.turnosRepository.save(turno);
  }

  async findAll(estadoTurno?: EstadoTurno): Promise<Turno[]> {
    const where = estadoTurno ? { estadoTurno } : {};
    return this.turnosRepository.find({
      where,
      relations: ['bus'],
      order: { horaInicio: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Turno> {
    const turno = await this.turnosRepository.findOne({
      where: { id },
      relations: ['bus'],
    });
    if (!turno) throw new NotFoundException(`Turno #${id} no encontrado`);
    return turno;
  }

  async update(id: number, dto: UpdateTurnoDto): Promise<Turno> {
    const turno = await this.findTurnoOrFail(id);

    if (turno.estadoTurno !== EstadoTurno.PENDIENTE) {
      throw new BadRequestException('Solo se pueden editar turnos en estado pendiente');
    }

    const horaInicio  = dto.horaInicio  ? new Date(dto.horaInicio) : turno.horaInicio;
    const horaFin     = dto.horaFin     ? new Date(dto.horaFin)    : turno.horaFin;
    const conductorId = dto.conductorId ?? turno.conductorId;
    const busId       = dto.busId       ?? turno.busId;

    if (dto.busId && dto.busId !== turno.busId) await this.findBusOrFail(dto.busId);

    await this.validarSolapamientoConductor(conductorId, horaInicio, horaFin, id);
    await this.validarSolapamientoBus(busId, horaInicio, horaFin, id);

    Object.assign(turno, { conductorId, busId, horaInicio, horaFin });
    await this.turnosRepository.save(turno);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const turno = await this.findTurnoOrFail(id);

    if (turno.estadoTurno !== EstadoTurno.PENDIENTE) {
      throw new BadRequestException('Solo se pueden eliminar turnos en estado pendiente');
    }

    await this.turnosRepository.remove(turno);
    return { message: `Turno #${id} eliminado correctamente` };
  }

  // ─── Lógica de negocio ──────────────────────────────────────────────────────

 async iniciarTurno(id: number, dto: IniciarTurnoDto): Promise<Turno> {
  const turno = await this.findOne(id);

  if (turno.estadoTurno === EstadoTurno.EN_CURSO) {
    throw new BadRequestException('El turno ya está en curso');
  }
  if (turno.estadoTurno === EstadoTurno.FINALIZADO) {
    throw new BadRequestException('El turno ya finalizó y no puede reiniciarse');
  }

  const ahora        = new Date();
  const TOLERANCIA_MS = 15 * 60 * 1000; // ← 15 minutos en ms (ajusta aquí si quieres más/menos)

  const inicioPosible = new Date(turno.horaInicio.getTime() - TOLERANCIA_MS);

  if (ahora < inicioPosible) {
    throw new BadRequestException(
      `El turno solo puede iniciarse a partir de las ${inicioPosible.toLocaleTimeString()} ` +
      `(15 minutos antes de la hora programada)`
    );
  }
  if (ahora > turno.horaFin) {
    throw new BadRequestException('El turno ya expiró según el horario programado');
  }

  turno.estadoTurno    = EstadoTurno.EN_CURSO;
  turno.estadoBus      = dto.estadoBus ?? null;
  turno.observaciones  = dto.observaciones ?? null;
  turno.horaRealInicio = ahora;
  await this.turnosRepository.save(turno);

  await this.busesRepository.update(turno.busId, { gpsActivo: true });

  return this.findOne(id);
}

  async finalizarTurno(id: number): Promise<Turno> {
    const turno = await this.findTurnoOrFail(id);

    if (turno.estadoTurno !== EstadoTurno.EN_CURSO) {
      throw new BadRequestException('Solo se pueden finalizar turnos en curso');
    }

    turno.estadoTurno = EstadoTurno.FINALIZADO;
    turno.horaRealFin = new Date();  // ← hora exacta del click o del cron
    await this.turnosRepository.save(turno);

    await this.busesRepository.update(turno.busId, { gpsActivo: false });

    return this.findOne(id);
  }

  async findTurnoActivoConductor(conductorId: number): Promise<Turno> {
    const turno = await this.turnosRepository.findOne({
      where: [
        { conductorId, estadoTurno: EstadoTurno.EN_CURSO },
        { conductorId, estadoTurno: EstadoTurno.PENDIENTE },
      ],
      relations: ['bus'],
      order: { horaInicio: 'ASC' },
    });

    if (!turno) {
      throw new NotFoundException(`No hay turno activo para el conductor #${conductorId}`);
    }

    return turno;
  }

  // ─── Cron: auto-finaliza turnos vencidos cada minuto ────────────────────────

  @Cron(CronExpression.EVERY_MINUTE)
  async finalizarTurnosVencidos(): Promise<void> {
    const ahora = new Date();

    const turnosVencidos = await this.turnosRepository
      .createQueryBuilder('t')
      .where('t.estadoTurno = :estado', { estado: EstadoTurno.EN_CURSO })
      .andWhere('t.horaFin < :ahora', { ahora })
      .getMany();

    for (const turno of turnosVencidos) {
      turno.estadoTurno = EstadoTurno.FINALIZADO;
      turno.horaRealFin = ahora;  // ← mismo campo, consistente con finalización manual
      await this.turnosRepository.save(turno);
      await this.busesRepository.update(turno.busId, { gpsActivo: false });
    }
  }
}