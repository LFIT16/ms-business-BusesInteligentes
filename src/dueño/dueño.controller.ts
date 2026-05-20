import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DueñoService } from './dueño.service';
import { CreateDueñoDto } from './dto/create-dueño.dto';
import { UpdateDueñoDto } from './dto/update-dueño.dto';

@Controller('dueño')
export class DueñoController {
  constructor(private readonly dueñoService: DueñoService) {}

  @Post()
  create(@Body() createDueñoDto: CreateDueñoDto) {
    return this.dueñoService.create(createDueñoDto);
  }

  @Get()
  findAll() {
    return this.dueñoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dueñoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDueñoDto: UpdateDueñoDto) {
    return this.dueñoService.update(+id, updateDueñoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dueñoService.remove(+id);
  }
}
