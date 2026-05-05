import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Direccion } from './entities/direccione.entity';
import { Ciudadano } from '../ciudadanos/entities/ciudadano.entity';
import { CreateDireccioneDto } from './dto/create-direccione.dto';
import { UpdateDireccioneDto } from './dto/update-direccione.dto';

@Injectable()
export class DireccionesService {
  constructor(
    @InjectRepository(Direccion)
    private readonly direccionRepository: Repository<Direccion>,

    @InjectRepository(Ciudadano)
    private readonly ciudadanoRepository: Repository<Ciudadano>,
  ) {}

  async create(createDireccionDto: CreateDireccioneDto): Promise<Direccion> {
    const ciudadano = await this.ciudadanoRepository.findOne({
      where: { id: createDireccionDto.ciudadanoId },
      relations: ['direccion'],
    });

    if (!ciudadano) {
      throw new NotFoundException(
        `No se encontró el ciudadano con id ${createDireccionDto.ciudadanoId}`,
      );
    }

    if (ciudadano.direccion) {
      throw new ConflictException(
        'Este ciudadano ya tiene una dirección registrada',
      );
    }

    const direccion = this.direccionRepository.create({
      pais: createDireccionDto.pais,
      ciudad: createDireccionDto.ciudad,
      barrio: createDireccionDto.barrio,
      calle: createDireccionDto.calle,
      numero: createDireccionDto.numero,
      referencia: createDireccionDto.referencia,
      codigoPostal: createDireccionDto.codigoPostal,
      ciudadano,
    });

    return await this.direccionRepository.save(direccion);
  }

  async findAll(): Promise<Direccion[]> {
    return await this.direccionRepository.find({
      relations: ['ciudadano'],
    });
  }

  async findOne(id: number): Promise<Direccion> {
    const direccion = await this.direccionRepository.findOne({
      where: { id },
      relations: ['ciudadano'],
    });

    if (!direccion) {
      throw new NotFoundException(`No se encontró la dirección con id ${id}`);
    }

    return direccion;
  }

  async findByCiudadano(ciudadanoId: number): Promise<Direccion> {
    const direccion = await this.direccionRepository.findOne({
      where: {
        ciudadano: {
          id: ciudadanoId,
        },
      },
      relations: ['ciudadano'],
    });

    if (!direccion) {
      throw new NotFoundException(
        `No se encontró dirección para el ciudadano con id ${ciudadanoId}`,
      );
    }

    return direccion;
  }

  async update(
    id: number,
    updateDireccionDto: UpdateDireccioneDto,
  ): Promise<Direccion> {
    const direccion = await this.findOne(id);

    Object.assign(direccion, {
      pais: updateDireccionDto.pais ?? direccion.pais,
      ciudad: updateDireccionDto.ciudad ?? direccion.ciudad,
      barrio: updateDireccionDto.barrio ?? direccion.barrio,
      calle: updateDireccionDto.calle ?? direccion.calle,
      numero: updateDireccionDto.numero ?? direccion.numero,
      referencia: updateDireccionDto.referencia ?? direccion.referencia,
      codigoPostal: updateDireccionDto.codigoPostal ?? direccion.codigoPostal,
    });

    return await this.direccionRepository.save(direccion);
  }

  async remove(id: number): Promise<{ message: string }> {
    const direccion = await this.findOne(id);

    await this.direccionRepository.remove(direccion);

    return {
      message: `Dirección con id ${id} eliminada correctamente`,
    };
  }
}