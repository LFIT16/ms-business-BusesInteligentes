import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IncidentesService } from './incidentes.service';
import { IncidentesController } from './incidentes.controller';

import { Incidente } from './entities/incidente.entity';
import { IncidentesBus } from '../incidentes-bus/entities/incidentes-bus.entity';
import { Foto } from '../fotos/entities/foto.entity';
import { Turno } from '../turnos/entities/turno.entity';

import { GpsModule } from '../gps/gps.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incidente, IncidentesBus, Foto, Turno, ]),
    GpsModule,
  ],
  controllers: [IncidentesController],
  providers: [IncidentesService],
  exports: [IncidentesService],
})
export class IncidentesModule {}