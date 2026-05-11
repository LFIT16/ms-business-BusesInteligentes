import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CiudadanosService } from './ciudadanos.service';
import { CiudadanosController } from './ciudadanos.controller';
import { Ciudadano } from './entities/ciudadano.entity';
import { Direccion } from '../direcciones/entities/direccione.entity';
import { MetodoPagoCiudadano } from '../metodos-pago-ciudadano/entities/metodos-pago-ciudadano.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ciudadano,
      Direccion,
      MetodoPagoCiudadano,
    ]),
  ],
  controllers: [CiudadanosController],
  providers: [CiudadanosService],
  exports: [CiudadanosService],
})
export class CiudadanosModule {}