import { Test, TestingModule } from '@nestjs/testing';
import { PqrsController } from './pqrs.controller';
import { PqrsService } from './pqrs.service';

describe('PqrsController', () => {
  let controller: PqrsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PqrsController],
      providers: [PqrsService],
    }).compile();

    controller = module.get<PqrsController>(PqrsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
