import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NodosService } from './nodos.service';
import { CreateNodoDto } from './dto/create-nodo.dto';
import { UpdateNodoDto } from './dto/update-nodo.dto';

@Controller('nodos')
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nodosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNodoDto: UpdateNodoDto) {
    return this.nodosService.update(+id, updateNodoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nodosService.remove(+id);
  }
}
