import { Module } from '@nestjs/common';
import { NodosService } from './nodos.service';
import { NodosController } from './nodos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ruta } from '../rutas/entities/ruta.entity';
import { Nodo } from './entities/nodo.entity';
import { RutasModule } from '../rutas/rutas.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ruta, Nodo]), RutasModule],
  controllers: [NodosController],
  providers: [NodosService],
})
export class NodosModule {}
