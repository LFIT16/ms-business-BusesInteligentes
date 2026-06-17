import { Controller, Get, Param, Query, Delete, Headers } from '@nestjs/common';
import { MensajesService } from './mensajes.service';

@Controller('/api/mensajes')
export class MensajesController {
  constructor(private readonly mensajesService: MensajesService) {}

  @Get('grupo/:grupoId')
  findByGrupo(
    @Param('grupoId') grupoId: string,
    @Query('usuarioId') usuarioId: string,
    @Query('limit') limit?: string,
  ) {
    return this.mensajesService.findByGrupo(+grupoId, usuarioId, limit ? +limit : 100);
  }

  @Get(':id/lecturas')
  obtenerLecturas(
    @Param('id') id: string,
    @Headers('authorization') token?: string,
  ) {
    return this.mensajesService.obtenerLecturas(+id, token);
  }

  @Delete(':id')
  eliminarMensaje(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId: string,
  ) {
    return this.mensajesService.eliminarMensaje(+id, usuarioId);
  }
}