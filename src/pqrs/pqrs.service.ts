import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';

import { UsuarioClient } from '../clients/usuario.client';
import { PQRS } from './entities/pqr.entity';

@Injectable()
export class PQRSService {
  private n8nWebhook = process.env.N8N_WEBHOOK_PQRS;

  constructor(
    @InjectRepository(PQRS)
    private pqrsRepository: Repository<PQRS>,
    private usuarioClient: UsuarioClient,
  ) {}

  async crearPQRS(body: any) {
    try {
      const radicado = await this.generarRadicado();
      const pqrs = this.pqrsRepository.create({
        ...body,
        radicado,
        estado: 'enviado',
      });

      const saved = (await this.pqrsRepository.save(pqrs)) as any;
      const usuario = await this.usuarioClient.getUsuarioById(body.usuarioId,);
      const link = `${process.env.FRONTEND_URL}/pqrs/${radicado}`;
      const payload = {
        radicado,
        descripcion: body.descripcion,
        tipo: body.tipo,
        categoria: body.categoria,

        usuarioId: body.usuarioId,
        nombreUsuario: usuario.nombre,
        emailUsuario: usuario.email,

        linkSeguimiento: link,
      };

      if (!this.n8nWebhook) {
        throw new HttpException(
          'N8N webhook no configurado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const response = await axios.post(
        this.n8nWebhook,
        payload,
      );

      return {
        success: true,
        radicado,
        pqrsId: saved.id,
        n8n: response.data,
      };

    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error creando PQRS',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async consultarPorRadicado(radicado: string) {
    return this.pqrsRepository.findOne({
      where: { radicado },
    });
  }

  private async generarRadicado() {
    const count = await this.pqrsRepository.count();
    const year = new Date().getFullYear();

    return `PQRS-${year}-${(count + 1)
      .toString()
      .padStart(6, '0')}`;
  }
}