import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FotosService } from './fotos.service';
import { FotosController } from './fotos.controller';
import { Foto } from './entities/foto.entity';
import { IncidentesBus } from '../incidentes-bus/entities/incidentes-bus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Foto,
      IncidentesBus,
    ]),
  ],
  controllers: [FotosController],
  providers: [FotosService],
  exports: [FotosService],
})
export class FotosModule {}