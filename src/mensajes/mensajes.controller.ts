import { Controller, Get, Param, Query, Delete, Request } from '@nestjs/common';
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
  obtenerLecturas(@Param('id') id: string) {
    return this.mensajesService.obtenerLecturas(+id);
  }

  @Delete(':id')
  eliminarMensaje(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId: string,
  ) {
    return this.mensajesService.eliminarMensaje(+id, usuarioId);
  }
}
