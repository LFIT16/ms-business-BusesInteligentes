import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MensajesService } from './mensajes.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembresiaGrupo, EstadoMembresia } from '../grupos/entities/membresia-grupo.entity';
import axios from 'axios';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  },
  namespace: '/chat',
})
export class MensajesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger('MensajesGateway');

  constructor(
    private readonly mensajesService: MensajesService,
    @InjectRepository(MembresiaGrupo)
    private readonly membresiaRepo: Repository<MembresiaGrupo>,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('joinGrupo')
  async handleJoinGrupo(
    @MessageBody() data: { grupoId: number; usuarioId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const mensajes = await this.mensajesService.findByGrupo(data.grupoId, data.usuarioId);
      const room = `grupo-${data.grupoId}`;
      client.join(room);
      (client as any).usuarioId = data.usuarioId;
      (client as any).grupoId = data.grupoId;
      client.emit('historialMensajes', mensajes);
    } catch (error: any) {
      client.emit('errorChat', { message: error.message || 'No tienes acceso a este chat' });
    }
  }

  @SubscribeMessage('leaveGrupo')
  handleLeaveGrupo(
    @MessageBody() data: { grupoId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`grupo-${data.grupoId}`);
  }

  @SubscribeMessage('enviarMensaje')
  async handleMensaje(
    @MessageBody() dto: CreateMensajeDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const mensaje = await this.mensajesService.create(dto);
      const room = `grupo-${dto.grupoId}`;
      this.server.to(room).emit('nuevoMensaje', { ...mensaje, lecturas: 0, leido: false });

      // Notificar con contenido real y destinatarios correctos
      await this.notificarNuevoMensaje(
        dto.grupoId,
        dto.usuarioId,
        dto.nombreUsuario,
        mensaje.id!,
        dto.contenido,  // ← contenido real
      );
    } catch (error: any) {
      client.emit('errorMensaje', { message: error.message });
    }
  }

  @SubscribeMessage('marcarLeido')
  async handleMarcarLeido(
    @MessageBody() data: { mensajeId: number; usuarioId: string; grupoId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.mensajesService.registrarLectura(data.mensajeId, data.usuarioId);
      const lecturas = await this.mensajesService.obtenerLecturas(data.mensajeId);
      const room = `grupo-${data.grupoId}`;
      this.server.to(room).emit('mensajeLeido', {
        mensajeId: data.mensajeId,
        lecturas: lecturas.length,
      });
    } catch {}
  }

  @SubscribeMessage('eliminarMensaje')
  async handleEliminarMensaje(
    @MessageBody() data: { mensajeId: number; usuarioId: string; grupoId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.mensajesService.eliminarMensaje(data.mensajeId, data.usuarioId);
      const room = `grupo-${data.grupoId}`;
      this.server.to(room).emit('mensajeEliminado', { mensajeId: data.mensajeId });
    } catch (error: any) {
      client.emit('errorMensaje', { message: error.message });
    }
  }

  private async notificarNuevoMensaje(
    grupoId: number,
    emisorId: string,
    nombreEmisor: string,
    mensajeId: number,
    contenido: string,
  ) {
    try {
      // Obtener miembros activos del grupo excepto el emisor
      const miembros = await this.membresiaRepo.find({
        where: { grupoId, estado: EstadoMembresia.ACTIVO },
      });

      const destinatarios = miembros
        .map(m => m.usuarioId)
        .filter(id => id !== emisorId);

      if (destinatarios.length === 0) return;

      const msNotif = process.env.MS_NOTIFICATIONS || 'http://localhost:3001';
      await axios.post(`${msNotif}/api/notificaciones/grupos/nuevo-mensaje`, {
        grupoId,
        emisorId,
        nombreEmisor,
        mensajeId,
        contenido,       // ← contenido real del mensaje
        destinatarios,
      });
    } catch (e) {
      this.logger.error('Error notificando nuevo mensaje:', e);
    }
  }
}