// src/historial/historial.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HistorialService } from './historial.service';
import { HistorialController } from './historial.controller';

import { Historial } from './entities/historial.entity';
import { Boleto } from '../boletos/entities/boleto.entity';
import { Nodo } from '../nodos/entities/nodo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Historial,
      Boleto,
      Nodo,
    ]),
  ],
  controllers: [HistorialController],
  providers: [HistorialService],
  exports: [HistorialService],
})
export class HistorialModule {}