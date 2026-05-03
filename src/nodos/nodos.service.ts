import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nodo } from './entities/nodo.entity';
import { CreateNodoDto } from './dto/create-nodo.dto';
import { RutasService } from '../rutas/rutas.service';
import { ParaderoService } from 'src/paradero/paradero.service';

@Injectable()
export class NodosService {
  constructor(
    @InjectRepository(Nodo)
    private readonly nodosRepository: Repository<Nodo>,

    private readonly rutasService: RutasService,

    private readonly paraderosService: ParaderoService,
  ) {}

  private resolveId(value: any): number | undefined {
    if (!value) return undefined;
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && 'id' in value) return value.id;
    return undefined;
  }

  async create(createNodoDto: CreateNodoDto): Promise<Nodo> {
    const rutaId = this.resolveId(createNodoDto.ruta);
    const paraderoId = this.resolveId(createNodoDto.paradero);

    if (!rutaId) {
      throw new BadRequestException('ruta id is required');
    }

    if (!paraderoId) {
      throw new BadRequestException('paradero id is required');
    }

    if (createNodoDto.orden === undefined || createNodoDto.orden === null) {
      throw new BadRequestException('orden is required');
    }

    const ruta = await this.rutasService.findOne(rutaId);
    const paradero = await this.paraderosService.findOne(paraderoId);

    const nodo = this.nodosRepository.create({
      orden: Number(createNodoDto.orden),
      ruta,
      paradero,
    });

    return await this.nodosRepository.save(nodo);
  }

  async findAll(): Promise<Nodo[]> {
    return await this.nodosRepository.find({
      relations: ['ruta', 'paradero'],
      order: {
        ruta: {
          id: 'ASC',
        },
        orden: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Nodo> {
    const nodo = await this.nodosRepository.findOne({
      where: { id },
      relations: ['ruta', 'paradero'],
    });

    if (!nodo) {
      throw new NotFoundException(`Nodo #${id} no encontrado`);
    }

    return nodo;
  }

  async findByRuta(rutaId: number): Promise<Nodo[]> {
    await this.rutasService.findOne(rutaId);

    return await this.nodosRepository.find({
      where: {
        ruta: {
          id: rutaId,
        },
      },
      relations: ['ruta', 'paradero'],
      order: {
        orden: 'ASC',
      },
    });
  }

  async findByParadero(paraderoId: number): Promise<Nodo[]> {
    await this.paraderosService.findOne(paraderoId);

    return await this.nodosRepository.find({
      where: {
        paradero: {
          id: paraderoId,
        },
      },
      relations: ['ruta', 'paradero'],
      order: {
        ruta: {
          id: 'ASC',
        },
        orden: 'ASC',
      },
    });
  }

  async remove(id: number) {
    const nodo = await this.findOne(id);

    await this.nodosRepository.remove(nodo);

    return {
      message: `Nodo #${id} eliminado correctamente`,
    };
  }
}