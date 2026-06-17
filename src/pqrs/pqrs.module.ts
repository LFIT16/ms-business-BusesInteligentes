import { Module } from '@nestjs/common';
import { PQRSService } from './pqrs.service';
import { PQRSController } from './pqrs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PQRS } from './entities/pqr.entity';
import { UsuarioClient } from 'src/clients/usuario.client';

@Module({
  imports: [
    TypeOrmModule.forFeature([PQRS]),
  ],
  providers: [
    PQRSService,
    UsuarioClient,
  ],
  controllers: [PQRSController],
})
export class PqrsModule {}
