import { Module } from '@nestjs/common';
import { DueñoService } from './dueño.service';
import { DueñoController } from './dueño.controller';

@Module({
  controllers: [DueñoController],
  providers: [DueñoService],
})
export class DueñoModule {}
