import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { IniciarTurnoDto } from './dto/iniciar-turno.dto';
import { EstadoTurno } from './enums/estado-turno.enum';

@Controller('/api/turnos')
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  /** POST /api/turnos — Crea un turno con validaciones de solapamiento */
  @Post()
  create(@Body() createTurnoDto: CreateTurnoDto) {
    return this.turnosService.create(createTurnoDto);
  }

  /** GET /api/turnos?estadoTurno=pendiente — Lista turnos, filtro opcional por estado */
  @Get()
  findAll(@Query('estadoTurno') estadoTurno?: EstadoTurno) {
    return this.turnosService.findAll(estadoTurno);
  }

  /** GET /api/turnos/:id */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.turnosService.findOne(id);
  }

  /** PATCH /api/turnos/:id — Solo turnos pendientes */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTurnoDto: UpdateTurnoDto,
  ) {
    return this.turnosService.update(id, updateTurnoDto);
  }

  /** DELETE /api/turnos/:id — Solo turnos pendientes */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.turnosService.remove(id);
  }

  /** POST /api/turnos/:id/iniciar — HU-ENTR-2-006 */
  @Post(':id/iniciar')
  iniciarTurno(
    @Param('id', ParseIntPipe) id: number,
    @Body() iniciarTurnoDto: IniciarTurnoDto,
  ) {
    return this.turnosService.iniciarTurno(id, iniciarTurnoDto);
  }

  /** POST /api/turnos/:id/finalizar */
  @Post(':id/finalizar')
  finalizarTurno(@Param('id', ParseIntPipe) id: number) {
    return this.turnosService.finalizarTurno(id);
  }

  /** GET /api/turnos/conductor/:conductorId/activo */
  @Get('conductor/:conductorId/activo')
  findTurnoActivoConductor(@Param('conductorId', ParseIntPipe) conductorId: number) {
    return this.turnosService.findTurnoActivoConductor(conductorId);
  }
}