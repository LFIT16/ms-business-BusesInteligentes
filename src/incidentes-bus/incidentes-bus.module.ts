import { Module } from '@nestjs/common';
import { IncidentesBusService } from './incidentes-bus.service';
import { IncidentesBusController } from './incidentes-bus.controller';

@Module({
  controllers: [IncidentesBusController],
  providers: [IncidentesBusService],
  exports: [IncidentesBusService],
})
export class IncidentesBusModule {}
