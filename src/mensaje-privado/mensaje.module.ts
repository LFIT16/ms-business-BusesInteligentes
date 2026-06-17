import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DestinatarioPersona } from './entities/destinatario-persona.entity';
import { Mensaje } from './entities/mensaje.entity';
import { MensajeController } from './mensaje.controller';
import { MensajeGateway } from './mensaje.gateway';
import { MensajeService } from './mensaje.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mensaje, DestinatarioPersona]),
  ],
  providers: [MensajeService, MensajeGateway],
  controllers: [MensajeController],
  exports: [MensajeService],
})
export class MensajePrivadoModule {}