import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { UsuarioClient } from '../clients/usuario.client';
import { PQRS } from './entities/pqr.entity';
import { EstadoPQRS } from './enums/estado-pqrs.enum';
import { ActualizarEstadoDto } from './dto/actualizar-estado.dto';

@Injectable()
export class PQRSService {
  private n8nWebhook = process.env.N8N_WEBHOOK_PQRS;
  private n8nWebhookEstado = process.env.N8N_WEBHOOK_PQRS_ESTADO;

  constructor(
    @InjectRepository(PQRS)
    private pqrsRepository: Repository<PQRS>,
    private usuarioClient: UsuarioClient,
  ) {}

  async crearPQRS(body: any, token: string) {
  try {
    const radicado = await this.generarRadicado();
    const diasPrometidos = this.getDiasPrometidos(body.tipo);
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasPrometidos);

    // 👈 Obtener supervisor aleatorio
    const supervisor = await this.usuarioClient.getSupervisorAleatorio(token);

    const pqrs = this.pqrsRepository.create({
      ...body,
      radicado,
      estado: 'Enviado',
      diasPrometidos,
      fechaLimite,
      alertaEnviada: false,
      supervisorId: supervisor?.id || null,
      fotos: body.fotos, 
    });

    const saved = (await this.pqrsRepository.save(pqrs)) as any;

    const usuario = await this.usuarioClient.getUsuarioById(
      body.usuarioId,
      token,
    );

    const link = `${process.env.FRONTEND_URL}/pqrs/${radicado}`;
    
    const payload = {
      radicado,
      descripcion: body.descripcion,
      tipo: body.tipo,
      categoria: body.categoria,
      usuarioId: body.usuarioId,
      nombreUsuario: usuario?.nombre || 'Usuario',
      emailUsuario: usuario?.email || body.emailUsuario,
      linkSeguimiento: link,
      diasPrometidos: diasPrometidos,
      supervisorId: supervisor?.id || null,
      supervisorNombre: supervisor?.name || 'Sin supervisor asignado',
      supervisorEmail: supervisor?.email || null,
    };

      if (!this.n8nWebhook) {
        throw new HttpException(
          'N8N webhook no configurado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const response = await axios.post(this.n8nWebhook, payload);

      return {
        success: true,
        radicado,
        pqrsId: saved.id,
        n8n: response.data,
      };
    } catch (error) {
      console.error('Error creando PQRS:', error);
      throw new HttpException(
        'Error creando PQRS',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getDiasPrometidos(tipo: string): number {
    const diasMap: Record<string, number> = {
      'Peticion': 5,
      'Queja': 3,
      'Reclamo': 3,
      'Sugerencia': 7,
    };
    return diasMap[tipo] || 5;
  }

  async consultarPorRadicado(radicado: string) {
    return this.pqrsRepository.findOne({
      where: { radicado },
    });
  }

  async actualizarEstado(radicado: string, dto: ActualizarEstadoDto, token: string) {
    try {
      const pqrs = await this.pqrsRepository.findOne({ where: { radicado } });

      if (!pqrs) {
        throw new NotFoundException(`No existe un PQRS con radicado ${radicado}`);
      }

      pqrs.estado = dto.estado;

      if (dto.estado === EstadoPQRS.RESUELTO) {
        pqrs.respuesta = dto.respuesta;
      }

      const actualizado = await this.pqrsRepository.save(pqrs);

      const usuario = await this.usuarioClient.getUsuarioById(
        pqrs.usuarioId as string,
        token,
      );

      const link = `${process.env.FRONTEND_URL}/pqrs/${radicado}`;

      const payload = {
        radicado,
        estado: dto.estado,
        respuesta: dto.respuesta ?? null,
        tipo: pqrs.tipo,
        categoria: pqrs.categoria,
        descripcion: pqrs.descripcion,
        usuarioId: pqrs.usuarioId,
        nombreUsuario: usuario?.nombre || 'Usuario',
        emailUsuario: usuario?.email || '',
        linkSeguimiento: link,
      };

      if (!this.n8nWebhookEstado) {
        throw new HttpException(
          'N8N webhook de estado no configurado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const response = await axios.post(this.n8nWebhookEstado, payload);

      return {
        success: true,
        radicado,
        estado: actualizado.estado,
        n8n: response.data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error actualizando estado:', error);
      throw new HttpException(
        'Error actualizando estado del PQRS',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async generarRadicado() {
    const count = await this.pqrsRepository.count();
    const year = new Date().getFullYear();
    return `PQRS-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  // 👈 Verificar PQRS vencidos
  async verificarPQRSVencidos(token: string) {
    const ahora = new Date();

    const pqrsVencidos = await this.pqrsRepository
      .createQueryBuilder('pqrs')
      .where('pqrs.estado != :estado', { estado: 'Resuelto' })
      .andWhere('pqrs.estado != :cancelado', { cancelado: 'Cancelado' })
      .andWhere('pqrs.fechaLimite < :ahora', { ahora })
      .andWhere('pqrs.alertaEnviada = :alertaEnviada', { alertaEnviada: false })
      .getMany();

    for (const pqrs of pqrsVencidos) {
      await this.enviarAlertaSupervisor(pqrs, token);
      pqrs.alertaEnviada = true;
      await this.pqrsRepository.save(pqrs);
    }

    return {
      success: true,
      mensaje: `Se procesaron ${pqrsVencidos.length} alertas`,
      pqrsVencidos: pqrsVencidos.length,
    };
  }

  // 👈 Enviar alerta al supervisor (sin fallback)
  private async enviarAlertaSupervisor(pqrs: PQRS, token: string) {
    try {
      // Obtener supervisores reales desde ms-security
      const supervisores = await this.usuarioClient.getSupervisores(token);

      if (!supervisores || supervisores.length === 0) {
        console.log(`⚠️ No hay supervisores registrados. No se envió alerta para PQRS ${pqrs.radicado}`);
        return;
      }

      const url = `${this.n8nWebhookEstado}/alerta-supervisor`;

      const diasVencidos = Math.floor(
        (new Date().getTime() - new Date(pqrs.fechaLimite!).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      for (const supervisor of supervisores) {
        const payload = {
          radicado: pqrs.radicado,
          tipo: pqrs.tipo,
          categoria: pqrs.categoria,
          descripcion: pqrs.descripcion,
          fechaLimite: pqrs.fechaLimite,
          diasPrometidos: pqrs.diasPrometidos,
          diasVencidos: diasVencidos,
          estado: pqrs.estado,
          usuarioId: pqrs.usuarioId,
          to: supervisor.email,
          supervisorNombre: supervisor.name || 'Supervisor',
          linkSeguimiento: `${process.env.FRONTEND_URL}/pqrs/${pqrs.radicado}`,
        };

        await axios.post(url, payload);
        console.log(`📧 Alerta enviada al supervisor ${supervisor.email} para PQRS ${pqrs.radicado}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : JSON.stringify(error);
      console.error(`Error enviando alerta para ${pqrs.radicado}:`, msg);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handlePQRSVencidos() {
    // Token vacío porque es un proceso automático
    await this.verificarPQRSVencidos('');
  }

  async agregarFotos(radicado: string, fotosUrls: string[]) {
  const pqrs = await this.pqrsRepository.findOne({ where: { radicado } });
  
  if (!pqrs) {
    throw new NotFoundException(`PQRS ${radicado} no encontrado`);
  }
  
  const fotosActuales = pqrs.fotos || [];
  pqrs.fotos = [...fotosActuales, ...fotosUrls];
  
  await this.pqrsRepository.save(pqrs);
  
  return pqrs;
}
}