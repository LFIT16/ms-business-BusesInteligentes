import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Interval } from '@nestjs/schedule';
import { MonitoreoService } from './monitoreo.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'monitoreo',
})
export class MonitoreoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly monitoreoService: MonitoreoService) {}

  handleConnection(client: Socket) {
    console.log(`Cliente conectado a monitoreo: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado de monitoreo: ${client.id}`);
  }

  @Interval(10000)
  async emitirUbicaciones() {
    const ubicaciones = await this.monitoreoService.findUbicacionesActivasConInfo();
    this.server.emit('ubicaciones', ubicaciones);
  }
}