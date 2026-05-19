import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';

import { IncidentesService } from './incidentes.service';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';

@Controller('/api/incidentes')
export class IncidentesController {
  constructor(private readonly service: IncidentesService) {}

  @Post('reportar')
  reportar(@Body() dto: CreateIncidenteDto) {
    return this.service.reportar(dto);
  }

  @Get('bus/:busId')
  findByBus(
    @Param('busId', ParseIntPipe) busId: number,
    @Query('tipo') tipo?: string,
    @Query('estado') estado?: string,
  ) {
    return this.service.findByBus(busId, tipo, estado);
  }

  @Get('bus/:busId/stats')
  getStats(
    @Param('busId', ParseIntPipe) busId: number,
  ) {
    return this.service.getStatsByBus(busId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOneDetallado(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIncidenteDto,
  ) {
    return this.service.update(id, dto);
  }
}