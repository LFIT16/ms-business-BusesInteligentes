import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conductore } from './entities/conductore.entity';
import { CreateConductoreDto } from './dto/create-conductore.dto';
import { UpdateConductoreDto } from './dto/update-conductore.dto';

@Injectable()
export class ConductoresService {
  constructor(
    @InjectRepository(Conductore)
    private readonly conductoresRepository: Repository<Conductore>,
  ) {}

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async findOrFail(id: number): Promise<Conductore> {
    const conductor = await this.conductoresRepository.findOne({
      where: { id },
      relations: ['empresa'],
    });

    if (!conductor) {
      throw new NotFoundException(`Conductor #${id} no encontrado`);
    }

    return conductor;
  }

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  async create(dto: CreateConductoreDto): Promise<Conductore> {
    const yaExisteUser = await this.conductoresRepository.findOne({
      where: { userId: dto.userId },
    });
    if (yaExisteUser) {
      throw new ConflictException(
        `Ya existe un perfil de conductor para el usuario #${dto.userId}`,
      );
    }

    const yaExisteLicencia = await this.conductoresRepository.findOne({
      where: { licencia: dto.licencia },
    });
    if (yaExisteLicencia) {
      throw new ConflictException(
        `Ya existe un conductor con la licencia ${dto.licencia}`,
      );
    }

    const conductor = this.conductoresRepository.create({
      ...dto,
      empresaId: dto.empresaId ?? null,
      fechaVencimientoLicencia: dto.fechaVencimientoLicencia
        ? new Date(dto.fechaVencimientoLicencia)
        : null,
      activo: dto.activo ?? true,
    });

    return this.conductoresRepository.save(conductor);
  }

  async findAll(): Promise<Conductore[]> {
    return this.conductoresRepository.find({
      relations: ['empresa'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Conductore> {
    return this.findOrFail(id);
  }

  async update(id: number, dto: UpdateConductoreDto): Promise<Conductore> {
    const conductor = await this.findOrFail(id);

    if (dto.licencia && dto.licencia !== conductor.licencia) {
      const yaExiste = await this.conductoresRepository.findOne({
        where: { licencia: dto.licencia },
      });
      if (yaExiste) {
        throw new ConflictException(
          `Ya existe un conductor con la licencia ${dto.licencia}`,
        );
      }
    }

    Object.assign(conductor, {
      ...dto,
      empresaId:
        dto.empresaId !== undefined
          ? dto.empresaId
          : conductor.empresaId,
      fechaVencimientoLicencia: dto.fechaVencimientoLicencia
        ? new Date(dto.fechaVencimientoLicencia)
        : conductor.fechaVencimientoLicencia,
    });

    return this.conductoresRepository.save(conductor);
  }

  async remove(id: number): Promise<{ message: string }> {
    const conductor = await this.findOrFail(id);
    await this.conductoresRepository.remove(conductor);
    return { message: `Conductor #${id} eliminado correctamente` };
  }
  async findByUsuarioId(userId: string): Promise<Conductore | null> {
    return this.conductoresRepository.findOne({
      where: { userId },
      relations: ['empresa'],
    });
  }
}