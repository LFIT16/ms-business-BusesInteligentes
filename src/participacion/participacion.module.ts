import { Module } from '@nestjs/common';
import { ParticipacionService } from './participacion.service';
import { ParticipacionController } from './participacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participacion } from './entities/participacion.entity';
import { Dueño } from 'src/dueño/entities/dueño.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([Participacion, Dueño, Empresa]),
    ],
  controllers: [ParticipacionController],
  providers: [ParticipacionService],
})
export class ParticipacionModule {}
