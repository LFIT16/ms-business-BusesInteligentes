import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MetodoPago } from './entities/metodos-pago.entity';
import { CreateMetodosPagoDto } from './dto/create-metodos-pago.dto';
import { UpdateMetodosPagoDto } from './dto/update-metodos-pago.dto';

@Injectable()
export class MetodosPagoService {
  constructor(
    @InjectRepository(MetodoPago)
    private readonly metodoPagoRepository: Repository<MetodoPago>,
  ) {}

  async create(createMetodoPagoDto: CreateMetodosPagoDto): Promise<MetodoPago> {
    const metodoPago = this.metodoPagoRepository.create(createMetodoPagoDto);

    return await this.metodoPagoRepository.save(metodoPago);
  }

  async findAll(): Promise<MetodoPago[]> {
    return await this.metodoPagoRepository.find({
      relations: ['metodosPagoCiudadano'],
    });
  }

  async findOne(id: number): Promise<MetodoPago> {
    const metodoPago = await this.metodoPagoRepository.findOne({
      where: { id },
      relations: ['metodosPagoCiudadano'],
    });

    if (!metodoPago) {
      throw new NotFoundException(
        `No se encontró el método de pago con id ${id}`,
      );
    }

    return metodoPago;
  }

  async update(
    id: number,
    updateMetodoPagoDto: UpdateMetodosPagoDto,
  ): Promise<MetodoPago> {
    const metodoPago = await this.findOne(id);

    Object.assign(metodoPago, updateMetodoPagoDto);

    return await this.metodoPagoRepository.save(metodoPago);
  }

  async remove(id: number): Promise<{ message: string }> {
    const metodoPago = await this.findOne(id);

    await this.metodoPagoRepository.remove(metodoPago);

    return {
      message: `Método de pago con id ${id} eliminado correctamente`,
    };
  }
}