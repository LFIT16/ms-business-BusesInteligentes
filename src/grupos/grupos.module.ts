import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GruposService } from './grupos.service';
import { GruposController } from './grupos.controller';
import { Grupo } from './entities/grupo.entity';
import { MembresiaGrupo } from './entities/membresia-grupo.entity';
import { LogMembresiaGrupo } from './entities/log-membresia-grupo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grupo, MembresiaGrupo, LogMembresiaGrupo]),
  ],
  controllers: [GruposController],
  providers: [GruposService],
  exports: [GruposService],
})
export class GruposModule {}
