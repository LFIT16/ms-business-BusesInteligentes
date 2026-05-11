import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Recargas } from './entities/recargas.entity';
import { RecargasService } from './recargas.service';
import { RecargasController } from './recargas.controller';
import { MetodoPagoCiudadano } from '../metodos-pago-ciudadano/entities/metodos-pago-ciudadano.entity';
import { EpaycoModule } from 'src/epayco/epayco.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recargas,
      MetodoPagoCiudadano,
    ]),
    EpaycoModule
  ],
  controllers: [RecargasController],
  providers: [RecargasService],
  exports: [RecargasService],
})
export class RecargasModule {}