import { Test, TestingModule } from '@nestjs/testing';
import { IncidentesBusController } from './incidentes-bus.controller';
import { IncidentesBusService } from './incidentes-bus.service';

describe('IncidentesBusController', () => {
  let controller: IncidentesBusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncidentesBusController],
      providers: [IncidentesBusService],
    }).compile();

    controller = module.get<IncidentesBusController>(IncidentesBusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
