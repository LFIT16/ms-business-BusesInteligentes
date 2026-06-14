import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GpsService } from './gps.service';
import { GpsController } from './gps.controller';
import { Gps } from './entities/gps.entity';
import { SimuladorGpsService } from './simulador-gps.service';
import { ProgramacionesRutaModule } from '../programaciones-ruta/programaciones-ruta.module';
import { NodosModule } from '../nodos/nodos.module';
import { IncidentesBus } from '../incidentes-bus/entities/incidentes-bus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gps, IncidentesBus]),
    ProgramacionesRutaModule,
    NodosModule
  ],
  controllers: [GpsController],
  providers: [GpsService, SimuladorGpsService],
  exports: [GpsService],
})
export class GpsModule {}