import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PQRSService } from './pqrs.service';

@Controller('/api/pqrs')
export class PQRSController {
  constructor(private service: PQRSService) {}

  @Post()
  crear(@Body() body: any) {
    return this.service.crearPQRS(body);
  }

  @Get(':radicado')
  consultar(@Param('radicado') radicado: string) {
    return this.service.consultarPorRadicado(radicado);
  }
}