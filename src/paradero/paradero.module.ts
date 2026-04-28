import { Module } from '@nestjs/common';
import { ParaderoService } from './paradero.service';
import { ParaderoController } from './paradero.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paradero } from './entities/paradero.entity';
import { Nodo } from 'src/nodos/entities/nodo.entity';
import { Ruta } from 'src/rutas/entities/ruta.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paradero, Nodo, Ruta]),
  ],
  controllers: [ParaderoController],
  providers: [ParaderoService],
  exports: [ParaderoService],
})
export class ParaderoModule {}