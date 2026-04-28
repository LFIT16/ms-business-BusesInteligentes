import { Module } from '@nestjs/common';
import { NodosService } from './nodos.service';
import { NodosController } from './nodos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ruta } from '../rutas/entities/ruta.entity';
import { Nodo } from './entities/nodo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ruta, Nodo])],
  controllers: [NodosController],
  providers: [NodosService],
})
export class NodosModule {}
