import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProgramacionesRutaService } from '../programaciones-ruta/programaciones-ruta.servicie';
import { CreateProgramacionRutaDto } from './dto/create-programacion-ruta.dto';
import { UpdateProgramacionRutaDto } from './dto/update-programacion-ruta.dto';
import { EstadoProgramacion } from './enums/estado-programacion.enum';

@Controller('/api/programaciones-ruta')
export class ProgramacionesRutaController {
  constructor(private readonly service: ProgramacionesRutaService) {}

  /** POST /api/programaciones-ruta */
  @Post()
  create(@Body() dto: CreateProgramacionRutaDto) {
    return this.service.create(dto);
  }

  /** GET /api/programaciones-ruta?estado=programado */
  @Get()
  findAll(@Query('estado') estado?: EstadoProgramacion) {
    return this.service.findAll(estado);
  }

  /** GET /api/programaciones-ruta/:id */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /** PATCH /api/programaciones-ruta/:id — solo en estado programado */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProgramacionRutaDto,
  ) {
    return this.service.update(id, dto);
  }

  /** DELETE /api/programaciones-ruta/:id — solo en estado programado */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  /** POST /api/programaciones-ruta/:id/cancelar */
  @Post(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.service.cancelar(id);
  }
}