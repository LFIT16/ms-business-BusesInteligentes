// src/incidentes-bus/incidentes-bus.service.ts

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IncidentesBus } from './entities/incidentes-bus.entity';
import { CreateIncidentesBusDto } from './dto/create-incidentes-bus.dto';
import { UpdateIncidentesBusDto } from './dto/update-incidentes-bus.dto';
import { Bus } from '../buses/entities/bus.entity';

@Injectable()
export class IncidentesBusService {
  constructor(
    @InjectRepository(IncidentesBus)
    private readonly incidenteBusRepository: Repository<IncidentesBus>,

    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,
  ) {}

  async create(
    createIncidenteBusDto: CreateIncidentesBusDto,
  ): Promise<IncidentesBus> {
    const bus = await this.busRepository.findOne({
      where: { id: createIncidenteBusDto.busId },
    });

    if (!bus) {
      throw new NotFoundException(
        `No se encontró el bus con id ${createIncidenteBusDto.busId}`,
      );
    }

    const incidenteBus = this.incidenteBusRepository.create({
      bus,
      busId: createIncidenteBusDto.busId,
      incidenteId: createIncidenteBusDto.incidenteId,
    });

    return await this.incidenteBusRepository.save(incidenteBus);
  }

  async findAll(): Promise<IncidentesBus[]> {
    return await this.incidenteBusRepository.find({
      relations: ['bus', 'fotos'],
      order: {
        fechaRegistro: 'DESC',
      },
    });
  }

  async findByBus(busId: number): Promise<IncidentesBus[]> {
    return await this.incidenteBusRepository.find({
      where: { busId },
      relations: ['bus', 'fotos'],
      order: {
        fechaRegistro: 'DESC',
      },
    });
  }

  async findByIncidente(incidenteId: number): Promise<IncidentesBus[]> {
    return await this.incidenteBusRepository.find({
      where: { incidenteId },
      relations: ['bus', 'fotos'],
      order: {
        fechaRegistro: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<IncidentesBus> {
    const incidenteBus = await this.incidenteBusRepository.findOne({
      where: { id },
      relations: ['bus', 'fotos'],
    });

    if (!incidenteBus) {
      throw new NotFoundException(
        `No se encontró la relación incidente-bus con id ${id}`,
      );
    }

    return incidenteBus;
  }

  async update(
    id: number,
    updateIncidenteBusDto: UpdateIncidentesBusDto,
  ): Promise<IncidentesBus> {
    const incidenteBus = await this.findOne(id);

    if (updateIncidenteBusDto.busId) {
      const bus = await this.busRepository.findOne({
        where: { id: updateIncidenteBusDto.busId },
      });

      if (!bus) {
        throw new NotFoundException(
          `No se encontró el bus con id ${updateIncidenteBusDto.busId}`,
        );
      }

      incidenteBus.bus = bus;
      incidenteBus.busId = updateIncidenteBusDto.busId;
    }

    incidenteBus.incidenteId =
      updateIncidenteBusDto.incidenteId ?? incidenteBus.incidenteId;

    return await this.incidenteBusRepository.save(incidenteBus);
  }

  async remove(id: number): Promise<{ message: string }> {
    const incidenteBus = await this.findOne(id);

    await this.incidenteBusRepository.remove(incidenteBus);

    return {
      message: `Relación incidente-bus con id ${id} eliminada correctamente`,
    };
  }
}