import { Test, TestingModule } from '@nestjs/testing';
import { DueñoService } from './dueño.service';

describe('DueñoService', () => {
  let service: DueñoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DueñoService],
    }).compile();

    service = module.get<DueñoService>(DueñoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
