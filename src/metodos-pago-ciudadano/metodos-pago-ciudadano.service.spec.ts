import { Test, TestingModule } from '@nestjs/testing';
import { MetodosPagoCiudadanoService } from './metodos-pago-ciudadano.service';

describe('MetodosPagoCiudadanoService', () => {
  let service: MetodosPagoCiudadanoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetodosPagoCiudadanoService],
    }).compile();

    service = module.get<MetodosPagoCiudadanoService>(MetodosPagoCiudadanoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
