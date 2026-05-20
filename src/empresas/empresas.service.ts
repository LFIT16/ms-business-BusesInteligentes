import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { Empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresasRepository: Repository<Empresa>,
  ) {}

  async create(createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    const nit = createEmpresaDto.nit?.trim();

    const existeNit = await this.empresasRepository.findOne({
      where: {
        nit,
      },
    });

    if (existeNit) {
      throw new BadRequestException(
        'Ya existe una empresa registrada con este NIT.',
      );
    }

    const empresa = this.empresasRepository.create({
      nit,
      nombre: createEmpresaDto.nombre?.trim(),
      telefono: createEmpresaDto.telefono?.trim(),
      email: createEmpresaDto.email?.trim(),
      direccion: createEmpresaDto.direccion?.trim(),
      activo:
        createEmpresaDto.activo !== undefined
          ? createEmpresaDto.activo
          : true,
    });

    return await this.empresasRepository.save(empresa);
  }

  async findAll(nombre?: string): Promise<Empresa[]> {
    const where = nombre
      ? {
          nombre: Like(`%${nombre}%`),
        }
      : {};

    return await this.empresasRepository.find({
      where,
      relations: [
        'buses',
        'conductores',
        'participacion',
      ],
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Empresa> {
    const empresa = await this.empresasRepository.findOne({
      where: {
        id,
      },
      relations: [
        'buses',
        'conductores',
        'participacion'
      ],
    });

    if (!empresa) {
      throw new NotFoundException(
        `Empresa #${id} no encontrada`,
      );
    }

    return empresa;
  }

  async update(
    id: number,
    updateEmpresaDto: UpdateEmpresaDto,
  ): Promise<Empresa> {
    const empresa = await this.findOne(id);

    if (
      updateEmpresaDto.nit &&
      updateEmpresaDto.nit.trim() !== empresa.nit
    ) {
      const existeNit = await this.empresasRepository.findOne({
        where: {
          nit: updateEmpresaDto.nit.trim(),
        },
      });

      if (existeNit) {
        throw new BadRequestException(
          'Ya existe una empresa registrada con este NIT.',
        );
      }
    }

    empresa.nit =
      updateEmpresaDto.nit !== undefined
        ? updateEmpresaDto.nit.trim()
        : empresa.nit;

    empresa.nombre =
      updateEmpresaDto.nombre !== undefined
        ? updateEmpresaDto.nombre.trim()
        : empresa.nombre;

    empresa.telefono =
      updateEmpresaDto.telefono !== undefined
        ? updateEmpresaDto.telefono.trim()
        : empresa.telefono;

    empresa.email =
      updateEmpresaDto.email !== undefined
        ? updateEmpresaDto.email.trim()
        : empresa.email;

    empresa.direccion =
      updateEmpresaDto.direccion !== undefined
        ? updateEmpresaDto.direccion.trim()
        : empresa.direccion;

    empresa.activo =
      updateEmpresaDto.activo !== undefined
        ? updateEmpresaDto.activo
        : empresa.activo;

    await this.empresasRepository.save(empresa);

    return await this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const empresa = await this.findOne(id);

    if (empresa.buses && empresa.buses.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar la empresa porque tiene buses asociados.',
      );
    }

    if (empresa.conductores && empresa.conductores.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar la empresa porque tiene conductores asociados.',
      );
    }

    await this.empresasRepository.remove(empresa);

    return {
      message: `Empresa #${id} eliminada correctamente`,
    };
  }
}