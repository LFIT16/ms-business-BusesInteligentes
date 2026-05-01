import { Module } from '@nestjs/common';
import { BusesService } from './buses.service';
import { BusesController } from './buses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bus } from './entities/bus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bus])],
    controllers: [BusesController],
    providers: [BusesService],
    exports: [BusesService], 
})
export class BusesModule {}
