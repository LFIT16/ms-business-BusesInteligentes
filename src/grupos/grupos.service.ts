import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

import { Grupo } from './entities/grupo.entity';
import { MembresiaGrupo, EstadoMembresia, RolMembresia } from './entities/membresia-grupo.entity';
import { LogMembresiaGrupo, AccionLog } from './entities/log-membresia-grupo.entity';

import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { UnirseGrupoDto } from './dto/unirse-grupo.dto';
import { PromoverMiembroDto } from './dto/promover-miembro.dto';
import { RemoverMiembroDto } from './dto/remover-miembro.dto';

@Injectable()
export class GruposService {
  constructor(
    @InjectRepository(Grupo)
    private readonly grupoRepo: Repository<Grupo>,
    @InjectRepository(MembresiaGrupo)
    private readonly membresiaRepo: Repository<MembresiaGrupo>,
    @InjectRepository(LogMembresiaGrupo)
    private readonly logRepo: Repository<LogMembresiaGrupo>,
  ) {}

  private get msSecurity(): string {
    return process.env.MS_SECURITY || 'http://localhost:8080';
  }

  private get msNotificaciones(): string {
    return process.env.MS_NOTIFICATIONS || 'http://localhost:3001';
  }

  private async obtenerNombreUsuario(usuarioId: string, token?: string): Promise<string> {
    try {
      const { data } = await axios.get(`${this.msSecurity}/api/users/${usuarioId}`, {
        headers: token ? { Authorization: token } : {},
      });
      return data?.name || data?.githubUsername || usuarioId;
    } catch {
      return usuarioId;
    }
  }

  // ── HU-ENTR-3-006: Crear grupo con foto y miembros iniciales ─────────────
  async create(dto: CreateGrupoDto): Promise<Grupo> {
    const grupo = this.grupoRepo.create({
      nombre:           dto.nombre,
      descripcion:      dto.descripcion,
      esPublico:        dto.esPublico ?? true,
      creadorUsuarioId: dto.creadorUsuarioId,
      fotoUrl:          dto.fotoUrl,
    });

    const saved = await this.grupoRepo.save(grupo);

    // Creador como administrador
    const membresiaCreador = this.membresiaRepo.create({
      grupoId:   saved.id!,
      usuarioId: dto.creadorUsuarioId,
      rol:       RolMembresia.ADMINISTRADOR,
      estado:    EstadoMembresia.ACTIVO,
    });
    await this.membresiaRepo.save(membresiaCreador);
    await this.registrarLog(saved.id!, dto.creadorUsuarioId, AccionLog.UNION);

    // Agregar miembros iniciales
    if (dto.miembrosIniciales && dto.miembrosIniciales.length > 0) {
      for (const usuarioId of dto.miembrosIniciales) {
        if (usuarioId === dto.creadorUsuarioId) continue;
        const membresia = this.membresiaRepo.create({
          grupoId:   saved.id!,
          usuarioId,
          rol:       RolMembresia.MIEMBRO,
          estado:    EstadoMembresia.ACTIVO,
        });
        await this.membresiaRepo.save(membresia);
        await this.registrarLog(saved.id!, usuarioId, AccionLog.UNION, dto.creadorUsuarioId);
        await this.notificarBienvenida(usuarioId, dto.nombre, saved.id!);
      }
    }

    return saved;
  }

  async findAll(busqueda?: string): Promise<(Grupo & { totalMiembros: number })[]> {
    let grupos: Grupo[];

    if (busqueda?.trim()) {
      const term = `%${busqueda.trim()}%`;
      grupos = await this.grupoRepo
        .createQueryBuilder('g')
        .where('g.esPublico = :pub', { pub: true })
        .andWhere('g.activo = :act', { act: true })
        .andWhere('(g.nombre LIKE :term OR g.descripcion LIKE :term)', { term })
        .orderBy('g.fechaCreacion', 'DESC')
        .getMany();
    } else {
      grupos = await this.grupoRepo.find({
        where: { esPublico: true, activo: true },
        order: { fechaCreacion: 'DESC' },
      });
    }

    return Promise.all(
      grupos.map(async g => ({
        ...g,
        totalMiembros: await this.membresiaRepo.count({
          where: { grupoId: g.id, estado: EstadoMembresia.ACTIVO },
        }),
      })),
    );
  }
// Agregar este método en grupos.service.ts después de findAll()

async misGrupos(usuarioId: string): Promise<(Grupo & { totalMiembros: number; rol: string })[]> {
  const membresias = await this.membresiaRepo.find({
    where: { usuarioId, estado: EstadoMembresia.ACTIVO },
    order: { fechaUnion: 'DESC' },
  });

  return Promise.all(
    membresias.map(async m => {
      const grupo = await this.grupoRepo.findOne({ where: { id: m.grupoId, activo: true } });
      if (!grupo) return null;

      const totalMiembros = await this.membresiaRepo.count({
        where: { grupoId: grupo.id, estado: EstadoMembresia.ACTIVO },
      });

      return { ...grupo, totalMiembros, rol: m.rol };
    }),
  ).then(grupos => grupos.filter(g => g !== null) as any[]);
}
  async findOne(id: number): Promise<Grupo & { totalMiembros: number }> {
    const grupo = await this.grupoRepo.findOne({ where: { id } });
    if (!grupo) throw new NotFoundException(`Grupo #${id} no encontrado`);

    const totalMiembros = await this.membresiaRepo.count({
      where: { grupoId: id, estado: EstadoMembresia.ACTIVO },
    });

    return { ...grupo, totalMiembros };
  }

  async update(id: number, dto: UpdateGrupoDto): Promise<Grupo> {
    const grupo = await this.grupoRepo.findOne({ where: { id } });
    if (!grupo) throw new NotFoundException(`Grupo #${id} no encontrado`);
    Object.assign(grupo, dto);
    return this.grupoRepo.save(grupo);
  }

  async remove(id: number): Promise<{ message: string }> {
    const grupo = await this.grupoRepo.findOne({ where: { id } });
    if (!grupo) throw new NotFoundException(`Grupo #${id} no encontrado`);
    grupo.activo = false;
    await this.grupoRepo.save(grupo);
    return { message: `Grupo #${id} desactivado correctamente` };
  }

  async unirse(grupoId: number, dto: UnirseGrupoDto): Promise<MembresiaGrupo> {
    const grupo = await this.grupoRepo.findOne({ where: { id: grupoId, activo: true } });
    if (!grupo) throw new NotFoundException(`Grupo #${grupoId} no encontrado`);
    if (!grupo.esPublico) throw new ForbiddenException('Este grupo no es público');

    const existe = await this.membresiaRepo.findOne({
      where: { grupoId, usuarioId: dto.usuarioId },
    });

    if (existe) {
      if (existe.estado === EstadoMembresia.BLOQUEADO)
        throw new ForbiddenException('Has sido bloqueado de este grupo');
      if (existe.estado === EstadoMembresia.ACTIVO)
        throw new BadRequestException('Ya eres miembro de este grupo');
      // Si era INACTIVO, reactivar
      if (existe.estado === EstadoMembresia.INACTIVO) {
        existe.estado = EstadoMembresia.ACTIVO;
          existe.fechaSalida = null as any; 
            existe.fechaUnion  = new Date(); // ← actualizar fechaUnion a ahora


        const saved = await this.membresiaRepo.save(existe);
        await this.registrarLog(grupoId, dto.usuarioId, AccionLog.UNION);
        await this.notificarBienvenida(dto.usuarioId, grupo.nombre, grupoId);
        return saved;
      }
    }

    const membresia = this.membresiaRepo.create({
      grupoId,
      usuarioId: dto.usuarioId,
      rol:       RolMembresia.MIEMBRO,
      estado:    EstadoMembresia.ACTIVO,
    });

    const saved = await this.membresiaRepo.save(membresia);
    await this.registrarLog(grupoId, dto.usuarioId, AccionLog.UNION);
    await this.notificarBienvenida(dto.usuarioId, grupo.nombre, grupoId);

    return saved;
  }

  async abandonar(grupoId: number, usuarioId: string): Promise<{ message: string }> {
    const membresia = await this.membresiaRepo.findOne({
      where: { grupoId, usuarioId, estado: EstadoMembresia.ACTIVO },
    });

    if (!membresia) throw new NotFoundException('No eres miembro activo de este grupo');

    const esAdmin = membresia.rol === RolMembresia.ADMINISTRADOR;

    membresia.estado = EstadoMembresia.INACTIVO;
    membresia.fechaSalida = new Date();
    await this.membresiaRepo.save(membresia);

    await this.registrarLog(grupoId, usuarioId, AccionLog.SALIDA);
    await this.notificarSalidaAdmins(grupoId, usuarioId);

    if (esAdmin) await this.asignarAdminAleatorio(grupoId);

    return { message: 'Has abandonado el grupo correctamente' };
  }

  private async asignarAdminAleatorio(grupoId: number): Promise<void> {
    const adminsRestantes = await this.membresiaRepo.count({
      where: { grupoId, rol: RolMembresia.ADMINISTRADOR, estado: EstadoMembresia.ACTIVO },
    });

    if (adminsRestantes > 0) return;

    const miembros = await this.membresiaRepo.find({
      where: { grupoId, estado: EstadoMembresia.ACTIVO },
      order: { fechaUnion: 'ASC' },
    });

    if (miembros.length === 0) return;

    const nuevoAdmin = miembros[0];
    nuevoAdmin.rol = RolMembresia.ADMINISTRADOR;
    await this.membresiaRepo.save(nuevoAdmin);
    await this.registrarLog(grupoId, nuevoAdmin.usuarioId, AccionLog.PROMOVIDO, 'Sistema');
  }

  async listarMiembros(grupoId: number, nombre?: string, token?: string) {
    const miembros = await this.membresiaRepo.find({
      where: { grupoId, estado: EstadoMembresia.ACTIVO },
      order: { fechaUnion: 'ASC' },
    });

    const miembrosConNombre = await Promise.all(
      miembros.map(async m => ({
        ...m,
        nombreUsuario: await this.obtenerNombreUsuario(m.usuarioId, token),
      })),
    );

    if (nombre?.trim()) {
      return miembrosConNombre.filter(m =>
        m.nombreUsuario.toLowerCase().includes(nombre.toLowerCase()) ||
        m.usuarioId.toLowerCase().includes(nombre.toLowerCase()),
      );
    }

    return miembrosConNombre;
  }

  async promover(grupoId: number, dto: PromoverMiembroDto): Promise<MembresiaGrupo> {
    await this.verificarEsAdmin(grupoId, dto.actorUsuarioId);

    const membresia = await this.membresiaRepo.findOne({
      where: { grupoId, usuarioId: dto.usuarioId, estado: EstadoMembresia.ACTIVO },
    });

    if (!membresia) throw new NotFoundException('El usuario no es miembro activo del grupo');

    membresia.rol = dto.rol;
    const saved = await this.membresiaRepo.save(membresia);
    await this.registrarLog(grupoId, dto.usuarioId, AccionLog.PROMOVIDO, dto.actorUsuarioId);

    return saved;
  }

  async remover(grupoId: number, dto: RemoverMiembroDto): Promise<{ message: string }> {
    await this.verificarEsAdmin(grupoId, dto.actorUsuarioId);

    const membresia = await this.membresiaRepo.findOne({
      where: { grupoId, usuarioId: dto.usuarioId },
    });

    if (!membresia) throw new NotFoundException('El usuario no es miembro del grupo');

    await this.membresiaRepo.remove(membresia);
    await this.registrarLog(grupoId, dto.usuarioId, AccionLog.REMOVIDO, dto.actorUsuarioId);
    await this.notificarRemocion(dto.usuarioId, grupoId);

    return { message: 'Miembro removido correctamente' };
  }

  async bloquear(grupoId: number, dto: RemoverMiembroDto): Promise<{ message: string }> {
    await this.verificarEsAdmin(grupoId, dto.actorUsuarioId);

    const membresia = await this.membresiaRepo.findOne({
      where: { grupoId, usuarioId: dto.usuarioId },
    });

    if (!membresia) throw new NotFoundException('El usuario no es miembro del grupo');

    if (membresia.rol === RolMembresia.ADMINISTRADOR) {
      throw new ForbiddenException('No se puede bloquear a un administrador del grupo');
    }

    membresia.estado = EstadoMembresia.BLOQUEADO;
    await this.membresiaRepo.save(membresia);
    await this.registrarLog(grupoId, dto.usuarioId, AccionLog.BLOQUEADO, dto.actorUsuarioId);
    await this.notificarBloqueo(dto.usuarioId, grupoId);

    return { message: 'Usuario bloqueado del grupo' };
  }

  async obtenerLogs(grupoId: number, token?: string) {
    const logs = await this.logRepo.find({
      where: { grupoId },
      order: { fechaAccion: 'DESC' },
    });

    return Promise.all(
      logs.map(async log => ({
        ...log,
        nombreAfectado: await this.obtenerNombreUsuario(log.usuarioAfectadoId, token),
        nombreActor:    log.usuarioActorId
          ? await this.obtenerNombreUsuario(log.usuarioActorId, token)
          : 'Sistema',
      })),
    );
  }

  async verificarMembresia(grupoId: number, usuarioId: string): Promise<{ esMiembro: boolean; soloLectura: boolean }> {
    const activo = await this.membresiaRepo.findOne({
      where: { grupoId, usuarioId, estado: EstadoMembresia.ACTIVO },
    });

    if (activo) return { esMiembro: true, soloLectura: false };

    const inactivo = await this.membresiaRepo.findOne({
      where: { grupoId, usuarioId, estado: EstadoMembresia.INACTIVO },
    });

    if (inactivo) return { esMiembro: true, soloLectura: true };

    return { esMiembro: false, soloLectura: false };
  }

  private async verificarEsAdmin(grupoId: number, usuarioId: string): Promise<void> {
    const membresia = await this.membresiaRepo.findOne({
      where: { grupoId, usuarioId, rol: RolMembresia.ADMINISTRADOR, estado: EstadoMembresia.ACTIVO },
    });
    if (!membresia) throw new ForbiddenException('No tienes permisos de administrador en este grupo');
  }

  private async registrarLog(
    grupoId: number,
    usuarioAfectadoId: string,
    accion: AccionLog,
    usuarioActorId?: string,
  ): Promise<void> {
    const log = this.logRepo.create({ grupoId, usuarioAfectadoId, accion, usuarioActorId });
    await this.logRepo.save(log);
  }

  private async notificarBienvenida(usuarioId: string, nombreGrupo: string, grupoId: number) {
    try {
      await axios.post(`${this.msNotificaciones}/api/notificaciones/grupos/bienvenida`, {
        usuarioId, nombreGrupo, grupoId,
      });
    } catch (e) { console.error('Error notificando bienvenida:', e); }
  }

  private async notificarSalidaAdmins(grupoId: number, usuarioId: string) {
    try {
      const admins = await this.membresiaRepo.find({
        where: { grupoId, rol: RolMembresia.ADMINISTRADOR, estado: EstadoMembresia.ACTIVO },
      });
      await axios.post(`${this.msNotificaciones}/api/notificaciones/grupos/salida`, {
        grupoId, usuarioId, adminIds: admins.map(a => a.usuarioId),
      });
    } catch (e) { console.error('Error notificando salida:', e); }
  }

  private async notificarRemocion(usuarioId: string, grupoId: number) {
    try {
      await axios.post(`${this.msNotificaciones}/api/notificaciones/grupos/remocion`, {
        usuarioId, grupoId,
      });
    } catch (e) { console.error('Error notificando remoción:', e); }
  }

  private async notificarBloqueo(usuarioId: string, grupoId: number) {
    try {
      await axios.post(`${this.msNotificaciones}/api/notificaciones/grupos/bloqueo`, {
        usuarioId, grupoId,
      });
    } catch (e) { console.error('Error notificando bloqueo:', e); }
  }
}
