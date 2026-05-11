import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe,Headers, } from '@nestjs/common';

import { CiudadanosService } from './ciudadanos.service';
import { CreateCiudadanoDto } from './dto/create-ciudadano.dto';
import { UpdateCiudadanoDto } from './dto/update-ciudadano.dto';

@Controller('/api/ciudadanos')
export class CiudadanosController {
  constructor(private readonly ciudadanosService: CiudadanosService) {}

  @Post()
  create(
    @Body() createCiudadanoDto: CreateCiudadanoDto,
    @Headers('authorization') authorization: string,
  ) {
    return this.ciudadanosService.create(createCiudadanoDto, authorization);
  }


  @Get()
  findAll() {
    return this.ciudadanosService.findAll();
  }

  @Get('usuario/:usuarioId')
  findByUsuarioId(@Param('usuarioId') usuarioId: string) {
    return this.ciudadanosService.findByUsuarioId(usuarioId);
  }

  @Post('usuario/:usuarioId/find-or-create')
  findOrCreateByUsuarioId(@Param('usuarioId') usuarioId: string) {
    return this.ciudadanosService.findOrCreateByUsuarioId(usuarioId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ciudadanosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCiudadanoDto: UpdateCiudadanoDto,
  ) {
    return this.ciudadanosService.update(id, updateCiudadanoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ciudadanosService.remove(id);
  }
}