import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { AlertaMasiva, AlcanceAlerta } from './entities/alerta-masiva.entity';
import { CreateAlertaDto } from './dto/create-alerta.dto';

@Injectable()
export class AlertasService {
  constructor(
    @InjectRepository(AlertaMasiva)
    private readonly alertaRepo: Repository<AlertaMasiva>,
  ) {}

  private get msSecurity(): string {
    return process.env.MS_SECURITY || 'http://localhost:8080';
  }

  private get msNotificaciones(): string {
    return process.env.MS_NOTIFICATIONS || 'http://localhost:3001';
  }

  async create(dto: CreateAlertaDto, token: string): Promise<AlertaMasiva> {
    const alerta = this.alertaRepo.create({
      emisorUsuarioId:  dto.emisorUsuarioId,
      titulo:           dto.titulo,
      mensaje:          dto.mensaje,
      urgente:          dto.urgente ?? false,
      alcance:          dto.alcance,
      rutaId:           dto.rutaId,
      zona:             dto.zona,
      fechaProgramada:  dto.fechaProgramada ? new Date(dto.fechaProgramada) : undefined,
      enviada:          false,
    });

    const saved = await this.alertaRepo.save(alerta);

    // Si no tiene fecha programada, enviar inmediatamente
    if (!dto.fechaProgramada) {
      await this.enviarAlerta(saved, token);
    }

    return saved;
  }

  async enviarAlerta(alerta: AlertaMasiva, token: string): Promise<void> {
    const destinatarios = await this.obtenerDestinatarios(alerta, token);

    if (destinatarios.length === 0) return;

    // Enviar notificación a ms-notifications
    await axios.post(`${this.msNotificaciones}/api/notificaciones/alerta-masiva`, {
      alertaId:      alerta.id,
      titulo:        alerta.titulo,
      mensaje:       alerta.mensaje,
      urgente:       alerta.urgente,
      destinatarios,
    });

    alerta.totalDestinatarios = destinatarios.length;
    alerta.enviada = true;
    await this.alertaRepo.save(alerta);
  }

  private async obtenerDestinatarios(alerta: AlertaMasiva, token: string): Promise<string[]> {
    try {
      switch (alerta.alcance) {
        case AlcanceAlerta.TODOS:
          return await this.obtenerTodosUsuarios(token);

        case AlcanceAlerta.POR_RUTA:
          return await this.obtenerUsuariosPorRuta(alerta.rutaId!, token);

        case AlcanceAlerta.POR_ZONA:
          return await this.obtenerUsuariosPorZona(alerta.zona!, token);

        default:
          return [];
      }
    } catch (e) {
      console.error('Error obteniendo destinatarios:', e);
      return [];
    }
  }

  private async obtenerTodosUsuarios(token: string): Promise<string[]> {
    const { data } = await axios.get(`${this.msSecurity}/api/users`, {
      headers: { Authorization: token },
    });
    return (data as any[]).map(u => u.id);
  }

  private async obtenerUsuariosPorRuta(rutaId: number, token: string): Promise<string[]> {
    // Obtener ciudadanos con boletos en esa ruta
    const { data } = await axios.get(
      `${process.env.MS_BUSINESS || 'http://localhost:3000'}/api/boletos?rutaId=${rutaId}`,
      { headers: { Authorization: token } },
    );
    const ciudadanoIds = [...new Set((data as any[]).map(b => b.ciudadanoId))];

    // Obtener usuarioId de cada ciudadano
    const usuarioIds: string[] = [];
    for (const ciudadanoId of ciudadanoIds) {
      try {
        const { data: ciudadano } = await axios.get(
          `${process.env.MS_BUSINESS || 'http://localhost:3000'}/api/ciudadanos/${ciudadanoId}`,
          { headers: { Authorization: token } },
        );
        if (ciudadano?.usuarioId) usuarioIds.push(ciudadano.usuarioId);
      } catch {}
    }
    return usuarioIds;
  }

  private async obtenerUsuariosPorZona(zona: string, token: string): Promise<string[]> {
    // Obtener ciudadanos cuya dirección tiene barrio = zona
    const { data } = await axios.get(
      `${process.env.MS_BUSINESS || 'http://localhost:3000'}/api/direcciones`,
      { headers: { Authorization: token } },
    );

    const direccionesFiltradas = (data as any[]).filter(
      d => d.barrio?.toLowerCase().includes(zona.toLowerCase()) ||
           d.ciudad?.toLowerCase().includes(zona.toLowerCase()),
    );

    const usuarioIds: string[] = [];
    for (const dir of direccionesFiltradas) {
      const ciudadanoId = dir.ciudadano?.id;
      if (!ciudadanoId) continue;
      try {
        const { data: ciudadano } = await axios.get(
          `${process.env.MS_BUSINESS || 'http://localhost:3000'}/api/ciudadanos/${ciudadanoId}`,
          { headers: { Authorization: token } },
        );
        if (ciudadano?.usuarioId) usuarioIds.push(ciudadano.usuarioId);
      } catch {}
    }

    return [...new Set(usuarioIds)];
  }

  async findAll(): Promise<AlertaMasiva[]> {
    return this.alertaRepo.find({ order: { fechaCreacion: 'DESC' } });
  }

  async findOne(id: number): Promise<AlertaMasiva> {
    const alerta = await this.alertaRepo.findOne({ where: { id } });
    if (!alerta) throw new NotFoundException(`Alerta #${id} no encontrada`);
    return alerta;
  }

  async marcarLeido(alertaId: number): Promise<void> {
    const alerta = await this.findOne(alertaId);
    alerta.totalLeidos = (alerta.totalLeidos || 0) + 1;
    await this.alertaRepo.save(alerta);
  }
}
