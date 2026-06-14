import { Module } from '@nestjs/common';
import { MonitoreoService } from './monitoreo.service';
import { MonitoreoController } from './monitoreo.controller';
import { MonitoreoGateway } from './monitoreo.gateway';
import { GpsModule } from '../gps/gps.module';
import { NodosModule } from '../nodos/nodos.module';
import { ProgramacionesRutaModule } from '../programaciones-ruta/programaciones-ruta.module';

@Module({
  imports: [
    GpsModule,
    NodosModule,
    ProgramacionesRutaModule,
  ],
  controllers: [MonitoreoController],
  providers: [MonitoreoService, MonitoreoGateway],
  exports: [MonitoreoService],
})
export class MonitoreoModule {}