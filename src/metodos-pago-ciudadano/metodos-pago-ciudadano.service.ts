import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MetodoPagoCiudadano } from './entities/metodos-pago-ciudadano.entity';
import { Ciudadano } from '../ciudadanos/entities/ciudadano.entity';
import { MetodoPago } from '../metodos-pago/entities/metodos-pago.entity';

import { CreateMetodosPagoCiudadanoDto } from './dto/create-metodos-pago-ciudadano.dto';
import { UpdateMetodosPagoCiudadanoDto } from './dto/update-metodos-pago-ciudadano.dto';

@Injectable()
export class MetodosPagoCiudadanoService {
  constructor(
    @InjectRepository(MetodoPagoCiudadano)
    private readonly metodoPagoCiudadanoRepository: Repository<MetodoPagoCiudadano>,

    @InjectRepository(Ciudadano)
    private readonly ciudadanoRepository: Repository<Ciudadano>,

    @InjectRepository(MetodoPago)
    private readonly metodoPagoRepository: Repository<MetodoPago>,
  ) {}

  async create(
    createMetodosPagoCiudadanoDto: CreateMetodosPagoCiudadanoDto,
  ): Promise<MetodoPagoCiudadano> {
    const ciudadano = await this.ciudadanoRepository.findOne({
      where: { id: createMetodosPagoCiudadanoDto.ciudadanoId },
    });

    if (!ciudadano) {
      throw new NotFoundException(
        `No se encontró el ciudadano con id ${createMetodosPagoCiudadanoDto.ciudadanoId}`,
      );
    }

    const metodoPago = await this.metodoPagoRepository.findOne({
      where: { id: createMetodosPagoCiudadanoDto.metodoPagoId },
    });

    if (!metodoPago) {
      throw new NotFoundException(
        `No se encontró el método de pago con id ${createMetodosPagoCiudadanoDto.metodoPagoId}`,
      );
    }

    const metodoExistente = await this.metodoPagoCiudadanoRepository.findOne({
      where: {
        ciudadano: { id: createMetodosPagoCiudadanoDto.ciudadanoId },
        metodoPago: { id: createMetodosPagoCiudadanoDto.metodoPagoId },
        numeroIdentificacion:
          createMetodosPagoCiudadanoDto.numeroIdentificacion,
      },
      relations: ['ciudadano', 'metodoPago'],
    });

    if (metodoExistente) {
      throw new ConflictException(
        'Este método de pago ya está asociado al ciudadano',
      );
    }

    const metodoPagoCiudadano =
      this.metodoPagoCiudadanoRepository.create({
        numeroIdentificacion:
          createMetodosPagoCiudadanoDto.numeroIdentificacion,
        activo: createMetodosPagoCiudadanoDto.activo ?? true,
        ciudadano,
        metodoPago,
      });

    return await this.metodoPagoCiudadanoRepository.save(
      metodoPagoCiudadano,
    );
  }

  async findAll(): Promise<MetodoPagoCiudadano[]> {
    return await this.metodoPagoCiudadanoRepository.find({
      relations: ['ciudadano', 'metodoPago'],
    });
  }

  async findOne(id: number): Promise<MetodoPagoCiudadano> {
    const metodoPagoCiudadano =
      await this.metodoPagoCiudadanoRepository.findOne({
        where: { id },
        relations: ['ciudadano', 'metodoPago'],
      });

    if (!metodoPagoCiudadano) {
      throw new NotFoundException(
        `No se encontró el método de pago del ciudadano con id ${id}`,
      );
    }

    return metodoPagoCiudadano;
  }

  async findByCiudadano(
    ciudadanoId: number,
  ): Promise<MetodoPagoCiudadano[]> {
    return await this.metodoPagoCiudadanoRepository.find({
      where: {
        ciudadano: {
          id: ciudadanoId,
        },
      },
      relations: ['ciudadano', 'metodoPago'],
    });
  }

  async findActivosByCiudadano(
    ciudadanoId: number,
  ): Promise<MetodoPagoCiudadano[]> {
    return await this.metodoPagoCiudadanoRepository.find({
      where: {
        ciudadano: {
          id: ciudadanoId,
        },
        activo: true,
      },
      relations: ['ciudadano', 'metodoPago'],
    });
  }

  async update(
    id: number,
    updateMetodosPagoCiudadanoDtoss: UpdateMetodosPagoCiudadanoDto,
  ): Promise<MetodoPagoCiudadano> {
    const metodoPagoCiudadano = await this.findOne(id);

    if (updateMetodosPagoCiudadanoDtoss.numeroIdentificacion !== undefined) {
      metodoPagoCiudadano.numeroIdentificacion =
        updateMetodosPagoCiudadanoDtoss.numeroIdentificacion;
    }

    if (updateMetodosPagoCiudadanoDtoss.activo !== undefined) {
      metodoPagoCiudadano.activo = updateMetodosPagoCiudadanoDtoss.activo;
    }

    if (updateMetodosPagoCiudadanoDtoss.ciudadanoId !== undefined) {
      const ciudadano = await this.ciudadanoRepository.findOne({
        where: { id: updateMetodosPagoCiudadanoDtoss.ciudadanoId },
      });

      if (!ciudadano) {
        throw new NotFoundException(
          `No se encontró el ciudadano con id ${updateMetodosPagoCiudadanoDtoss.ciudadanoId}`,
        );
      }

      metodoPagoCiudadano.ciudadano = ciudadano;
    }

    if (updateMetodosPagoCiudadanoDtoss.metodoPagoId !== undefined) {
      const metodoPago = await this.metodoPagoRepository.findOne({
        where: { id: updateMetodosPagoCiudadanoDtoss.metodoPagoId },
      });

      if (!metodoPago) {
        throw new NotFoundException(
          `No se encontró el método de pago con id ${updateMetodosPagoCiudadanoDtoss.metodoPagoId}`,
        );
      }

      metodoPagoCiudadano.metodoPago = metodoPago;
    }

    return await this.metodoPagoCiudadanoRepository.save(
      metodoPagoCiudadano,
    );
  }

  async desactivar(id: number): Promise<{ message: string }> {
    const metodoPagoCiudadano = await this.findOne(id);

    metodoPagoCiudadano.activo = false;

    await this.metodoPagoCiudadanoRepository.save(metodoPagoCiudadano);

    return {
      message: `Método de pago del ciudadano con id ${id} desactivado correctamente`,
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    const metodoPagoCiudadano = await this.findOne(id);

    await this.metodoPagoCiudadanoRepository.remove(metodoPagoCiudadano);

    return {
      message: `Método de pago del ciudadano con id ${id} eliminado correctamente`,
    };
  }
}