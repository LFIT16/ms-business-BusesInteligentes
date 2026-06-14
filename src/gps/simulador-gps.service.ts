// En simulador-gps.service.ts

import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { GpsService } from './gps.service';
import { ProgramacionesRutaService } from '../programaciones-ruta/programaciones-ruta.servicie';
import { NodosService } from '../nodos/nodos.service';

@Injectable()
export class SimuladorGpsService implements OnModuleInit {

  private readonly logger = new Logger(SimuladorGpsService.name);
  private posiciones: Record<number, number> = {};
  private progreso: Record<number, number> = {};
  private ultimaPosicionIncidente: Record<number, { latitud: number; longitud: number }> = {};

  private readonly PASOS_POR_TRAMO = 3;

  constructor(
    private readonly gpsService: GpsService,
    private readonly programacionesRutaService: ProgramacionesRutaService,
    private readonly nodosService: NodosService,
  ) {}

  async onModuleInit() {
    const ubicaciones = await this.gpsService.findUbicacionesActivas();
    const ahora = new Date();

    for (const gps of ubicaciones) {
      const programacion = await this.programacionesRutaService.findEnCursoPorBus(gps.busId);

      if (!programacion) {
        this.posiciones[gps.busId] = 0;
        this.progreso[gps.busId] = 0;
        continue;
      }

      const nodos = await this.nodosService.findByRuta(programacion.rutaId);
      const paraderos = nodos
        .sort((a: any, b: any) => Number(a.orden) - Number(b.orden))
        .filter((n: any) => n?.paradero?.latitud != null);

      if (paraderos.length === 0) {
        this.posiciones[gps.busId] = 0;
        this.progreso[gps.busId] = 0;
        continue;
      }

      const horaSalida = programacion.horaSalida.length === 5
        ? programacion.horaSalida + ':00'
        : programacion.horaSalida;

      const salida = new Date(`${programacion.fechaSalida}T${horaSalida}`);
      const minutosTranscurridos = Math.max(0, (ahora.getTime() - salida.getTime()) / 60000);

      const totalPasos = (paraderos.length - 1) * this.PASOS_POR_TRAMO;
      const tiempoTotalMin = Number(programacion.ruta.tiempoEstimadoTotal) || 60;

      const progresoTotal = Math.floor((minutosTranscurridos / tiempoTotalMin) * totalPasos) % totalPasos;

      this.posiciones[gps.busId] = Math.floor(progresoTotal / this.PASOS_POR_TRAMO);
      this.progreso[gps.busId] = progresoTotal % this.PASOS_POR_TRAMO;

      this.logger.log(
        `Bus ${gps.busId} rehidratado — salida: ${horaSalida}, ` +
        `${Math.round(minutosTranscurridos)}min transcurridos → ` +
        `paradero ${this.posiciones[gps.busId]}, paso ${this.progreso[gps.busId]}`
      );
    }
  }

  @Cron('*/10 * * * * *')
  async moverBuses() {

    const ubicaciones = await this.gpsService.findUbicacionesActivas();

    for (const gps of ubicaciones) {

      try {
        // VERIFICAR SI EL BUS TIENE UN INCIDENTE ACTIVO
        const tieneIncidente = await this.gpsService.tieneIncidenteActivo(gps.busId);
        
        if (tieneIncidente) {
          // Si tiene incidente, mantener la última posición registrada
          if (this.ultimaPosicionIncidente[gps.busId]) {
            await this.gpsService.actualizarUbicacion(
              gps.busId,
              this.ultimaPosicionIncidente[gps.busId].latitud,
              this.ultimaPosicionIncidente[gps.busId].longitud,
              0, // Velocidad 0 cuando está detenido
              0
            );
          }
          this.logger.log(`Bus ${gps.busId} detenido por incidente activo`);
          continue; 
        } else {
          // Limpiar posición guardada si ya no hay incidente
          delete this.ultimaPosicionIncidente[gps.busId];
        }

        if (this.posiciones[gps.busId] == null) {
          this.posiciones[gps.busId] = 0;
        }

        if (this.progreso[gps.busId] == null) {
          this.progreso[gps.busId] = 0;
        }

        const programacion = await this.programacionesRutaService.findEnCursoPorBus(gps.busId);

        if (!programacion) {
          continue;
        }

        const nodos = await this.nodosService.findByRuta(programacion.rutaId);

        const nodosOrdenados = nodos.sort(
          (a: any, b: any) =>
            Number(a.orden) - Number(b.orden)
        );

        const paraderos = nodosOrdenados.filter(
          (nodo: any) =>
            nodo?.paradero &&
            nodo.paradero.latitud !== null &&
            nodo.paradero.longitud !== null
        );

        if (paraderos.length === 0) {
          continue;
        }

        let index = this.posiciones[gps.busId];

        if (index >= paraderos.length) {
          index = 0;
        }

        const siguienteIndex = (index + 1) % paraderos.length;

        const origen = paraderos[index]?.paradero;
        const destino = paraderos[siguienteIndex]?.paradero;

        if (!origen || !destino) {
          continue;
        }

        const paso = this.progreso[gps.busId];
        const t = paso / this.PASOS_POR_TRAMO;

        const latitud = Number(origen.latitud) +
          (Number(destino.latitud) - Number(origen.latitud)) * t;

        const longitud = Number(origen.longitud) +
          (Number(destino.longitud) - Number(origen.longitud)) * t;

        await this.gpsService.actualizarUbicacion(
          gps.busId,
          latitud,
          longitud,
          35,
          0
        );

        this.logger.log(
          `Bus ${gps.busId} moviéndose entre ${origen.nombre} → ${destino.nombre} (paso ${paso})`
        );

        this.progreso[gps.busId]++;

        if (this.progreso[gps.busId] > this.PASOS_POR_TRAMO) {
          this.progreso[gps.busId] = 0;
          this.posiciones[gps.busId] = index + 1;
        }

      } catch (error) {
        this.logger.error(`Error moviendo bus ${gps.busId}`, error);
      }
    }
  }
}