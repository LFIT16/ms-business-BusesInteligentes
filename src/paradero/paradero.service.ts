import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paradero } from './entities/paradero.entity';
import { CreateParaderoDto } from './dto/create-paradero.dto';
import { UpdateParaderoDto } from './dto/update-paradero.dto';

@Injectable()
export class ParaderoService {
  constructor(
    @InjectRepository(Paradero)
    private readonly paraderoRepository: Repository<Paradero>,
  ) {}

  async create(createParaderoDto: CreateParaderoDto) {
    const paradero = this.paraderoRepository.create(createParaderoDto);
    return await this.paraderoRepository.save(paradero);
  }

  async findAll() {
    return await this.paraderoRepository.find({
      relations: ['nodos', 'nodos.ruta'],
    });
  }

  async findOne(id: number) {
    const paradero = await this.paraderoRepository.findOne({
      where: { id },
      relations: ['nodos', 'nodos.ruta'],
    });

    if (!paradero) throw new NotFoundException(`Paradero #${id} no encontrado`);
    return paradero;
  }

  async update(id: number, updateParaderoDto: UpdateParaderoDto) {
    const paradero = await this.findOne(id); // reutiliza validación

    const updated = Object.assign(paradero, updateParaderoDto);
    return await this.paraderoRepository.save(updated);
  }

  async remove(id: number) {
    const paradero = await this.findOne(id); // asegura que exista

    await this.paraderoRepository.remove(paradero);
    return { message: `Paradero #${id} eliminado correctamente` };
  }

  // HU-ENTR-2-002: Búsqueda de paraderos cercanos
  async buscarCercanos(lat: number, lng: number) {
    const LIMITE = 5;

    const cercanos = await this.paraderoRepository
      .createQueryBuilder('p')
      .select([
        'p.id            AS id',
        'p.nombre        AS nombre',
        'p.latitud       AS latitud',
        'p.longitud      AS longitud',
        'p.clasificacion AS clasificacion',
        `ROUND(
          6371000 * ACOS(
            COS(RADIANS(:lat)) * COS(RADIANS(p.latitud)) *
            COS(RADIANS(p.longitud) - RADIANS(:lng)) +
            SIN(RADIANS(:lat)) * SIN(RADIANS(p.latitud))
          )
        ) AS distancia_metros`,
      ])
      .setParameters({ lat, lng })
      .orderBy('distancia_metros', 'ASC')
      .limit(LIMITE)
      .getRawMany();

    const resultado = await Promise.all(
      cercanos.map(async (p) => {
        const conRutas = await this.paraderoRepository.findOne({
          where: { id: p.id },
          relations: ['nodos', 'nodos.ruta'],
        });

        if (!conRutas) throw new NotFoundException(`Paradero #${p.id} no encontrado`);

        // const rutas = conRutas.nodos
        //   ?.filter((nodo) => nodo.ruta)
        //   .map((nodo) => ({
        //     id: nodo.ruta.id,
        //     nombre: nodo.ruta.nombre,
        //     descripcion: nodo.ruta.descripcion,
        //     tarifa: nodo.ruta.tarifa,
        //     tiempoEstimadoTotal: nodo.ruta.tiempoEstimadoTotal,
        //   }))
        //   .filter((ruta, index, self) =>
        //     index === self.findIndex((r) => r.id === ruta.id)
        //   ) ?? [];

        return {
          id: p.id,
          nombre: p.nombre,
          latitud: Number(p.latitud),
          longitud: Number(p.longitud),
          clasificacion: p.clasificacion,
          distancia_metros: Number(p.distancia_metros),
         // rutas,
        };
      }),
    );

    return resultado;
  }
}