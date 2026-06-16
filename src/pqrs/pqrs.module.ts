import { Module } from '@nestjs/common';
import { PqrsService } from './pqrs.service';
import { PqrsController } from './pqrs.controller';

@Module({
  controllers: [PqrsController],
  providers: [PqrsService],
})
export class PqrsModule {}
