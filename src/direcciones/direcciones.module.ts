import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DireccionesService } from './direcciones.service';
import { DireccionesController } from './direcciones.controller';
import { Direccion } from './entities/direccione.entity';
import { Ciudadano } from '../ciudadanos/entities/ciudadano.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Direccion, Ciudadano])],
  controllers: [DireccionesController],
  providers: [DireccionesService],
  exports: [DireccionesService],
})
export class DireccionesModule {}