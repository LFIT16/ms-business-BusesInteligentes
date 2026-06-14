import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GpsService } from '../gps/gps.service';
import { MonitoreoService } from '../monitoreo/monitoreo.service';
import { BoletosService } from '../boletos/boletos.servicie';
import { IncidentesService } from '../incidentes/incidentes.service';
import { IncidentesBus } from '../incidentes-bus/entities/incidentes-bus.entity';
import { EstadoIncidente } from '../incidentes/enums/estado-incidente.enum';
import { EstadoBoleto } from '../boletos/enums/estado-boleto.enum';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(IncidentesBus)
    private readonly incidentesBusRepo: Repository<IncidentesBus>,
    
    private readonly gpsService: GpsService,
    private readonly monitoreoService: MonitoreoService,
    private readonly boletosService: BoletosService,
    private readonly incidentesService: IncidentesService,
  ) {}

  async getDashboardData() {
    try {
      // 1. Obtener ubicaciones enriquecidas
      const ubicaciones = await this.monitoreoService.findUbicacionesActivasConInfo();
      
      // 2. Calcular total de pasajeros en tránsito
      const totalPasajerosEnTransito = await this.calcularPasajerosEnTransito();
      
      // 3. Obtener incidentes activos
      const incidentesActivos = await this.getIncidentesActivos();
      
      // 4. Calcular buses con ocupación máxima
      const busesOcupacionMaxima = await this.getBusesOcupacionMaxima();
      
      // 5. Enriquecer ubicaciones con ocupación
      const ubicacionesConOcupacion = await this.enriquecerConOcupacion(ubicaciones);

      return {
        ubicaciones: ubicacionesConOcupacion,
        totalPasajerosEnTransito,
        incidentesActivos,
        busesOcupacionMaxima,
        totalBusesActivos: ubicaciones.length,
        ultimaActualizacion: new Date(),
      };
    } catch (error) {
      this.logger.error('Error obteniendo datos del dashboard', error);
      throw error;
    }
  }

  private async calcularPasajerosEnTransito(): Promise<number> {
    const todosLosBoletos = await this.boletosService.findAll();
    const boletosActivos = todosLosBoletos.filter(
      boleto => boleto.estado === EstadoBoleto.ACTIVO
    );
    
    this.logger.log(`Total pasajeros en tránsito: ${boletosActivos.length}`);
    return boletosActivos.length;
  }

  private async getOcupacionPorBus(): Promise<Record<number, { actual: number; capacidad: number; porcentaje: number }>> {
    const ocupacion: Record<number, { actual: number; capacidad: number; porcentaje: number }> = {};
    
    const todosLosBoletos = await this.boletosService.findAll();
    const boletosActivos = todosLosBoletos.filter(b => b.estado === EstadoBoleto.ACTIVO);
    
    for (const boleto of boletosActivos) {
      const programacion = boleto.programacionRuta;
      if (programacion?.bus?.id) {
        const busId = programacion.bus.id;
        const capacidad = programacion.bus.capacidadMaximaPasajeros || 60;
        
        if (!ocupacion[busId]) {
          ocupacion[busId] = { actual: 0, capacidad, porcentaje: 0 };
        }
        ocupacion[busId].actual++;
        ocupacion[busId].porcentaje = Math.round((ocupacion[busId].actual / capacidad) * 100);
      }
    }
    
    return ocupacion;
  }

  private async getBusesOcupacionMaxima(): Promise<any[]> {
    const ocupacionPorBus = await this.getOcupacionPorBus();
    
    const busesOcupados = Object.entries(ocupacionPorBus)
      .filter(([_, data]) => data.porcentaje >= 90)
      .map(([busId, data]) => ({
        busId: Number(busId),
        pasajerosActuales: data.actual,
        capacidadMaxima: data.capacidad,
        porcentajeOcupacion: data.porcentaje,
        nivel: data.porcentaje >= 100 ? 'LLENO' : data.porcentaje >= 95 ? 'CRÍTICO' : 'ALTO',
      }));
    
    return busesOcupados;
  }

  private async getIncidentesActivos(): Promise<any[]> {
    const busesActivos = await this.gpsService.findUbicacionesActivas();
    const incidentesActivos: any[] = [];
    
    for (const gps of busesActivos) {
      const incidentes = await this.incidentesService.findByBus(gps.busId);
      
      const noResueltos = incidentes.filter(
        inc => inc.estado !== EstadoIncidente.RESUELTO
      );
      
      for (const inc of noResueltos) {
        incidentesActivos.push({
          id: inc.incidenteBusId || inc.id,
          busId: gps.busId,
          placa: gps.bus?.placa || 'N/A',
          tipoIncidente: inc.tipo,
          descripcion: inc.descripcion,
          reportadoEn: inc.timestamp,
          gravedad: inc.gravedad,
          estado: inc.estado,
        });
      }
    }
    
    return incidentesActivos.sort((a, b) => 
      new Date(b.reportadoEn).getTime() - new Date(a.reportadoEn).getTime()
    );
  }

  private async enriquecerConOcupacion(ubicaciones: any[]): Promise<any[]> {
    const ocupacionPorBus = await this.getOcupacionPorBus();
    
    return ubicaciones.map(ubicacion => {
      const ocupacion = ocupacionPorBus[ubicacion.busId] || { actual: 0, capacidad: 60, porcentaje: 0 };
      
      return {
        ...ubicacion,
        ocupacion: {
          actual: ocupacion.actual,
          capacidad: ocupacion.capacidad,
          porcentaje: ocupacion.porcentaje,
        },
        estado: ubicacion.enIncidente ? 'INCIDENTE' : 
                 (ocupacion.porcentaje >= 90 ? 'OCUPADO' : 'NORMAL'),
      };
    });
  }

  async getDetalleBus(busId: number): Promise<any> {
    const ubicaciones = await this.monitoreoService.findUbicacionesActivasConInfo();
    const ubicacion = ubicaciones.find(u => u.busId === busId);
    
    if (!ubicacion) {
      throw new Error(`Bus ${busId} no encontrado`);
    }
    
    const ocupacionPorBus = await this.getOcupacionPorBus();
    const ocupacion = ocupacionPorBus[busId] || { actual: 0, capacidad: 60, porcentaje: 0 };
    
    const incidentes = await this.incidentesService.findByBus(busId);
    const incidenteActivo = incidentes.find(
      inc => inc.estado !== EstadoIncidente.RESUELTO
    );
    
    return {
      ...ubicacion,
      ocupacion: {
        actual: ocupacion.actual,
        capacidad: ocupacion.capacidad,
        porcentaje: ocupacion.porcentaje,
      },
      incidenteActivo: incidenteActivo || null,
      historialIncidentes: incidentes.slice(0, 5),
    };
  }
}