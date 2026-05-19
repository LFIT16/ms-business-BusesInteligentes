import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

import { Conductore } from './entities/conductore.entity';
import { CreateConductoreDto } from './dto/create-conductore.dto';
import { UpdateConductoreDto } from './dto/update-conductore.dto';

@Injectable()
export class ConductoresService {
  constructor(
    @InjectRepository(Conductore)
    private readonly conductoresRepository: Repository<Conductore>,
  ) {}

  private async findOrFail(id: number): Promise<Conductore> {
    const conductor = await this.conductoresRepository.findOne({
      where: { id },
      relations: ['empresa'],
    });

    if (!conductor) {
      throw new NotFoundException(`Conductor #${id} no encontrado`);
    }

    return conductor;
  }

  private async asignarRolConductor(
    userId: string,
    authorization?: string,
  ): Promise<void> {
    const securityUrl = process.env.MS_SECURITY;
    const rolConductorId = process.env.ROL_CONDUCTOR_ID;

    if (!securityUrl || !rolConductorId) {
      throw new InternalServerErrorException(
        'MS_SECURITY o ROL_CONDUCTOR_ID no están configurados',
      );
    }

    try {
      await axios.post(
        `${securityUrl}/api/user-role/user/${userId}`,
        {
          roleIds: [
            rolConductorId,
          ],
        },
        {
          headers: authorization
            ? { Authorization: authorization }
            : undefined,
        },
      );
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.response?.data?.message ||
          'No se pudo asignar el rol de conductor al usuario',
      );
    }
  }

  async create(
    dto: CreateConductoreDto,
    authorization?: string,
  ): Promise<Conductore> {
    const yaExisteUser = await this.conductoresRepository.findOne({
      where: { userId: dto.userId },
    });

    if (yaExisteUser) {
      throw new ConflictException(
        `Ya existe un perfil de conductor para el usuario #${dto.userId}`,
      );
    }

    const yaExisteLicencia = await this.conductoresRepository.findOne({
      where: { licencia: dto.licencia },
    });

    if (yaExisteLicencia) {
      throw new ConflictException(
        `Ya existe un conductor con la licencia ${dto.licencia}`,
      );
    }

    const conductor = this.conductoresRepository.create({
      ...dto,
      empresaId: dto.empresaId ?? null,
      fechaVencimientoLicencia: dto.fechaVencimientoLicencia
        ? new Date(dto.fechaVencimientoLicencia)
        : null,
      activo: dto.activo ?? true,
    });

    const conductorGuardado = await this.conductoresRepository.save(conductor);

    if (!conductorGuardado.id || !conductorGuardado.userId) {
      throw new InternalServerErrorException(
        'No se pudo obtener el conductor guardado correctamente',
      );
    }

    await this.asignarRolConductor(
      conductorGuardado.userId,
      authorization,
    );

    return this.findOne(conductorGuardado.id);
  }

  async findAll(): Promise<Conductore[]> {
    return this.conductoresRepository.find({
      relations: ['empresa'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Conductore> {
    return this.findOrFail(id);
  }

  async update(
    id: number,
    dto: UpdateConductoreDto,
  ): Promise<Conductore> {
    const conductor = await this.findOrFail(id);

    if (dto.licencia && dto.licencia !== conductor.licencia) {
      const yaExiste = await this.conductoresRepository.findOne({
        where: { licencia: dto.licencia },
      });

      if (yaExiste) {
        throw new ConflictException(
          `Ya existe un conductor con la licencia ${dto.licencia}`,
        );
      }
    }

    Object.assign(conductor, {
      ...dto,
      empresaId:
        dto.empresaId !== undefined
          ? dto.empresaId
          : conductor.empresaId,
      fechaVencimientoLicencia: dto.fechaVencimientoLicencia
        ? new Date(dto.fechaVencimientoLicencia)
        : conductor.fechaVencimientoLicencia,
    });

    await this.conductoresRepository.save(conductor);

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const conductor = await this.findOrFail(id);

    await this.conductoresRepository.remove(conductor);

    return {
      message: `Conductor #${id} eliminado correctamente`,
    };
  }

  async findByUsuarioId(userId: string): Promise<Conductore | null> {
    return this.conductoresRepository.findOne({
      where: { userId },
      relations: ['empresa'],
    });
  }
}