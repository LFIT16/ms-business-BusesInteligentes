import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

import { Ciudadano } from './entities/ciudadano.entity';
import { CreateCiudadanoDto } from './dto/create-ciudadano.dto';
import { UpdateCiudadanoDto } from './dto/update-ciudadano.dto';

@Injectable()
export class CiudadanosService {
  constructor(
    @InjectRepository(Ciudadano)
    private readonly ciudadanoRepository: Repository<Ciudadano>,
  ) {}

  private async asignarRolCiudadano(
    usuarioId: string,
    authorization?: string,
  ): Promise<void> {
    const securityUrl = process.env.MS_SECURITY;
    const rolCiudadanoId = process.env.ROL_CIUDADANO_ID;

    if (!securityUrl || !rolCiudadanoId) {
      throw new InternalServerErrorException(
        'MS_SECURITY o ROL_CIUDADANO_ID no están configurados',
      );
    }

    const response = await axios.post(
      `${securityUrl}/api/user-role/user/${usuarioId}`,
      {
        roleIds: [
          rolCiudadanoId,
        ],
      },
      {
        headers: authorization
          ? { Authorization: authorization }
          : undefined,
      },
    );

  }
  async create(createCiudadanoDto: CreateCiudadanoDto,authorization?: string,): Promise<Ciudadano> {
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

    const ciudadanoGuardado = await this.ciudadanoRepository.save(ciudadano);

    if (!ciudadanoGuardado.id) {
      throw new InternalServerErrorException(
        'No se pudo obtener el ID del ciudadano guardado',
      );
    }

    await this.asignarRolCiudadano(
      ciudadanoGuardado.usuarioId!,
      authorization,
    );

    return await this.findOne(ciudadanoGuardado.id);
  }
  async findAll(): Promise<Ciudadano[]> {
    return await this.ciudadanoRepository.find({
      relations: [
        'direcciones',
        'metodosPagoCiudadano',
        'metodosPagoCiudadano.metodoPago',
      ],
    });
  }

  async findOne(id: number): Promise<Ciudadano> {
    const ciudadano = await this.ciudadanoRepository.findOne({
      where: { id },
      relations: [
        'direcciones',
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
        'direcciones',
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

  async findOrCreateByUsuarioId(usuarioId: string): Promise<Ciudadano> {
    let ciudadano = await this.ciudadanoRepository.findOne({
      where: { usuarioId },
      relations: [
        'direcciones',
        'metodosPagoCiudadano',
        'metodosPagoCiudadano.metodoPago',
      ],
    });

    if (!ciudadano) {
      ciudadano = this.ciudadanoRepository.create({
        usuarioId,
      });

      ciudadano = await this.ciudadanoRepository.save(ciudadano);
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