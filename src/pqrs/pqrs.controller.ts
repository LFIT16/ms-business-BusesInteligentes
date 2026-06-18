import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { PQRSService } from './pqrs.service';
import { ActualizarEstadoDto } from './dto/actualizar-estado.dto';

@Controller('/api/pqrs')
export class PQRSController {
  constructor(private service: PQRSService) {}

  @Post()
  crear(
    @Body() body: any,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.replace('Bearer ', '') ?? '';
    return this.service.crearPQRS(body, token);
  }

  @Get()
  obtenerTodos() {
    return this.service.findAll();
  }

  @Get('usuario/:usuarioId')
  obtenerPorUsuario(@Param('usuarioId') usuarioId: string) {
    return this.service.findByUsuario(usuarioId);
  }

  @Get(':radicado')
  consultar(@Param('radicado') radicado: string) {
    return this.service.consultarPorRadicado(radicado);
  }

  @Patch(':radicado/estado')
  actualizarEstado(
    @Param('radicado') radicado: string,
    @Body() dto: ActualizarEstadoDto,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.replace('Bearer ', '') ?? '';
    return this.service.actualizarEstado(radicado, dto, token);
  }

  @Post('verificar-vencidos')
  async verificarVencidos(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '') ?? '';
    return this.service.verificarPQRSVencidos(token);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}