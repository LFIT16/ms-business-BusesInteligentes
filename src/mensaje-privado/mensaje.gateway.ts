import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket,
  OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MensajeService } from './mensaje.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/api/mensajes' })
export class MensajeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server?: Server;
  private readonly logger = new Logger(MensajeGateway.name);
  private usuariosConectados = new Map<string, string>(); // usuarioId → socketId

  constructor(private readonly mensajeService: MensajeService) {}

  handleConnection(client: Socket) {
    const usuarioId = client.handshake.query.usuarioId as string;
    if (usuarioId) {
      this.usuariosConectados.set(usuarioId, client.id);
      this.logger.log(`Conectado: ${usuarioId}`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [usuarioId, socketId] of this.usuariosConectados.entries()) {
      if (socketId === client.id) {
        this.usuariosConectados.delete(usuarioId);
        this.logger.log(`Desconectado: ${usuarioId}`);
        break;
      }
    }
  }

 @SubscribeMessage('enviar_mensaje')
async handleEnviarMensaje(
  @MessageBody() data: any,
  @ConnectedSocket() client: Socket,
) {

  console.log('ENTRO A ENVIAR MENSAJE');
  console.log(data);

  try {

    const mensaje = await this.mensajeService.crear(
      data.emisorUsuarioId,
      data.dto
    );

    console.log('MENSAJE GUARDADO');

    const socketEmisor = this.usuariosConectados.get(data.dto.destinatarioUsuarioId);

    if (socketEmisor) {
      this.server?.to(socketEmisor).emit('mensaje_recibido', mensaje);
    }

    return mensaje;

  } catch (e) {

    console.error(e);

    client.emit('error_mensaje', {
      message: (e as Error).message
    });
  }
}

  @SubscribeMessage('marcar_leido')
  async handleMarcarLeido(
    @MessageBody() data: { mensajeId: number; usuarioId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const dest = await this.mensajeService.marcarLeido(data.mensajeId, data.usuarioId);
    const socketEmisor = this.usuariosConectados.get(dest.usuarioId?.toString() || '');
    if (socketEmisor) {
      this.server?.to(socketEmisor).emit('mensaje_leido', {
        mensajeId: dest.mensajeId,
        fechaLeido: dest.fechaLeido,
      });
    }
    return dest;
  }

  @SubscribeMessage('obtener_recibidos')
  async handleObtenerRecibidos(
    @MessageBody() data: { usuarioId: string },
  ) {
    return this.mensajeService.getRecibidos(data.usuarioId);
  }

  
}