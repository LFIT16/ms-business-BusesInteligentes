import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateParticipacionDto } from './dto/create-participacion.dto';
import { UpdateParticipacionDto } from './dto/update-participacion.dto';
import { Participacion } from './entities/participacion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpresasService } from 'src/empresas/empresas.service';
import { DueñoService } from 'src/dueño/dueño.service';
import { Dueño } from 'src/dueño/entities/dueño.entity';


@Injectable()
export class ParticipacionService {

  constructor(
      @InjectRepository(Participacion)
      private readonly participacionRepository: Repository<Participacion>,

      private readonly dueñoRepository: Repository<Dueño>,
  
      private readonly empresasService: EmpresasService,
  
      private readonly dueñosService: DueñoService,

    ) {}

  private resolveId(value: any): number | undefined {
    if (!value) return undefined;
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && 'id' in value) return value.id;
    return undefined;
  }

  async create(createParticipacionDto: CreateParticipacionDto): Promise<Participacion[]> {
      const empresaId = this.resolveId(createParticipacionDto.empresa);
      const dueñoId = this.resolveId(createParticipacionDto.dueño);
  
      if (!empresaId) {
        throw new BadRequestException('empresa id is required');
      }
  
      if (!dueñoId) {
        throw new BadRequestException('dueño id is required');
      }

      if (createParticipacionDto.porcentajeParticipacion === undefined || createParticipacionDto.porcentajeParticipacion === null) {
      throw new BadRequestException('pocentajeParticipacion is required');
      }

      for (const dueño of dueñoId[length]) {
        await this.participacionRepository.findOne({
          where: {
            porcentajeParticipacion: dueño
          },
          relations: ['empresa', 'dueño'],
        })
        if (createParticipacionDto.porcentajeParticipacion <= 100){
        throw new BadRequestException('pocentajeParticipacion is invalid');
        }

      }
   
      const empresa = await this.empresasService.findOne(empresaId);
      const dueño = await this.dueñosService.findOne(dueñoId);
      
      const participacion = this.participacionRepository.create({
        porcentajeParticipacion: Number(createParticipacionDto.porcentajeParticipacion),
        empresa,
        dueño
      });
  
      return await this.participacionRepository.save(participacion);
    }

  async findAll(): Promise<Participacion[]> {
      return await this.participacionRepository.find({
        relations: ['empresa', 'dueño'],
      });
    }
  
    async findOne(id: number): Promise<Participacion> {
      const participacion = await this.participacionRepository.findOne({
        where: { id },
        relations: ['empresa', 'dueño'],
      });
  
      if (!participacion) {
        throw new NotFoundException(`participacion #${id} no encontrado`);
      }
  
      return participacion;
    }
  
    async findByempresa(empresaId: number): Promise<Participacion[]> {
      await this.empresasService.findOne(empresaId);
  
      return await this.participacionRepository.find({
        where: {
          empresa: {
            id: empresaId,
          },
        },
        relations: ['empresa', 'dueño'],
      });
    }
  
    async findBydueño(dueñoId: number): Promise<Participacion[]> {
      await this.dueñosService.findOne(dueñoId);
  
      return await this.participacionRepository.find({
        where: {
          dueño: {
            id: dueñoId,
          },
        },
        relations: ['empresa', 'dueño'],
      });
    }
  
    async NotificacionParticipacion(porcentajesParticipacion: number): Promise<Participacion[]> {

      return await this.participacionRepository.find({
        where: {
          porcentajeParticipacion: porcentajesParticipacion,
        }
      });

      // const email = await this.dueñoRepository.findOne({
      //   where : {
      //     usuarioId: CreateDueñoDto.usuarioId.email        
      //   }
      // })

      if (porcentajesParticipacion >= 60) {
        console.log("Tiene más del 60 porciento de participacion felicitaciones")
      }
    }
}
