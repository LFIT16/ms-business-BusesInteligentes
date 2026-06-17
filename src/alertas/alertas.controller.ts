import { Controller, Get, Post, Body, Param, Headers, Patch, Query } from '@nestjs/common';
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

  // HU-ENTR-3-008: preview de destinatarios antes de enviar
  @Get('preview-destinatarios')
  previewDestinatarios(
    @Query('alcance') alcance: string,
    @Query('rutaId') rutaId?: string,
    @Query('zona') zona?: string,
    @Headers('authorization') token?: string,
  ) {
    return this.alertasService.contarDestinatarios(alcance, rutaId ? +rutaId : undefined, zona, token);
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