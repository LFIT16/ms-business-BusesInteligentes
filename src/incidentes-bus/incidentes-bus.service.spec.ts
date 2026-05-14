import { Test, TestingModule } from '@nestjs/testing';
import { IncidentesBusService } from './incidentes-bus.service';

describe('IncidentesBusService', () => {
  let service: IncidentesBusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IncidentesBusService],
    }).compile();

    service = module.get<IncidentesBusService>(IncidentesBusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
