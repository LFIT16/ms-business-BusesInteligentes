import { Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Foto } from './entities/foto.entity';
import { CreateFotoDto } from './dto/create-foto.dto';
import { UpdateFotoDto } from './dto/update-foto.dto';
import { IncidentesBus } from '../incidentes-bus/entities/incidentes-bus.entity';

@Injectable()
export class FotosService {
  constructor(
    @InjectRepository(Foto)
    private readonly fotosRepository: Repository<Foto>,

    @InjectRepository(IncidentesBus)
    private readonly incidentesBusRepository: Repository<IncidentesBus>,
  ) {}

  async create(createFotoDto: CreateFotoDto): Promise<Foto> {
    const incidenteBus = await this.incidentesBusRepository.findOne({
      where: { id: createFotoDto.incidenteBusId },
    });

    if (!incidenteBus) {
      throw new NotFoundException(
        `IncidenteBus #${createFotoDto.incidenteBusId} no encontrado`,
      );
    }

    const foto = this.fotosRepository.create({
      urlFoto: createFotoDto.urlFoto,
      descripcion: createFotoDto.descripcion,
      incidenteBus,
      incidenteBusId: createFotoDto.incidenteBusId,
    });

    return await this.fotosRepository.save(foto);
  }

  async findAll(): Promise<Foto[]> {
    return await this.fotosRepository.find({
      relations: ['incidenteBus'],
      order: {
        id: 'ASC',
      },
    });
  }

  async findByIncidenteBus(incidenteBusId: number): Promise<Foto[]> {
    return await this.fotosRepository.find({
      where: { incidenteBusId },
      relations: ['incidenteBus'],
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Foto> {
    const foto = await this.fotosRepository.findOne({
      where: { id },
      relations: ['incidenteBus'],
    });

    if (!foto) {
      throw new NotFoundException(`Foto #${id} no encontrada`);
    }

    return foto;
  }

  async update(id: number, updateFotoDto: UpdateFotoDto): Promise<Foto> {
    const foto = await this.findOne(id);

    if (updateFotoDto.incidenteBusId) {
      const incidenteBus = await this.incidentesBusRepository.findOne({
        where: { id: updateFotoDto.incidenteBusId },
      });

      if (!incidenteBus) {
        throw new NotFoundException(
          `IncidenteBus #${updateFotoDto.incidenteBusId} no encontrado`,
        );
      }

      foto.incidenteBus = incidenteBus;
      foto.incidenteBusId = updateFotoDto.incidenteBusId;
    }

    Object.assign(foto, {
      urlFoto: updateFotoDto.urlFoto ?? foto.urlFoto,
      descripcion: updateFotoDto.descripcion ?? foto.descripcion,
    });

    await this.fotosRepository.save(foto);

    return this.findOne(id);
  }

  async remove(id: number) {
    const foto = await this.findOne(id);

    await this.fotosRepository.remove(foto);

    return {
      message: `Foto #${id} eliminada correctamente`,
    };
  }
}