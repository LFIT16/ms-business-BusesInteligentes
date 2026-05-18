import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { GpsService } from './gps.service';
import { CreateGpsDto } from './dto/create-gps.dto';
import { UpdateGpsDto } from './dto/update-gps.dto';

@Controller('/api/gps')
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Post()
  create(@Body() createGpsDto: CreateGpsDto) {
    return this.gpsService.create(createGpsDto);
  }

  @Get()
  findAll() {
    return this.gpsService.findAll();
  }

  @Get('bus/:busId')
  findByBus(
    @Param('busId', ParseIntPipe) busId: number,
  ) {
    return this.gpsService.findByBus(busId);
  }

  @Patch('bus/:busId/activar')
  activarGps(
    @Param('busId', ParseIntPipe) busId: number,
  ) {
    return this.gpsService.activarGpsDelBus(busId);
  }

  @Patch('bus/:busId/desactivar')
  desactivarGps(
    @Param('busId', ParseIntPipe) busId: number,
  ) {
    return this.gpsService.desactivarGpsDelBus(busId);
  }

  @Patch('bus/:busId/ubicacion')
  actualizarUbicacion(
    @Param('busId', ParseIntPipe) busId: number,
    @Body() body: any,
  ) {
    return this.gpsService.actualizarUbicacion(
      busId,
      Number(body.latitud),
      Number(body.longitud),
      body.velocidad !== undefined
        ? Number(body.velocidad)
        : undefined,
      body.rumbo !== undefined
        ? Number(body.rumbo)
        : undefined,
    );
  }

  @Post('bus/:busId/simular')
  simularMovimiento(
    @Param('busId', ParseIntPipe) busId: number,
  ) {
    return this.gpsService.simularMovimiento(busId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.gpsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGpsDto: UpdateGpsDto,
  ) {
    return this.gpsService.update(id, updateGpsDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.gpsService.remove(id);
  }
}