import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { DestinatarioPersona } from './entities/destinatario-persona.entity';
import { Mensaje } from './entities/mensaje.entity';

@Injectable()
export class MensajeService {
  constructor(
    @InjectRepository(Mensaje)
    private readonly mensajeRepo: Repository<Mensaje>,
    @InjectRepository(DestinatarioPersona)
    private readonly destPersonaRepo: Repository<DestinatarioPersona>,
  ) {}

  async crear(emisorUsuarioId: string, dto: CreateMensajeDto): Promise<Mensaje> {
    const mensaje = this.mensajeRepo.create({
      emisorId: emisorUsuarioId,
      contenido: dto.contenido,
      latitud: dto.latitud ?? null,
      longitud: dto.longitud ?? null,
      destinatariosPersona: [
        this.destPersonaRepo.create({
          usuarioId: dto.destinatarioUsuarioId,
          leido: false,
          fechaLeido: null,
        }),
      ],
    });
    return this.mensajeRepo.save(mensaje);
  }

  async getEnviados(emisorUsuarioId: string): Promise<Mensaje[]> {
    return this.mensajeRepo.find({
      where: { emisorId: emisorUsuarioId },
      relations: ['destinatariosPersona'],
      order: { fechaEnvio: 'DESC' },
    });
  }

  async getRecibidos(usuarioId: string): Promise<Mensaje[]> {
  return this.mensajeRepo
    .createQueryBuilder('m')
    .innerJoin('m.destinatariosPersona', 'dp')
    .where('dp.usuarioId = :usuarioId', { usuarioId })
    .leftJoinAndSelect('m.destinatariosPersona', 'todos')
    .orderBy('m.fechaEnvio', 'DESC')
    .getMany();
}

  async getNoLeidos(usuarioId: string): Promise<number> {
    return this.destPersonaRepo.count({
      where: { usuarioId, leido: false },
    });
  }

  async marcarLeido(mensajeId: number, usuarioId: string): Promise<DestinatarioPersona> {
    const dest = await this.destPersonaRepo.findOne({
      where: { mensajeId, usuarioId },
    });
    if (!dest) throw new NotFoundException('Destinatario no encontrado');
    dest.leido = true;
    dest.fechaLeido = new Date();
    return this.destPersonaRepo.save(dest);
  }

  async getDestinatariosUsuarioId(mensajeId: number): Promise<string[]> {
    const dests = await this.destPersonaRepo.find({ where: { mensajeId } });
    return dests.map((d) => d.usuarioId).filter((id): id is string => !!id);
  }
  
}