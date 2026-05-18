import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';

import { Boleto } from '../boletos/entities/boleto.entity';
import { Ruta } from '../rutas/entities/ruta.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Boleto,
      Ruta,
    ]),
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}