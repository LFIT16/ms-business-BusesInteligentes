import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramacionesRutaService } from '../programaciones-ruta/programaciones-ruta.servicie';
import { ProgramacionesRutaController } from './programaciones-ruta.controller';
import { ProgramacionRuta } from './entities/programacion-ruta.entity';
import { Turno } from '../turnos/entities/turno.entity';
import { TurnosModule } from '../turnos/turnos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProgramacionRuta, Turno]),
    TurnosModule, // para acceder al repositorio de Turno
  ],
  controllers: [ProgramacionesRutaController],
  providers: [ProgramacionesRutaService],
  exports: [ProgramacionesRutaService],
})
export class ProgramacionesRutaModule {}