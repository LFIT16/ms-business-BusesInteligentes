import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { BoletosService } from './boletos.servicie';
import { CreateBoletoDto } from './dto/create- boleto.dto';
import { DescensoBoletoDto } from './dto/descenso-boleto.dto';
import { Query } from '@nestjs/common';

@Controller('/api/boletos')
export class BoletosController {
  constructor(private readonly service: BoletosService) {}

  @Post('abordar')
  abordar(@Body() dto: CreateBoletoDto) {
    return this.service.abordar(dto);
  }

  @Post(':id/descender')
  descender(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DescensoBoletoDto,
  ) {
    return this.service.descender(id, dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('ciudadano/:ciudadanoId')
  findByCiudadano(@Param('ciudadanoId', ParseIntPipe) ciudadanoId: number) {
    return this.service.findByCiudadano(ciudadanoId);
  }

  @Get('programacion/:programacionId')
  findByProgramacion(
    @Param('programacionId', ParseIntPipe) programacionId: number,
  ) {
    return this.service.findByProgramacion(programacionId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  /** GET /api/boletos/reportes/ingresos-por-metodo?meses=3 */
@Get('reportes/ingresos-por-metodo')
ingresosPorMetodo(@Query('meses') meses: string) {
  return this.service.ingresosPorMetodo(Number(meses) || 6);
}
}