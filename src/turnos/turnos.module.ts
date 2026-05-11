import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';
import { Turno } from './entities/turno.entity';
import { BusesModule } from '../buses/buses.module';
import { Bus } from '../buses/entities/bus.entity';
import { ScheduleModule } from '@nestjs/schedule'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Turno, Bus]), // Bus para actualizar gpsActivo
    BusesModule,   
    ScheduleModule.forRoot(),                         // Expone BusesService si se necesita
  ],
  controllers: [TurnosController],
  providers: [TurnosService],
  exports: [TurnosService],
})
export class TurnosModule {}