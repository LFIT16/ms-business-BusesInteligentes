import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParticipacionService } from './participacion.service';
import { CreateParticipacionDto } from './dto/create-participacion.dto';
import { UpdateParticipacionDto } from './dto/update-participacion.dto';

@Controller('participacion')
export class ParticipacionController {
  constructor(private readonly participacionService: ParticipacionService) {}

  @Post()
  create(@Body() createParticipacionDto: CreateParticipacionDto) {
    return this.participacionService.create(createParticipacionDto);
  }

  @Get()
  findAll() {
    return this.participacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.participacionService.findOne(+id);
  }


}
