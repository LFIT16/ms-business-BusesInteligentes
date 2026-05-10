import { Test, TestingModule } from '@nestjs/testing';
import { RecargasService } from './recargas.service';

describe('RecargasService', () => {
  let service: RecargasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecargasService],
    }).compile();

    service = module.get<RecargasService>(RecargasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
