import { Module } from '@nestjs/common';
import { NodosService } from './nodos.service';
import { NodosController } from './nodos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ruta } from '../rutas/entities/ruta.entity';
import { Nodo } from './entities/nodo.entity';
import { RutasModule } from '../rutas/rutas.module';
import { Paradero } from '../paradero/entities/paradero.entity';
import { ParaderoModule } from '../paradero/paradero.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ruta, Nodo, Paradero]), RutasModule, ParaderoModule],
  controllers: [NodosController],
  providers: [NodosService],
})
export class NodosModule {}
