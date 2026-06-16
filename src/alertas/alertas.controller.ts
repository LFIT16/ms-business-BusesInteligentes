import { Controller, Get, Post, Body, Param, Headers, Patch } from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { CreateAlertaDto } from './dto/create-alerta.dto';

@Controller('/api/alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Post()
  create(
    @Body() dto: CreateAlertaDto,
    @Headers('authorization') token: string,
  ) {
    return this.alertasService.create(dto, token);
  }

  @Get()
  findAll() {
    return this.alertasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertasService.findOne(+id);
  }

  @Patch(':id/leido')
  marcarLeido(@Param('id') id: string) {
    return this.alertasService.marcarLeido(+id);
  }
}
