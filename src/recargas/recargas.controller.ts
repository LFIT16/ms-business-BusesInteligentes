import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';

import { RecargasService } from './recargas.service';
import { CreateRecargasDto } from './dto/create-recargas.dto';
import type { Response } from 'express';

@Controller('/api/recargas')
export class RecargasController {
  constructor(private readonly recargasService: RecargasService) {}

  @Post()
  create(@Body() createRecargaDto: CreateRecargasDto) {
    return this.recargasService.create(createRecargaDto);
  }

  @Get()
  findAll() {
    return this.recargasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recargasService.findOne(id);
  }
  
  @Post('epayco/confirmacion')
  confirmacionEpayco(@Body() body: any) {
    return this.recargasService.confirmacionEpayco(body);
  }

  @Get('epayco/respuesta')
  respuestaEpayco(@Query() query: any, @Res() res: Response) {
    return this.recargasService.respuestaEpayco(query, res);
  }

  @Post(':id/aplicar')
  aplicarRecarga(@Param('id', ParseIntPipe) id: number) {
    return this.recargasService.aplicarRecarga(id);
  }

  @Get('ciudadano/:ciudadanoId')
  findByCiudadano(
    @Param('ciudadanoId', ParseIntPipe) ciudadanoId: number,
  ) {
    return this.recargasService.findByCiudadano(ciudadanoId);
  }
}