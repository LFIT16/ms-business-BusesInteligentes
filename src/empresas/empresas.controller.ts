import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Controller('/api/empresas')
export class EmpresasController {
  constructor(
    private readonly empresasService: EmpresasService,
  ) {}

  @Post()
  create(
    @Body() createEmpresaDto: CreateEmpresaDto,
  ) {
    return this.empresasService.create(createEmpresaDto);
  }

  @Get()
  findAll(
    @Query('nombre') nombre?: string,
  ) {
    return this.empresasService.findAll(nombre);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.empresasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
  ) {
    return this.empresasService.update(id, updateEmpresaDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.empresasService.remove(id);
  }
}