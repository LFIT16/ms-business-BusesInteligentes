import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { MensajeService } from './mensaje.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';

@Controller('/api/mensajes')
export class MensajeController {
  constructor(private readonly service: MensajeService) {}

  @Post(':emisorUsuarioId')
  crear(
    @Param('emisorUsuarioId') emisorUsuarioId: string,
    @Body() dto: CreateMensajeDto,
  ) {
    return this.service.crear(emisorUsuarioId, dto);
  }

  @Get('enviados/:usuarioId')
  enviados(@Param('usuarioId') usuarioId: string) {
    return this.service.getEnviados(usuarioId);
  }

  @Get('recibidos/:usuarioId')
  recibidos(@Param('usuarioId') usuarioId: string) {
    return this.service.getRecibidos(usuarioId);
  }

  @Get('no-leidos/:usuarioId')
  noLeidos(@Param('usuarioId') usuarioId: string) {
    return this.service.getNoLeidos(usuarioId);
  }

  @Patch('leer/:mensajeId/:usuarioId')
  marcarLeido(
    @Param('mensajeId') mensajeId: string,
    @Param('usuarioId') usuarioId: string,
  ) {
    return this.service.marcarLeido(Number(mensajeId), usuarioId);
  }
}