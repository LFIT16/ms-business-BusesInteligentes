import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Ruta } from './entities/ruta.entity';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';

@Injectable()
export class RutasService {
  constructor(
    @InjectRepository(Ruta)
    private readonly rutasRepository: Repository<Ruta>,
  ) {}

  async create(createRutaDto: CreateRutaDto): Promise<Ruta> {
    const ruta = this.rutasRepository.create(createRutaDto);
    return await this.rutasRepository.save(ruta);
  }

  async findAll(nombre?: string): Promise<Ruta[]> {
    const where = nombre
      ? { nombre: Like(`%${nombre}%`) }
      : {};

    return await this.rutasRepository.find({
      where,
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        tarifa: true,
        tiempoEstimadoTotal: true,
      },
    });
  }

  async findOne(id: number): Promise<Ruta> {
    const ruta = await this.rutasRepository.findOne({
      where: { id },
      relations: ['nodos'],
      order: {
        nodos: {
          orden: 'ASC',
        },
      },
    });

    if (!ruta) {
      throw new NotFoundException(`Ruta #${id} no encontrada`);
    }

    return ruta;
  }

  async update(id: number, updateRutaDto: UpdateRutaDto): Promise<Ruta> {
    const ruta = await this.findOne(id);

    Object.assign(ruta, updateRutaDto);

    await this.rutasRepository.save(ruta);

    return this.findOne(id);
  }

  async remove(id: number) {
    const ruta = await this.findOne(id);

    if (ruta.nodos && ruta.nodos.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar la ruta porque tiene paraderos asociados',
      );
    }

    await this.rutasRepository.remove(ruta);

    return { message: `Ruta #${id} eliminada correctamente` };
  }
}