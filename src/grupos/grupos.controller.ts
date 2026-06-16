import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
} from '@nestjs/common';
import { GruposService } from './grupos.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { UnirseGrupoDto } from './dto/unirse-grupo.dto';
import { PromoverMiembroDto } from './dto/promover-miembro.dto';
import { RemoverMiembroDto } from './dto/remover-miembro.dto';

@Controller('/api/grupos')
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  @Post()
  create(@Body() createGrupoDto: CreateGrupoDto) {
    return this.gruposService.create(createGrupoDto);
  }

  @Get()
  findAll(@Query('busqueda') busqueda?: string) {
    return this.gruposService.findAll(busqueda);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gruposService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGrupoDto: UpdateGrupoDto) {
    return this.gruposService.update(+id, updateGrupoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gruposService.remove(+id);
  }

  @Post(':id/unirse')
  unirse(@Param('id') id: string, @Body() dto: UnirseGrupoDto) {
    return this.gruposService.unirse(+id, dto);
  }

  @Delete(':id/abandonar/:usuarioId')
  abandonar(@Param('id') id: string, @Param('usuarioId') usuarioId: string) {
    return this.gruposService.abandonar(+id, usuarioId);
  }

  @Get(':id/membresia/:usuarioId')
  verificarMembresia(
    @Param('id') id: string,
    @Param('usuarioId') usuarioId: string,
  ) {
    return this.gruposService.verificarMembresia(+id, usuarioId);
  }

  @Get(':id/miembros')
  listarMiembros(
    @Param('id') id: string,
    @Query('nombre') nombre?: string,
    @Headers('authorization') token?: string,
  ) {
    return this.gruposService.listarMiembros(+id, nombre, token);
  }

  @Patch(':id/miembros/promover')
  promover(@Param('id') id: string, @Body() dto: PromoverMiembroDto) {
    return this.gruposService.promover(+id, dto);
  }

  @Delete(':id/miembros/remover')
  remover(@Param('id') id: string, @Body() dto: RemoverMiembroDto) {
    return this.gruposService.remover(+id, dto);
  }

  @Patch(':id/miembros/bloquear')
  bloquear(@Param('id') id: string, @Body() dto: RemoverMiembroDto) {
    return this.gruposService.bloquear(+id, dto);
  }

  @Get(':id/logs')
  obtenerLogs(
    @Param('id') id: string,
    @Headers('authorization') token?: string,
  ) {
    return this.gruposService.obtenerLogs(+id, token);
  }
}