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
    const busExistente = await this.busesRepository.findOne({
      where: { placa: createBusDto.placa },
    });

    if (busExistente) {
      throw new BadRequestException(`Ya existe un bus con la placa ${createBusDto.placa}`);
    }

    const bus = this.busesRepository.create({
      ...createBusDto,
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
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Bus> {
    const bus = await this.busesRepository.findOne({
      where: { id },
    });

    if (!bus) {
      throw new NotFoundException(`Bus #${id} no encontrado`);
    }

    return bus;
  }

  async update(id: number, updateBusDto: UpdateBusDto): Promise<Bus> {
    const bus = await this.findOne(id);

    if (updateBusDto.placa && updateBusDto.placa !== bus.placa) {
      const busExistente = await this.busesRepository.findOne({
        where: { placa: updateBusDto.placa },
      });

      if (busExistente) {
        throw new BadRequestException(`Ya existe un bus con la placa ${updateBusDto.placa}`);
      }
    }

    Object.assign(bus, updateBusDto);

    await this.busesRepository.save(bus);

    return this.findOne(id);
  }

  async remove(id: number) {
    const bus = await this.findOne(id);

    await this.busesRepository.remove(bus);

    return { message: `Bus #${id} eliminado correctamente` };
  }
}