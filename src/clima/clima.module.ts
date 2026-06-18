import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClimaService } from './clima.service';
import { ClimaController } from './clima.controller';
import { ConfiguracionClima } from './entities/clima.entity';
import { UsuarioClient } from '../clients/usuario.client';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConfiguracionClima]),
  ],
  controllers: [ClimaController],
  providers: [
    ClimaService,
    UsuarioClient,
  ],
})
export class ClimaModule {}