import { Test, TestingModule } from '@nestjs/testing';
import { MonitoreoService } from './monitoreo.service';

describe('MonitoreoService', () => {
  let service: MonitoreoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonitoreoService],
    }).compile();

    service = module.get<MonitoreoService>(MonitoreoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
