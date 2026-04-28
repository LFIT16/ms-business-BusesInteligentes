import { Test, TestingModule } from '@nestjs/testing';
import { NodosController } from './nodos.controller';
import { NodosService } from './nodos.service';

describe('NodosController', () => {
  let controller: NodosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NodosController],
      providers: [NodosService],
    }).compile();

    controller = module.get<NodosController>(NodosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
