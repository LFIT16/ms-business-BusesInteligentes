// src/historial/historial.service.ts

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Historial } from './entities/historial.entity';
import { CreateHistorialDto } from './dto/create-historial.dto';
import { UpdateHistorialDto } from './dto/update-historial.dto';

import { Boleto } from '../boletos/entities/boleto.entity';
import { Nodo } from '../nodos/entities/nodo.entity';

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(Historial)
    private readonly historialRepository: Repository<Historial>,

    @InjectRepository(Boleto)
    private readonly boletoRepository: Repository<Boleto>,

    @InjectRepository(Nodo)
    private readonly nodoRepository: Repository<Nodo>,
  ) {}

  async create(createHistorialDto: CreateHistorialDto): Promise<Historial> {
    const boleto = await this.boletoRepository.findOne({
      where: { id: createHistorialDto.boletoId },
    });

    if (!boleto) {
      throw new NotFoundException(
        `No se encontró el boleto con id ${createHistorialDto.boletoId}`,
      );
    }

    const nodo = await this.nodoRepository.findOne({
      where: { id: createHistorialDto.nodoId },
      relations: ['ruta', 'paradero'],
    });

    if (!nodo) {
      throw new NotFoundException(
        `No se encontró el nodo con id ${createHistorialDto.nodoId}`,
      );
    }

    const historial = this.historialRepository.create({
      boleto,
      boletoId: createHistorialDto.boletoId,
      nodo,
      nodoId: createHistorialDto.nodoId,
      tipo: createHistorialDto.tipo,
    });

    return await this.historialRepository.save(historial);
  }

  async findAll() {
  return await this.historialRepository.find({
    relations: [
      'boleto',
      'boleto.ciudadano',
      'boleto.programacionRuta',
      'boleto.programacionRuta.ruta',
      'nodo',
      'nodo.ruta',
      'nodo.paradero',
    ],
    order: {
      fechaValidacion: 'DESC',
    },
  });
}

  async findOne(id: number): Promise<Historial> {
    const historial = await this.historialRepository.findOne({
      where: { id },
      relations: [
        'boleto',
        'nodo',
        'nodo.ruta',
        'nodo.paradero',
      ],
    });

    if (!historial) {
      throw new NotFoundException(`Historial #${id} no encontrado`);
    }

    return historial;
  }

  async findByBoleto(boletoId: number): Promise<Historial[]> {
    return await this.historialRepository.find({
      where: {
        boletoId,
      },
      relations: [
        'boleto',
        'boleto.programacionRuta',
        'boleto.programacionRuta.ruta',
        'boleto.programacionRuta.bus',

        'nodo',
        'nodo.ruta',
        'nodo.paradero',
      ],
      order: {
        fechaValidacion: 'ASC',
      },
    });
  }

  async findByNodo(nodoId: number): Promise<Historial[]> {
    return await this.historialRepository.find({
      where: {
        nodoId,
      },
      relations: [
        'boleto',
        'nodo',
        'nodo.ruta',
        'nodo.paradero',
      ],
      order: {
        fechaValidacion: 'DESC',
      },
    });
  }

  async update(
    id: number,
    updateHistorialDto: UpdateHistorialDto,
  ): Promise<Historial> {
    const historial = await this.findOne(id);

    if (updateHistorialDto.boletoId) {
      const boleto = await this.boletoRepository.findOne({
        where: { id: updateHistorialDto.boletoId },
      });

      if (!boleto) {
        throw new NotFoundException(
          `No se encontró el boleto con id ${updateHistorialDto.boletoId}`,
        );
      }

      historial.boleto = boleto;
      historial.boletoId = updateHistorialDto.boletoId;
    }

    if (updateHistorialDto.nodoId) {
      const nodo = await this.nodoRepository.findOne({
        where: { id: updateHistorialDto.nodoId },
        relations: ['ruta', 'paradero'],
      });

      if (!nodo) {
        throw new NotFoundException(
          `No se encontró el nodo con id ${updateHistorialDto.nodoId}`,
        );
      }

      historial.nodo = nodo;
      historial.nodoId = updateHistorialDto.nodoId;
    }

    historial.tipo = updateHistorialDto.tipo ?? historial.tipo;

    return await this.historialRepository.save(historial);
  }

  async remove(id: number): Promise<{ message: string }> {
    const historial = await this.findOne(id);

    await this.historialRepository.remove(historial);

    return {
      message: `Historial #${id} eliminado correctamente`,
    };
  }

  async findByCiudadano(ciudadanoId: number) {
    return await this.historialRepository.find({
      where: {
        boleto: {
          ciudadano: {
            id: ciudadanoId,
          },
        },
      },
      relations: [
        'boleto',
        'boleto.ciudadano',
        'boleto.programacionRuta',
        'boleto.programacionRuta.ruta',
        'nodo',
        'nodo.ruta',
        'nodo.paradero',
      ],
      order: {
        fechaValidacion: 'DESC',
      },
    });
  }
}