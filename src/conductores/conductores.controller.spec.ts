import { Test, TestingModule } from '@nestjs/testing';
import { ConductoresController } from './conductores.controller';
import { ConductoresService } from './conductores.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Conductore } from './entities/conductore.entity';

describe('ConductoresController', () => {
  let controller: ConductoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConductoresController],
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

    controller = module.get<ConductoresController>(ConductoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});