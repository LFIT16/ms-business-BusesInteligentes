import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GpsService } from '../gps/gps.service';
import { NodosService } from '../nodos/nodos.service';
import { ProgramacionesRutaService } from '../programaciones-ruta/programaciones-ruta.servicie';
import {
  construirPerfilRuta,
  encontrarPuntoMasCercano,
  PuntoRuta,
} from './geo.util';

const UMBRAL_VELOCIDAD_MINIMA = 5;

@Injectable()
export class MonitoreoService {
  constructor(
    private readonly gpsService: GpsService,
    private readonly nodosService: NodosService,
    private readonly programacionesRutaService: ProgramacionesRutaService,
  ) {}

  async findUbicacionesActivasConInfo() {
    const ubicaciones = await this.gpsService.findUbicacionesActivas();
    return Promise.all(ubicaciones.map((gps) => this.enriquecerUbicacion(gps)));
  }

  async findActivosPorRuta(rutaId: number) {
    const ubicaciones = await this.gpsService.findUbicacionesActivas();
    const enriquecidas = await Promise.all(
      ubicaciones.map((gps) => this.enriquecerUbicacion(gps)),
    );
    return enriquecidas.filter((item: any) => item.ruta?.id === rutaId);
  }

  private async enriquecerUbicacion(gps: any) {
    const enIncidente = await this.gpsService.tieneIncidenteActivo(gps.busId);

    const base = {
      busId: gps.busId,
      placa: gps.bus?.placa,
      latitud: gps.latitud,
      longitud: gps.longitud,
      velocidad: gps.velocidad,
      rumbo: gps.rumbo,
      ultimaActualizacion: gps.ultimaActualizacion,
      enIncidente,
    };
    
    const programacion = await this.programacionesRutaService.findEnCursoPorBus(gps.busId);

    if (!programacion || gps.latitud === null || gps.longitud === null) {
      return { ...base, enRuta: false };
    }

    const nodos = await this.nodosService.findByRuta(programacion.rutaId);
    const perfil = construirPerfilRuta(nodos, Number(programacion.ruta.tiempoEstimadoTotal));

    const masCercano = encontrarPuntoMasCercano(
      perfil,
      Number(gps.latitud),
      Number(gps.longitud),
    );

    // MODIFICADO: retraso basado en incidente activo O velocidad baja
    const retraso = this.calcularRetraso(Number(gps.velocidad), enIncidente);

    return {
      ...base,
      enRuta: true,
      ruta: {
        id: programacion.ruta.id,
        nombre: programacion.ruta.nombre,
      },
      paraderoMasCercano: masCercano
        ? {
            id: perfil[masCercano.index].nodo.paradero!.id,
            nombre: perfil[masCercano.index].nodo.paradero!.nombre,
            distanciaKm: Number(masCercano.distanciaKm.toFixed(3)),
          }
        : null,
      retrasado: retraso.retrasado,
      retrasoMinutos: retraso.retrasoMinutos,
    };
  }

  async calcularEta(busId: number, paraderoId: number) {
    const gps = await this.gpsService.findByBus(busId);

    if (gps.latitud === null || gps.longitud === null) {
      throw new BadRequestException(
        'El bus no tiene una ubicación registrada todavía.',
      );
    }

    const programacion =
      await this.programacionesRutaService.findEnCursoPorBus(busId);

    if (!programacion) {
      throw new BadRequestException(
        'El bus no tiene una ruta en curso en este momento.',
      );
    }

    const nodos = await this.nodosService.findByRuta(programacion.rutaId);

    const perfil = construirPerfilRuta(
      nodos,
      Number(programacion.ruta.tiempoEstimadoTotal),
    );

    // índice del destino (paradero objetivo)
    const indexDestino = perfil.findIndex(
      (p) => p.nodo.paradero?.id === paraderoId,
    );

    if (indexDestino === -1) {
      throw new NotFoundException(
        'El paradero indicado no pertenece a la ruta actual del bus.',
      );
    }

    const posicionBus = encontrarPuntoMasCercano(
      perfil,
      Number(gps.latitud),
      Number(gps.longitud),
    );

    if (!posicionBus) {
      throw new BadRequestException(
        'No se pudo determinar la posición del bus en la ruta.',
      );
    }

    // distancia total de la ruta
    const distanciaTotalKm = perfil[perfil.length - 1].distanciaDesdeInicioKm;

    const tiempoEstimadoTotalMin =
      Number(programacion.ruta.tiempoEstimadoTotal);

    const velocidadPromedioKmH =
      distanciaTotalKm > 0 && tiempoEstimadoTotalMin > 0
        ? distanciaTotalKm / (tiempoEstimadoTotalMin / 60)
        : 20;

    const velocidadActual = Number(gps.velocidad) || 0;

    const velocidadParaCalculo =
      velocidadActual > UMBRAL_VELOCIDAD_MINIMA
        ? velocidadActual
        : velocidadPromedioKmH;

    const posBusKm = posicionBus.distanciaDesdeInicioKm;
    const posDestinoKm = perfil[indexDestino].distanciaDesdeInicioKm;

    let distanciaRestanteKm: number;

    if (posBusKm <= posDestinoKm) {
      // aún no llega al destino en esta vuelta
      distanciaRestanteKm = posDestinoKm - posBusKm;
    } else {
      // ya pasó el destino → debe dar la vuelta
      distanciaRestanteKm = (distanciaTotalKm - posBusKm) + posDestinoKm;
    }

    // ETA
    const etaMinutos =
      (distanciaRestanteKm / velocidadParaCalculo) * 60;

    return {
      etaMinutos: Math.round(etaMinutos),
      distanciaRestanteKm: Number(distanciaRestanteKm.toFixed(3)),
      velocidadUsadaKmH: Number(velocidadParaCalculo.toFixed(2)),
    };
  }

  private calcularRetraso(
    velocidadActual: number,
    tieneIncidente: boolean,
  ): { retrasado: boolean; retrasoMinutos: number } {
    // Si tiene incidente activo, está retrasado (detenido)
    const retrasado = tieneIncidente || velocidadActual < UMBRAL_VELOCIDAD_MINIMA;
    
    const retrasoMinutos = tieneIncidente ? 15 : 0;
    
    return {
      retrasado,
      retrasoMinutos,
    };
  }
}