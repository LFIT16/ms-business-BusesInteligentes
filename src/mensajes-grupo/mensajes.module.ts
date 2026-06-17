import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MensajeGrupo } from './entities/mensaje-grupo.entity';
import { LecturaMensaje } from './entities/lectura-mensaje.entity';
import { MembresiaGrupo } from '../grupos/entities/membresia-grupo.entity';
import { MensajesService } from './mensajes.service';
import { MensajesGateway } from './mensajes.gateway';
import { MensajesController } from './mensajes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MensajeGrupo, LecturaMensaje, MembresiaGrupo])],
  providers: [MensajesService, MensajesGateway],
  controllers: [MensajesController],
  exports: [MensajesService],
})
export class MensajesModule {}
