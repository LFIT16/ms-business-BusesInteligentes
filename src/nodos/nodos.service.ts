import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nodo } from './entities/nodo.entity';
import { CreateNodoDto } from './dto/create-nodo.dto';
import { UpdateNodoDto } from './dto/update-nodo.dto';
import { RutasService } from '../rutas/rutas.service';
//import { ParaderosService } from 'src/paraderos/paraderos.service';

@Injectable()
export class NodosService {
  constructor(
    @InjectRepository(Nodo)
    private readonly nodosRepository: Repository<Nodo>,

    private readonly rutasService: RutasService,

    //private readonly paraderosService: ParaderosService,
  ) {}

  private resolveId(value: any): number | undefined {
    if (!value) return undefined;
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && 'id' in value) return value.id;
    return undefined;
  }

  async create(createNodoDto: CreateNodoDto): Promise<Nodo> {
    const rutaId = this.resolveId(createNodoDto.ruta);
    //const paraderoId = this.resolveId(createNodoDto.paradero);

    if (!rutaId) {
      throw new BadRequestException('ruta id is required');
    }

    // if (!paraderoId) {
    //   throw new BadRequestException('paradero id is required');
    // }

    const ruta = await this.rutasService.findOne(rutaId);
    // const paradero = await this.paraderosService.findOne(paraderoId);

    const nodo = this.nodosRepository.create({
      orden: createNodoDto.orden,
      ruta,
      //paradero,
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

  async update(id: number, updateNodoDto: UpdateNodoDto): Promise<Nodo> {
    const nodo = await this.findOne(id);

    if (updateNodoDto.orden !== undefined) {
      nodo.orden = updateNodoDto.orden;
    }

    if (updateNodoDto.ruta) {
      const rutaId = this.resolveId(updateNodoDto.ruta);

      if (!rutaId) {
        throw new BadRequestException('ruta id is required');
      }

      const ruta = await this.rutasService.findOne(rutaId);
      nodo.ruta = ruta;
    }

    // if (updateNodoDto.paradero) {
    //   const paraderoId = this.resolveId(updateNodoDto.paradero);

    //   if (!paraderoId) {
    //     throw new BadRequestException('paradero id is required');
    //   }

    //   const paradero = await this.paraderosService.findOne(paraderoId);
    //   nodo.paradero = paradero;
    // }

    await this.nodosRepository.save(nodo);

    return this.findOne(id);
  }

  async remove(id: number) {
    const nodo = await this.findOne(id);

    await this.nodosRepository.remove(nodo);

    return { message: `Nodo #${id} eliminado correctamente` };
  }
}