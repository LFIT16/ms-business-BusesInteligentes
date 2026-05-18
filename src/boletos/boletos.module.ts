import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BoletosController } from './boletos.controller';
import { BoletosService } from './boletos.servicie';

import { Boleto } from './entities/boleto.entity';
import { ProgramacionRuta } from '../programaciones-ruta/entities/programacion-ruta.entity';
import { MetodoPagoCiudadano } from '../metodos-pago-ciudadano/entities/metodos-pago-ciudadano.entity';
import { Paradero } from '../paradero/entities/paradero.entity';
import { Ciudadano } from '../ciudadanos/entities/ciudadano.entity';
import { Historial } from '../historial/entities/historial.entity';
import { Nodo } from '../nodos/entities/nodo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Boleto,
      ProgramacionRuta,
      MetodoPagoCiudadano,
      Paradero,
      Ciudadano,
      Historial,
      Nodo,
    ]),
  ],
  controllers: [BoletosController],
  providers: [BoletosService],
  exports: [BoletosService],
})
export class BoletosModule {}