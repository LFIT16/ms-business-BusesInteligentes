import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

import { HistorialService } from './historial.service';
import { CreateHistorialDto } from './dto/create-historial.dto';
import { UpdateHistorialDto } from './dto/update-historial.dto';

@Controller('/api/historial')
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @Post()
  create(@Body() createHistorialDto: CreateHistorialDto) {
    return this.historialService.create(createHistorialDto);
  }

  @Get()
  findAll() {
    return this.historialService.findAll();
  }

  @Get('boleto/:boletoId')
  findByBoleto(@Param('boletoId', ParseIntPipe) boletoId: number) {
    return this.historialService.findByBoleto(boletoId);
  }

  @Get('nodo/:nodoId')
  findByNodo(@Param('nodoId', ParseIntPipe) nodoId: number) {
    return this.historialService.findByNodo(nodoId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historialService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHistorialDto: UpdateHistorialDto,
  ) {
    return this.historialService.update(id, updateHistorialDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.historialService.remove(id);
  }

  @Get('ciudadano/:ciudadanoId')
  findByCiudadano(
    @Param('ciudadanoId', ParseIntPipe) ciudadanoId: number,
  ) {
    return this.historialService.findByCiudadano(ciudadanoId);
  }
}