import { Test, TestingModule } from '@nestjs/testing';
import { ConductoresService } from './conductores.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Conductore } from './entities/conductore.entity';

describe('ConductoresService', () => {
  let service: ConductoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConductoresService,
        {
          provide: getRepositoryToken(Conductore),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConductoresService>(ConductoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});