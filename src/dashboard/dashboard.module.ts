import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { IncidentesBus } from '../incidentes-bus/entities/incidentes-bus.entity';

// Importar los módulos existentes
import { GpsModule } from '../gps/gps.module';
import { MonitoreoModule } from '../monitoreo/monitoreo.module';
import { BoletosModule } from '../boletos/boletos.module';
import { IncidentesModule } from '../incidentes/incidentes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IncidentesBus]),
    GpsModule,
    MonitoreoModule,
    BoletosModule,
    IncidentesModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}