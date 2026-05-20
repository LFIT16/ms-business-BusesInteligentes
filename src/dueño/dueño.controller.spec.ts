import { Test, TestingModule } from '@nestjs/testing';
import { DueñoController } from './dueño.controller';
import { DueñoService } from './dueño.service';

describe('DueñoController', () => {
  let controller: DueñoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DueñoController],
      providers: [DueñoService],
    }).compile();

    controller = module.get<DueñoController>(DueñoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
