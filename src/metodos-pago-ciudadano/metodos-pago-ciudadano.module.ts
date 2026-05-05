import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetodosPagoCiudadanoService } from './metodos-pago-ciudadano.service';
import { MetodosPagoCiudadanoController } from './metodos-pago-ciudadano.controller';

import { MetodoPagoCiudadano } from './entities/metodos-pago-ciudadano.entity';
import { Ciudadano } from '../ciudadanos/entities/ciudadano.entity';
import { MetodoPago } from '../metodos-pago/entities/metodos-pago.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MetodoPagoCiudadano,
      Ciudadano,
      MetodoPago,
    ]),
  ],
  controllers: [MetodosPagoCiudadanoController],
  providers: [MetodosPagoCiudadanoService],
  exports: [MetodosPagoCiudadanoService],
})
export class MetodosPagoCiudadanoModule {}