import { Test, TestingModule } from '@nestjs/testing';
import { RecargasController } from './recargas.controller';
import { RecargasService } from './recargas.service';

describe('RecargasController', () => {
  let controller: RecargasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecargasController],
      providers: [RecargasService],
    }).compile();

    controller = module.get<RecargasController>(RecargasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
