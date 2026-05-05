import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, } from '@nestjs/common';

import { DireccionesService } from './direcciones.service';
import { CreateDireccioneDto } from './dto/create-direccione.dto';
import { UpdateDireccioneDto } from './dto/update-direccione.dto';

@Controller('direcciones')
export class DireccionesController {
  constructor(private readonly direccionesService: DireccionesService) {}

  @Post()
  create(@Body() createDireccionDto: CreateDireccioneDto) {
    return this.direccionesService.create(createDireccionDto);
  }

  @Get()
  findAll() {
    return this.direccionesService.findAll();
  }

  @Get('ciudadano/:ciudadanoId')
  findByCiudadano(@Param('ciudadanoId', ParseIntPipe) ciudadanoId: number) {
    return this.direccionesService.findByCiudadano(ciudadanoId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.direccionesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDireccionDto: UpdateDireccioneDto,
  ) {
    return this.direccionesService.update(id, updateDireccionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.direccionesService.remove(id);
  }
}