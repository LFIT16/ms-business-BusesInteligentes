import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgramacionRuta } from '../programaciones-ruta/entities/programacion-ruta.entity';
import { EstadoProgramacion } from '../programaciones-ruta/enums/estado-programacion.enum';
import { Turno } from './entities/turno.entity';
import { Bus } from '../buses/entities/bus.entity';
import axios from 'axios';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { IniciarTurnoDto } from './dto/iniciar-turno.dto';
import { EstadoTurno } from './enums/estado-turno.enum';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Gps } from '../gps/entities/gps.entity'; // ← Importar entidad Gps

@Injectable()
export class TurnosService {
  constructor(
    @InjectRepository(Turno)
    private readonly turnosRepository: Repository<Turno>,

    @InjectRepository(Bus)
    private readonly busesRepository: Repository<Bus>,

    @InjectRepository(ProgramacionRuta)
    private readonly programacionRepo: Repository<ProgramacionRuta>,

    @InjectRepository(Gps) // ← Agregar repositorio de Gps
    private readonly gpsRepository: Repository<Gps>,
  ) {}

  // ─── Helpers privados ───────────────────────────────────────────────────────

  private async findTurnoOrFail(id: number): Promise<Turno> {
    const turno = await this.turnosRepository.findOne({ where: { id } });
    if (!turno) throw new NotFoundException(`Turno #${id} no encontrado`);
    return turno;
  }

  private async actualizarProgramacionesPorTurno(
    busId: number,
    horaInicio: Date,
    horaFin: Date,
    nuevoEstado: EstadoProgramacion,
    estadoActual: EstadoProgramacion,
  ): Promise<void> {
    const programaciones = await this.programacionRepo
      .createQueryBuilder('p')
      .where('p.busId = :busId', { busId })
      .andWhere('p.estado = :estado', { estado: estadoActual })
      .getMany();

    for (const prog of programaciones) {
      const fechaHora = new Date(`${prog.fechaSalida}T${prog.horaSalida}`);
      if (fechaHora >= horaInicio && fechaHora <= horaFin) {
        prog.estado = nuevoEstado;
        await this.programacionRepo.save(prog);
      }
    }
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
    const horaFin = new Date(dto.horaFin);

    await this.findBusOrFail(dto.busId);
    await this.validarSolapamientoConductor(dto.conductorId, horaInicio, horaFin);
    await this.validarSolapamientoBus(dto.busId, horaInicio, horaFin);

    const turno = this.turnosRepository.create({
      conductorId: dto.conductorId,
      busId: dto.busId,
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

    const horaInicio = dto.horaInicio ? new Date(dto.horaInicio) : turno.horaInicio;
    const horaFin = dto.horaFin ? new Date(dto.horaFin) : turno.horaFin;
    const conductorId = dto.conductorId ?? turno.conductorId;
    const busId = dto.busId ?? turno.busId;

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

    const ahora = new Date();
    const TOLERANCIA_MS = 15 * 60 * 1000;

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

    turno.estadoTurno = EstadoTurno.EN_CURSO;
    turno.estadoBus = dto.estadoBus ?? null;
    turno.observaciones = dto.observaciones ?? null;
    turno.horaRealInicio = ahora;
    await this.turnosRepository.save(turno);

    // ✅ ACTIVAR GPS EN LA TABLA BUSES
    await this.busesRepository.update(turno.busId, { gpsActivo: true });

    // ✅ ACTIVAR GPS EN LA TABLA GPS (IMPORTANTE)
    const gpsExistente = await this.gpsRepository.findOne({ where: { busId: turno.busId } });
    if (gpsExistente) {
      await this.gpsRepository.update(
        { busId: turno.busId },
        { 
          activo: true, 
          ultimaActualizacion: new Date(),
          latitud: gpsExistente.latitud || 5.0569,
          longitud: gpsExistente.longitud || -75.4870
        }
      );
    } else {
      // Si no existe registro GPS, crearlo
      const nuevoGps = this.gpsRepository.create({
        busId: turno.busId,
        codigo: `GPS${turno.busId}`,
        activo: true,
        latitud: 5.0569,
        longitud: -75.4870,
        ultimaActualizacion: new Date()
      });
      await this.gpsRepository.save(nuevoGps);
    }

    await this.actualizarProgramacionesPorTurno(
      turno.busId,
      turno.horaInicio,
      turno.horaFin,
      EstadoProgramacion.EN_CURSO,
      EstadoProgramacion.PROGRAMADO,
    );

    console.log(`✅ Turno ${id} iniciado - GPS del bus ${turno.busId} activado`);

    return this.findOne(id);
  }

  async finalizarTurno(id: number): Promise<Turno> {
    const turno = await this.findTurnoOrFail(id);

    if (turno.estadoTurno !== EstadoTurno.EN_CURSO) {
      throw new BadRequestException('Solo se pueden finalizar turnos en curso');
    }

    turno.estadoTurno = EstadoTurno.FINALIZADO;
    turno.horaRealFin = new Date();
    await this.turnosRepository.save(turno);

    // ✅ DESACTIVAR GPS EN LA TABLA BUSES
    await this.busesRepository.update(turno.busId, { gpsActivo: false });

    // ✅ DESACTIVAR GPS EN LA TABLA GPS
    await this.gpsRepository.update(
      { busId: turno.busId },
      { activo: false }
    );

    await this.actualizarProgramacionesPorTurno(
      turno.busId,
      turno.horaInicio,
      turno.horaFin,
      EstadoProgramacion.FINALIZADO,
      EstadoProgramacion.EN_CURSO,
    );

    console.log(`✅ Turno ${id} finalizado - GPS del bus ${turno.busId} desactivado`);

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
      turno.horaRealFin = ahora;
      await this.turnosRepository.save(turno);
      
      // ✅ DESACTIVAR GPS
      await this.busesRepository.update(turno.busId, { gpsActivo: false });
      await this.gpsRepository.update({ busId: turno.busId }, { activo: false });
      
      await this.actualizarProgramacionesPorTurno(
        turno.busId,
        turno.horaInicio,
        turno.horaFin,
        EstadoProgramacion.FINALIZADO,
        EstadoProgramacion.EN_CURSO,
      );
    }
  }

  async findTurnoActualByBus(busId: number): Promise<Turno | null> {
    const ahora = new Date();

    return await this.turnosRepository
      .createQueryBuilder('turno')
      .leftJoinAndSelect('turno.bus', 'bus')
      .leftJoinAndSelect('turno.conductor', 'conductor')
      .where('turno.busId = :busId', { busId })
      .andWhere('turno.horaInicio <= :ahora', { ahora })
      .andWhere('turno.horaFin >= :ahora', { ahora })
      .orderBy('turno.horaInicio', 'DESC')
      .getOne();
  }

  async findTurnoByBusAndFechaConUsuario(busId: number, fecha: string, authorization?: string): Promise<any> {
    const fechaColombia = this.convertirFechaUtcAColombia(fecha);
    console.log('Fecha recibida:', fecha);
    console.log('Fecha Colombia:', fechaColombia);
    console.log('Bus:', busId);

    const [turno] = await this.turnosRepository.query(
      `
      SELECT
        t.id,
        t.conductorId,
        t.busId,
        t.horaInicio,
        t.horaFin,
        t.estadoTurno,
        t.estadoBus,
        c.userId,
        c.licencia,
        c.telefono
      FROM turnos t
      JOIN conductores c ON c.id = t.conductorId
      WHERE t.busId = ?
        AND ? BETWEEN t.horaInicio AND t.horaFin
      ORDER BY t.id DESC
      LIMIT 1
      `,
      [busId, fechaColombia],
    );

    if (!turno) return null;

    let nombre = turno.licencia || turno.userId;

    try {
      const securityUrl = process.env.MS_SECURITY_URL || 'http://localhost:8080';

      const { data } = await axios.get(
        `${securityUrl}/api/users/${turno.userId}`,
        {
          headers: authorization
            ? { Authorization: authorization }
            : {},
        },
      );

      const user = data?.data?.user || data?.data || data?.user || data;

      nombre = user?.name || user?.nombre || user?.email || nombre;
    } catch (error: any) {
      console.error(
        'No se pudo consultar el usuario conductor:',
        error?.response?.data || error?.message,
      );
    }

    return {
      id: turno.id,
      conductorId: turno.conductorId,
      busId: turno.busId,
      horaInicio: turno.horaInicio,
      horaFin: turno.horaFin,
      estadoTurno: turno.estadoTurno,
      estadoBus: turno.estadoBus,
      conductor: {
        id: turno.conductorId,
        userId: turno.userId,
        licencia: turno.licencia,
        telefono: turno.telefono,
        nombre,
      },
    };
  }

  private convertirFechaUtcAColombia(fecha: string | Date): string {
    const date = new Date(fecha);

    const colombiaDate = new Date(
      date.getTime() - 5 * 60 * 60 * 1000,
    );

    const year = colombiaDate.getUTCFullYear();
    const month = String(colombiaDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(colombiaDate.getUTCDate()).padStart(2, '0');
    const hours = String(colombiaDate.getUTCHours()).padStart(2, '0');
    const minutes = String(colombiaDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(colombiaDate.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}