import { Test, TestingModule } from '@nestjs/testing';
import { ParticipacionService } from './participacion.service';

describe('ParticipacionService', () => {
  let service: ParticipacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParticipacionService],
    }).compile();

    service = module.get<ParticipacionService>(ParticipacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
