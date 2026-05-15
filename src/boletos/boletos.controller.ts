import {
  Controller, Get, Post, Body, Param, ParseIntPipe,
} from '@nestjs/common';
import { BoletosService }    from './boletos.servicie';
import { CreateBoletoDto }   from './dto/create- boleto.dto';
import { DescensoBoletoDto } from './dto/descenso-boleto.dto';

@Controller('/api/boletos')
export class BoletosController {
  constructor(private readonly service: BoletosService) {}

  /** POST /api/boletos/abordar — HU-ENTR-2-003 */
  @Post('abordar')
  abordar(@Body() dto: CreateBoletoDto) {
    return this.service.abordar(dto);
  }

  /** POST /api/boletos/:id/descender — HU-ENTR-2-004 */
  @Post(':id/descender')
  descender(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DescensoBoletoDto,
  ) {
    return this.service.descender(id, dto);
  }

  /** GET /api/boletos */
  @Get()
  findAll() { return this.service.findAll(); }

  /** GET /api/boletos/ciudadano/:ciudadanoId */
  @Get('ciudadano/:ciudadanoId')
  findByCiudadano(@Param('ciudadanoId', ParseIntPipe) ciudadanoId: number) {
    return this.service.findByCiudadano(ciudadanoId);
  }

  /** GET /api/boletos/programacion/:programacionId */
  @Get('programacion/:programacionId')
  findByProgramacion(@Param('programacionId', ParseIntPipe) programacionId: number) {
    return this.service.findByProgramacion(programacionId);
  }

  /** GET /api/boletos/:id */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}