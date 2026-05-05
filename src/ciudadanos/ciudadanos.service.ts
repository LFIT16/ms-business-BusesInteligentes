import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Ciudadano } from './entities/ciudadano.entity';
import { CreateCiudadanoDto } from './dto/create-ciudadano.dto';
import { UpdateCiudadanoDto } from './dto/update-ciudadano.dto';

@Injectable()
export class CiudadanosService {
  constructor(
    @InjectRepository(Ciudadano)
    private readonly ciudadanoRepository: Repository<Ciudadano>,
  ) {}

  async create(createCiudadanoDto: CreateCiudadanoDto): Promise<Ciudadano> {
    const ciudadanoExistente = await this.ciudadanoRepository.findOne({
      where: {
        usuarioId: createCiudadanoDto.usuarioId,
      },
    });

    if (ciudadanoExistente) {
      throw new ConflictException(
        'Este usuario ya se encuentra registrado como ciudadano',
      );
    }

    const ciudadano = this.ciudadanoRepository.create(createCiudadanoDto);

    return await this.ciudadanoRepository.save(ciudadano);
  }

  async findAll(): Promise<Ciudadano[]> {
    return await this.ciudadanoRepository.find({
      relations: [
        'direccion',
        'metodosPagoCiudadano',
        'metodosPagoCiudadano.metodoPago',
      ],
    });
  }

  async findOne(id: number): Promise<Ciudadano> {
    const ciudadano = await this.ciudadanoRepository.findOne({
      where: { id },
      relations: [
        'direccion',
        'metodosPagoCiudadano',
        'metodosPagoCiudadano.metodoPago',
      ],
    });

    if (!ciudadano) {
      throw new NotFoundException(`No se encontró el ciudadano con id ${id}`);
    }

    return ciudadano;
  }

  async findByUsuarioId(usuarioId: string): Promise<Ciudadano> {
    const ciudadano = await this.ciudadanoRepository.findOne({
      where: { usuarioId },
      relations: [
        'direccion',
        'metodosPagoCiudadano',
        'metodosPagoCiudadano.metodoPago',
      ],
    });

    if (!ciudadano) {
      throw new NotFoundException(
        `No se encontró un ciudadano asociado al usuario ${usuarioId}`,
      );
    }

    return ciudadano;
  }

  async update(
    id: number,
    updateCiudadanoDto: UpdateCiudadanoDto,
  ): Promise<Ciudadano> {
    const ciudadano = await this.findOne(id);

    Object.assign(ciudadano, updateCiudadanoDto);

    return await this.ciudadanoRepository.save(ciudadano);
  }

  async remove(id: number): Promise<{ message: string }> {
    const ciudadano = await this.findOne(id);

    await this.ciudadanoRepository.remove(ciudadano);

    return {
      message: `Ciudadano con id ${id} eliminado correctamente`,
    };
  }
}