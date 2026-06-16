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

  constructor(private readonly mensajesService: MensajesService) {}

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
      // Guardar usuarioId en el socket para usarlo después
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

      // Emitir a todos en la sala
      this.server.to(room).emit('nuevoMensaje', { ...mensaje, lecturas: 0, leido: false });

      // HU-ENTR-3-005: Notificar a miembros que no están en el chat
      await this.notificarNuevoMensaje(dto.grupoId, dto.usuarioId, dto.nombreUsuario, mensaje.id!);

    } catch (error: any) {
      client.emit('errorMensaje', { message: error.message });
    }
  }

  // HU-ENTR-3-005: Doble check — registrar lectura
  @SubscribeMessage('marcarLeido')
  async handleMarcarLeido(
    @MessageBody() data: { mensajeId: number; usuarioId: string; grupoId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.mensajesService.registrarLectura(data.mensajeId, data.usuarioId);
      const lecturas = await this.mensajesService.obtenerLecturas(data.mensajeId);

      // Notificar al emisor original que su mensaje fue leído
      const room = `grupo-${data.grupoId}`;
      this.server.to(room).emit('mensajeLeido', {
        mensajeId: data.mensajeId,
        lecturas: lecturas.length,
      });
    } catch {}
  }

  // HU-ENTR-3-005: Admin elimina mensaje
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
  ) {
    try {
      const msNotif = process.env.MS_NOTIFICATIONS || 'http://localhost:3001';
      await axios.post(`${msNotif}/api/notificaciones/grupos/nuevo-mensaje`, {
        grupoId, emisorId, nombreEmisor, mensajeId,
      });
    } catch {}
  }
}
