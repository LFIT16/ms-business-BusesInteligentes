import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Bus } from './entities/bus.entity';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';

@Injectable()
export class BusesService {
  constructor(
    @InjectRepository(Bus)
    private readonly busesRepository: Repository<Bus>,
  ) {}

  private generarCodigoQr(placa: string): string {
    return `BUS-${placa}-${Date.now()}`;
  }

  async create(createBusDto: CreateBusDto): Promise<Bus> {
    this.validarCapacidadBus(
      createBusDto.capacidadMaximaPasajeros,
      createBusDto.capacidadSentados,
      createBusDto.capacidadParados,
    );
    const busExistente = await this.busesRepository.findOne({
      where: { placa: createBusDto.placa },
    });

    if (busExistente) {
      throw new BadRequestException(`Ya existe un bus con la placa ${createBusDto.placa}`);
    }

    const bus = this.busesRepository.create({
      ...createBusDto,
      empresaId: createBusDto.empresaId ?? null,
      codigoQr: this.generarCodigoQr(createBusDto.placa),
    });

    return await this.busesRepository.save(bus);
  }

  async findAll(placa?: string): Promise<Bus[]> {
    const where = placa
      ? { placa: Like(`%${placa}%`) }
      : {};

    return await this.busesRepository.find({
      where,
      relations: ['empresa'],
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Bus> {
    const bus = await this.busesRepository.findOne({
      where: { id },
      relations: ['empresa'],
    });

    if (!bus) {
      throw new NotFoundException(`Bus #${id} no encontrado`);
    }

    return bus;
  }

  async update(id: number, updateBusDto: UpdateBusDto) {
    const bus = await this.findOne(id);

    const capacidadMaximaPasajeros =
      updateBusDto.capacidadMaximaPasajeros ?? bus.capacidadMaximaPasajeros;

    const capacidadSentados =
      updateBusDto.capacidadSentados ?? bus.capacidadSentados;

    const capacidadParados =
      updateBusDto.capacidadParados ?? bus.capacidadParados;

    this.validarCapacidadBus(
      capacidadMaximaPasajeros,
      capacidadSentados,
      capacidadParados,
    );

    Object.assign(bus, {
      ...updateBusDto,
      empresaId:
        updateBusDto.empresaId !== undefined
          ? updateBusDto.empresaId
          : bus.empresaId,
    });

    return await this.busesRepository.save(bus);
  }

  async remove(id: number) {
    const bus = await this.findOne(id);

    await this.busesRepository.remove(bus);

    return { message: `Bus #${id} eliminado correctamente` };
  }

  private validarCapacidadBus( capacidadMaximaPasajeros?: number, capacidadSentados?: number, capacidadParados?: number,): void {
    const maxima = Number(capacidadMaximaPasajeros || 0);
    const sentados = Number(capacidadSentados || 0);
    const parados = Number(capacidadParados || 0);

    if (sentados + parados > maxima) {
      throw new BadRequestException(
        `La suma de pasajeros sentados y parados (${sentados + parados}) no puede superar la capacidad máxima (${maxima}).`,
      );
    }
  }
}