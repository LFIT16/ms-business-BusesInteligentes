import { Module }        from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurnosService }    from './turnos.service';
import { TurnosController } from './turnos.controller';
import { Turno }            from './entities/turno.entity';
import { BusesModule }      from '../buses/buses.module';
import { Bus }              from '../buses/entities/bus.entity';
import { ProgramacionRuta } from '../programaciones-ruta/entities/programacion-ruta.entity'; // ← NUEVO
import { Conductore } from 'src/conductores/entities/conductore.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Turno, Bus, ProgramacionRuta, Conductore]), // ← AGREGAR ProgramacionRuta y Conductore
    BusesModule,
  ],
  controllers: [TurnosController],
  providers:   [TurnosService],
  exports:     [TurnosService],
})
export class TurnosModule {}