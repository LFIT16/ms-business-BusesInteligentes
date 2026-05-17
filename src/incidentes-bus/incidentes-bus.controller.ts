import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, } from '@nestjs/common';

import { IncidentesBusService } from './incidentes-bus.service';
import { CreateIncidentesBusDto } from './dto/create-incidentes-bus.dto';
import { UpdateIncidentesBusDto } from './dto/update-incidentes-bus.dto';

@Controller('/api/incidentes-bus')
export class IncidentesBusController {
  constructor(
    private readonly incidentesBusService: IncidentesBusService,
  ) {}

  @Post()
  create(@Body() createIncidenteBusDto: CreateIncidentesBusDto) {
    return this.incidentesBusService.create(createIncidenteBusDto);
  }

  @Get()
  findAll() {
    return this.incidentesBusService.findAll();
  }

  @Get('bus/:busId')
  findByBus(@Param('busId', ParseIntPipe) busId: number) {
    return this.incidentesBusService.findByBus(busId);
  }

  @Get('incidente/:incidenteId')
  findByIncidente(
    @Param('incidenteId', ParseIntPipe) incidenteId: number,
  ) {
    return this.incidentesBusService.findByIncidente(incidenteId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.incidentesBusService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIncidenteBusDto: UpdateIncidentesBusDto,
  ) {
    return this.incidentesBusService.update(id, updateIncidenteBusDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.incidentesBusService.remove(id);
  }
}