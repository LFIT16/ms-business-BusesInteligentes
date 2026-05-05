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

import { MetodosPagoCiudadanoService } from './metodos-pago-ciudadano.service';
import { CreateMetodosPagoCiudadanoDto } from './dto/create-metodos-pago-ciudadano.dto';
import { UpdateMetodosPagoCiudadanoDto } from './dto/update-metodos-pago-ciudadano.dto';

@Controller('metodos-pago-ciudadano')
export class MetodosPagoCiudadanoController {
  constructor(
    private readonly metodosPagoCiudadanoService: MetodosPagoCiudadanoService,
  ) {}

  @Post()
  create(@Body() createMetodoPagoCiudadanoDto: CreateMetodosPagoCiudadanoDto) {
    return this.metodosPagoCiudadanoService.create(
      createMetodoPagoCiudadanoDto,
    );
  }

  @Get()
  findAll() {
    return this.metodosPagoCiudadanoService.findAll();
  }

  @Get('ciudadano/:ciudadanoId')
  findByCiudadano(@Param('ciudadanoId', ParseIntPipe) ciudadanoId: number) {
    return this.metodosPagoCiudadanoService.findByCiudadano(ciudadanoId);
  }

  @Get('ciudadano/:ciudadanoId/activos')
  findActivosByCiudadano(
    @Param('ciudadanoId', ParseIntPipe) ciudadanoId: number,
  ) {
    return this.metodosPagoCiudadanoService.findActivosByCiudadano(
      ciudadanoId,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.metodosPagoCiudadanoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMetodoPagoCiudadanoDto: UpdateMetodosPagoCiudadanoDto,
  ) {
    return this.metodosPagoCiudadanoService.update(
      id,
      updateMetodoPagoCiudadanoDto,
    );
  }

  @Patch(':id/desactivar')
  desactivar(@Param('id', ParseIntPipe) id: number) {
    return this.metodosPagoCiudadanoService.desactivar(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.metodosPagoCiudadanoService.remove(id);
  }
}