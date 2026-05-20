import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDueñoDto } from './dto/create-dueño.dto';
import { UpdateDueñoDto } from './dto/update-dueño.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dueño } from './entities/dueño.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DueñoService {

  constructor(
      @InjectRepository(Dueño)
      private readonly dueñoRepository: Repository<Dueño>,
    ) {}

  async create(createDueñoDto: CreateDueñoDto,authorization?: string,): Promise<Dueño> {
      const dueñoExistente = await this.dueñoRepository.findOne({
        where: {
          usuarioId: createDueñoDto.usuarioId,
        },
      });
  
      if (dueñoExistente) {
        throw new ConflictException(
          'Este usuario ya se encuentra registrado como dueño',
        );
      }
  
      const dueño= this.dueñoRepository.create(createDueñoDto);
  
      const dueñoGuardado = await this.dueñoRepository.save(dueño);
  
      if (!dueñoGuardado.id) {
        throw new InternalServerErrorException(
          'No se pudo obtener el ID del dueño guardado',
        );
      }
  
      return await this.findOne(dueñoGuardado.id);
    }

  async findOne(id: number): Promise<Dueño> {
      const dueño = await this.dueñoRepository.findOne({
        where: { id },
        relations: [
          'participacion',
        ],
      });
  
      if (!dueño) {
        throw new NotFoundException(`No se encontró el ciudadano con id ${id}`);
      }
  
      return dueño;
    }
  
    async findByUsuarioId(usuarioId: string): Promise<Dueño> {
      const dueño = await this.dueñoRepository.findOne({
        where: { usuarioId },
        relations: [
          'participacion',
        ],
      });
  
      if (!dueño) {
        throw new NotFoundException(
          `No se encontró un dueño asociado al usuario ${usuarioId}`,
        );
      }
  
      return dueño;
    }

  findAll() {
    return `This action returns all dueño`;
  }


  update(id: number, updateDueñoDto: UpdateDueñoDto) {
    return `This action updates a #${id} dueño`;
  }

  remove(id: number) {
    return `This action removes a #${id} dueño`;
  }
}
