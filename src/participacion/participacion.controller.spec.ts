import { Test, TestingModule } from '@nestjs/testing';
import { ParticipacionController } from './participacion.controller';
import { ParticipacionService } from './participacion.service';

describe('ParticipacionController', () => {
  let controller: ParticipacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipacionController],
      providers: [ParticipacionService],
    }).compile();

    controller = module.get<ParticipacionController>(ParticipacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
