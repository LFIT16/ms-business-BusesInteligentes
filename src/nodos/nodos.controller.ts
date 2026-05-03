import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NodosService } from './nodos.service';
import { CreateNodoDto } from './dto/create-nodo.dto';
import { UpdateNodoDto } from './dto/update-nodo.dto';

@Controller('/api/nodos')
export class NodosController {
  constructor(private readonly nodosService: NodosService) {}

  @Post()
  create(@Body() createNodoDto: CreateNodoDto) {
    return this.nodosService.create(createNodoDto);
  }

  @Get()
  findAll() {
    return this.nodosService.findAll();
  }

  @Get('ruta/:id')
  findByRuta(@Param('id') id: string) {
    return this.nodosService.findByRuta(+id);
  }

  @Get('paradero/:id')
  findByParadero(@Param('id') id: string) {
    return this.nodosService.findByParadero(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nodosService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nodosService.remove (+id);
  }
}