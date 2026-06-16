import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Cita } from './entities/cita.entity';

@Injectable()
export class CitasService {
  private n8nWebhookDisponibilidad: string;
  private n8nWebhookAgendar: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Cita)
    private citaRepository: Repository<Cita>,
  ) {
    this.n8nWebhookDisponibilidad = this.configService.get<string>('N8N_WEBHOOK_DISPONIBILIDAD') ?? '';
    this.n8nWebhookAgendar = this.configService.get<string>('N8N_WEBHOOK_AGENDAR') ?? '';
  }

  async getDisponibilidad(body: any) {
    try {
      const response = await axios.post(this.n8nWebhookDisponibilidad, {
        tipoAtencion: body.tipoAtencion,
        dias: 10,
        duracionMinutos: 30
      });
      return response.data;
    } catch (error) {
      throw new HttpException('Error al obtener disponibilidad', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async agendarCita(body: any) {
  try {

    // 1. Validar si ya existe una cita
    // en la misma fecha y hora
    const citaExistente =
      await this.citaRepository.findOne({
        where: {
          fechaHora: new Date(body.fechaHora),
          estado: 'agendada'
        }
      });

    if (citaExistente) {

      throw new HttpException(
        'Ya existe una cita agendada en esta fecha y hora',
        HttpStatus.BAD_REQUEST
      );

    }

    // 2. Guardar en base de datos
    const nuevaCita =
      this.citaRepository.create({
        usuarioId: body.usuarioId,
        tipoAtencion: body.tipoAtencion,
        tipoConsulta: body.tipoConsulta,
        fechaHora: new Date(body.fechaHora),
        motivo: body.motivo,
        estado: 'agendada'
      });

    const citaGuardada =
      await this.citaRepository.save(
        nuevaCita
      );

    console.log('📝 Cita guardada en BD ID:',citaGuardada.id);

    // 3. Llamar a n8n para Google Calendar
    const payload = {
      tipoAtencion: body.tipoAtencion,
      tipoConsulta: body.tipoConsulta,
      fechaHora: body.fechaHora,
      motivo: body.motivo,
      nombreUsuario: body.nombreUsuario,
      emailUsuario: body.emailUsuario,
      citaId: citaGuardada.id
    };

    const response = await axios.post( this.n8nWebhookAgendar, payload);

    return {
      success: true,
      data: response.data,
      mensaje:
        'Cita agendada exitosamente. Revisa tu email.',
      citaId: citaGuardada.id
    };

  } catch (error) {

    if (error instanceof HttpException) {
      throw error;
    }

    if (error instanceof Error) {

      console.error(
        'Error en agendarCita:',
        error.message
      );

    } else {

      console.error(
        'Error en agendarCita:',
        error
      );

    }

    throw new HttpException(
      'Error al agendar cita',
      HttpStatus.INTERNAL_SERVER_ERROR
    );

  }
}

  // Obtener citas de un usuario
  async getMisCitas(usuarioId: string) {
    return this.citaRepository.find({
      where: { usuarioId },
      order: { fechaHora: 'DESC' }
    });
  }

   async cancelarCita(
    citaId: number
  ) {

    try {

      const cita =
        await this.citaRepository.findOne({
          where: {
            id: citaId
          }
        });

      if (!cita) {

        throw new Error(
          'Cita no encontrada'
        );

      }

      cita.estado =
        'cancelada';

      await this.citaRepository.save(
        cita
      );

      return {
        success: true,
        message:
          'Cita cancelada correctamente'
      };

    } catch (error) {

      console.error(error);

      throw new HttpException(
        'Error al cancelar cita',
        HttpStatus.INTERNAL_SERVER_ERROR
      );

    }

  }
}