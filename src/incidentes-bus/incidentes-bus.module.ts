import { Module } from '@nestjs/common';
import { IncidentesBusService } from './incidentes-bus.service';
import { IncidentesBusController } from './incidentes-bus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentesBus } from './entities/incidentes-bus.entity';
import { Bus } from '../buses/entities/bus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IncidentesBus,
      Bus,
    ]),
  ],
  controllers: [IncidentesBusController],
  providers: [IncidentesBusService],
  exports: [IncidentesBusService],
})
export class IncidentesBusModule {}
