import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post,} from '@nestjs/common';

import { FotosService } from './fotos.service';
import { CreateFotoDto } from './dto/create-foto.dto';
import { UpdateFotoDto } from './dto/update-foto.dto';

@Controller('/api/fotos')
export class FotosController {
  constructor(private readonly fotosService: FotosService) {}

  @Post()
  create(@Body() createFotoDto: CreateFotoDto) {
    return this.fotosService.create(createFotoDto);
  }

  @Get()
  findAll() {
    return this.fotosService.findAll();
  }

  @Get('incidente-bus/:incidenteBusId')
  findByIncidenteBus(
    @Param('incidenteBusId', ParseIntPipe) incidenteBusId: number,
  ) {
    return this.fotosService.findByIncidenteBus(incidenteBusId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fotosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFotoDto: UpdateFotoDto,
  ) {
    return this.fotosService.update(id, updateFotoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fotosService.remove(id);
  }
}