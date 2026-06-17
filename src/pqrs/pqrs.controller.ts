import { Body, Controller, Get, Headers, Param, Patch, Post, } from '@nestjs/common';
import { PQRSService } from './pqrs.service';
import { ActualizarEstadoDto } from './dto/actualizar-estado.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

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
}