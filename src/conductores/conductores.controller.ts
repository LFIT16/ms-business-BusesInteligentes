import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ConductoresService } from './conductores.service';
import { CreateConductoreDto } from './dto/create-conductore.dto';
import { UpdateConductoreDto } from './dto/update-conductore.dto';

@Controller('/api/conductores')
export class ConductoresController {
  constructor(private readonly conductoresService: ConductoresService) {}

  /** POST /api/conductores */
  @Post()
  create(@Body() createConductoreDto: CreateConductoreDto) {
    return this.conductoresService.create(createConductoreDto);
  }

  /** GET /api/conductores */
  @Get()
  findAll() {
    return this.conductoresService.findAll();
  }

  /** GET /api/conductores/:id */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.conductoresService.findOne(id);
  }

  /** PATCH /api/conductores/:id */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConductoreDto: UpdateConductoreDto,
  ) {
    return this.conductoresService.update(id, updateConductoreDto);
  }

  /** DELETE /api/conductores/:id */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.conductoresService.remove(id);
  }
}