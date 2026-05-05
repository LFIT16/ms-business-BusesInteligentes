import { Test, TestingModule } from '@nestjs/testing';
import { MetodosPagoCiudadanoController } from './metodos-pago-ciudadano.controller';
import { MetodosPagoCiudadanoService } from './metodos-pago-ciudadano.service';

describe('MetodosPagoCiudadanoController', () => {
  let controller: MetodosPagoCiudadanoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetodosPagoCiudadanoController],
      providers: [MetodosPagoCiudadanoService],
    }).compile();

    controller = module.get<MetodosPagoCiudadanoController>(MetodosPagoCiudadanoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
