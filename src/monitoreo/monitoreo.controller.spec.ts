import { Test, TestingModule } from '@nestjs/testing';
import { MonitoreoController } from './monitoreo.controller';
import { MonitoreoService } from './monitoreo.service';

describe('MonitoreoController', () => {
  let controller: MonitoreoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoreoController],
      providers: [MonitoreoService],
    }).compile();

    controller = module.get<MonitoreoController>(MonitoreoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
