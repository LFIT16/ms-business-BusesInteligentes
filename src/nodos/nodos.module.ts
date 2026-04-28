import { Module } from '@nestjs/common';
import { NodosService } from './nodos.service';
import { NodosController } from './nodos.controller';

@Module({
  controllers: [NodosController],
  providers: [NodosService],
})
export class NodosModule {}
