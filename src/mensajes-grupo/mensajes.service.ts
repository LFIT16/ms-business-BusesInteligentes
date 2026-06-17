import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MensajeGrupo } from './entities/mensaje-grupo.entity';
import { LecturaMensaje } from './entities/lectura-mensaje.entity';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { MembresiaGrupo, EstadoMembresia, RolMembresia } from '../grupos/entities/membresia-grupo.entity';
import axios from 'axios';

@Injectable()
export class MensajesService {
  constructor(
    @InjectRepository(MensajeGrupo)
    private readonly mensajeRepo: Repository<MensajeGrupo>,

    @InjectRepository(LecturaMensaje)
    private readonly lecturaRepo: Repository<LecturaMensaje>,

    @InjectRepository(MembresiaGrupo)
    private readonly membresiaRepo: Repository<MembresiaGrupo>,
  ) {}

  private async verificarMembresiaActiva(grupoId: number, usuarioId: string): Promise<void> {
    const membresia = await this.membresiaRepo.findOne({
      where: { grupoId, usuarioId, estado: EstadoMembresia.ACTIVO },
    });
    if (!membresia) throw new ForbiddenException('No eres miembro activo de este grupo');
  }

  async create(dto: CreateMensajeDto): Promise<MensajeGrupo> {
    await this.verificarMembresiaActiva(dto.grupoId, dto.usuarioId);
    const mensaje = this.mensajeRepo.create({ ...dto, eliminado: false });
    return this.mensajeRepo.save(mensaje);
  }

async findByGrupo(grupoId: number, usuarioId: string, limit = 100): Promise<any[]> {
  let membresia = await this.membresiaRepo.findOne({
    where: { grupoId, usuarioId, estado: EstadoMembresia.ACTIVO },
  });

  if (!membresia) {
    membresia = await this.membresiaRepo.findOne({
      where: { grupoId, usuarioId, estado: EstadoMembresia.INACTIVO },
      order: { fechaSalida: 'DESC' },
    });
  }

  if (!membresia) throw new ForbiddenException('No tienes acceso al historial de este grupo');

  const qb = this.mensajeRepo
    .createQueryBuilder('m')
    .where('m.grupoId = :grupoId', { grupoId })
    .andWhere('m.fechaEnvio >= :fechaUnion', { fechaUnion: membresia.fechaUnion })
    .orderBy('m.fechaEnvio', 'ASC')
    .take(limit);

  if (membresia.estado === EstadoMembresia.INACTIVO && membresia.fechaSalida) {
    qb.andWhere('m.fechaEnvio <= :fechaSalida', { fechaSalida: membresia.fechaSalida });
  }

  const mensajes = await qb.getMany();

  if (mensajes.length === 0) return [];

  // FIX: cargar lecturas por separado para evitar bug de TypeORM con take()
  const mensajeIds = mensajes.map(m => m.id!);
  const lecturas = await this.lecturaRepo
    .createQueryBuilder('l')
    .where('l.mensajeId IN (:...ids)', { ids: mensajeIds })
    .getMany();

  return mensajes.map(m => {
    const lecturasMsg = lecturas.filter(l => l.mensajeId === m.id);
    return {
      ...m,
      contenido: m.eliminado ? '🚫 Mensaje eliminado' : m.contenido,
      lecturas:  lecturasMsg.length,
      leido:     lecturasMsg.some(l => l.usuarioId === usuarioId),
    };
  });
}
  // HU-ENTR-3-005: Registrar lectura (doble check)
  // Reemplaza el método registrarLectura en mensajes.service.ts con este:

async registrarLectura(mensajeId: number, usuarioId: string): Promise<void> {
  const mensaje = await this.mensajeRepo.findOne({ where: { id: mensajeId } });
  if (!mensaje) return;
  if (mensaje.usuarioId === usuarioId) return; // FIX: el emisor no se marca como lector

  const existe = await this.lecturaRepo.findOne({ where: { mensajeId, usuarioId } });
  if (existe) return;

  const lectura = this.lecturaRepo.create({ mensajeId, usuarioId });
  await this.lecturaRepo.save(lectura);
}

  // HU-ENTR-3-005: Ver quiénes leyeron el mensaje
 async obtenerLecturas(mensajeId: number, token?: string): Promise<any[]> {
  const lecturas = await this.lecturaRepo.find({ where: { mensajeId } });

  return Promise.all(
    lecturas.map(async l => {
      let nombreUsuario = l.usuarioId;
      try {
        const { data } = await axios.get(
          `${process.env.MS_SECURITY || 'http://localhost:8080'}/api/users/${l.usuarioId}`,
          { headers: token ? { Authorization: token } : {} }
        );
        nombreUsuario = data?.name || data?.githubUsername || l.usuarioId;
      } catch {}
      return { ...l, nombreUsuario };
    }),
  );
}

  // HU-ENTR-3-005: Admin elimina mensaje
  async eliminarMensaje(mensajeId: number, usuarioId: string): Promise<{ message: string }> {
    const mensaje = await this.mensajeRepo.findOne({ where: { id: mensajeId } });
    if (!mensaje) throw new NotFoundException(`Mensaje #${mensajeId} no encontrado`);

    const esAdmin = await this.membresiaRepo.findOne({
      where: {
        grupoId: mensaje.grupoId,
        usuarioId,
        rol: RolMembresia.ADMINISTRADOR,
        estado: EstadoMembresia.ACTIVO,
      },
    });

    // El autor también puede eliminar su propio mensaje
    if (!esAdmin && mensaje.usuarioId !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para eliminar este mensaje');
    }

    mensaje.eliminado = true;
    await this.mensajeRepo.save(mensaje);

    return { message: 'Mensaje eliminado correctamente' };
  }
  
}

