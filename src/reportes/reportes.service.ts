import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, Repository } from 'typeorm';

import { Boleto } from '../boletos/entities/boleto.entity';
import { Ruta } from '../rutas/entities/ruta.entity';

type FiltrosRangosEtarios = {
  rutaId?: number;
  fechaInicio?: string;
  fechaFin?: string;
};

type RangoEtarioKey =
  | 'menores'
  | 'jovenes'
  | 'adultos_jovenes'
  | 'adultos'
  | 'adultos_mayores'
  | 'sin_informacion';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Boleto)
    private readonly boletosRepository: Repository<Boleto>,

    @InjectRepository(Ruta)
    private readonly rutasRepository: Repository<Ruta>,

    private readonly dataSource: DataSource,
  ) {}

  async getDistribucionRangosEtarios(filtros: FiltrosRangosEtarios) {
    const boletosActuales = await this.obtenerBoletosFiltrados(filtros);

    const filtrosMesAnterior = this.obtenerFiltroMesAnterior(filtros);
    const boletosMesAnterior = await this.obtenerBoletosFiltrados(filtrosMesAnterior);

    const resumenActual = this.calcularResumen(boletosActuales);
    const resumenAnterior = this.calcularResumen(boletosMesAnterior);

    const total = resumenActual.reduce((acc, item) => acc + item.cantidad, 0);

    const data = resumenActual.map((item) => {
      const anterior = resumenAnterior.find(a => a.key === item.key);

      const porcentaje =
        total > 0
          ? Number(((item.cantidad / total) * 100).toFixed(2))
          : 0;

      const variacionMesAnterior = anterior
        ? item.cantidad - anterior.cantidad
        : item.cantidad;

      return {
        ...item,
        porcentaje,
        variacionMesAnterior,
      };
    });

    const predominante =
      [...data]
        .filter(item => item.key !== 'sin_informacion')
        .sort((a, b) => b.cantidad - a.cantidad)[0] || null;

    const rutas = await this.rutasRepository.find({
      order: {
        id: 'ASC',
      },
    });

    return {
      totalPasajeros: total,
      predominante,
      data,
      filtros,
      rutas,
    };
  }

  async getTendenciaIncidentes(
    meses: number = 3,
    empresaId?: number,
  ): Promise<any> {
    const cantidadMeses = Math.max(Number(meses || 3), 3);

    const hoy = new Date();
    const mesesLista: string[] = [];

    for (let i = cantidadMeses - 1; i >= 0; i--) {
      const fecha = new Date(
        hoy.getFullYear(),
        hoy.getMonth() - i,
        1,
      );

      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');

      mesesLista.push(`${year}-${month}`);
    }

    const fechaInicio = `${mesesLista[0]}-01 00:00:00`;

    const tiposBase = [
      'mecanico',
      'accidente',
      'retraso',
      'otro',
    ];

    let sql = `
      SELECT
        DATE_FORMAT(i.timestamp, '%Y-%m') AS mes,
        i.tipo AS tipo,
        COUNT(i.id) AS cantidad
      FROM incidentes i
      INNER JOIN incidentes_bus ib ON ib.incidente_id = i.id
      INNER JOIN buses b ON b.id = ib.bus_id
      WHERE i.timestamp >= ?
    `;

    const params: any[] = [fechaInicio];

    if (empresaId) {
      sql += ` AND b.empresa_id = ? `;
      params.push(empresaId);
    }

    sql += `
      GROUP BY
        DATE_FORMAT(i.timestamp, '%Y-%m'),
        i.tipo
      ORDER BY
        mes ASC,
        tipo ASC
    `;

    const rows = await this.dataSource.query(sql, params);

    const empresas = await this.dataSource.query(`
      SELECT
        id,
        nit,
        nombre,
        activo
      FROM empresas
      WHERE activo = 1
      ORDER BY nombre ASC
    `);

    const tiposEncontrados = rows.map((row: any) => row.tipo);

    const tipos = Array.from(
      new Set([
        ...tiposBase,
        ...tiposEncontrados,
      ]),
    );

    const datos: Record<string, Record<string, number>> = {};
    const totalesPorTipo: Record<string, number> = {};
    const totalesPorMes: Record<string, number> = {};

    for (const mes of mesesLista) {
      datos[mes] = {};
      totalesPorMes[mes] = 0;

      for (const tipo of tipos) {
        datos[mes][tipo] = 0;
        totalesPorTipo[tipo] = totalesPorTipo[tipo] || 0;
      }
    }

    for (const row of rows) {
      const mes = row.mes;
      const tipo = row.tipo;
      const cantidad = Number(row.cantidad || 0);

      if (!datos[mes]) {
        continue;
      }

      datos[mes][tipo] = cantidad;

      totalesPorTipo[tipo] =
        (totalesPorTipo[tipo] || 0) + cantidad;

      totalesPorMes[mes] =
        (totalesPorMes[mes] || 0) + cantidad;
    }

    const totalGeneral = Object.values(totalesPorTipo)
      .reduce((acc, value) => acc + Number(value || 0), 0);

    let tipoPredominante: any = null;

    for (const tipo of tipos) {
      const total = totalesPorTipo[tipo] || 0;

      if (!tipoPredominante || total > tipoPredominante.total) {
        tipoPredominante = {
          tipo,
          total,
          porcentaje:
            totalGeneral > 0
              ? Number(((total / totalGeneral) * 100).toFixed(2))
              : 0,
        };
      }
    }

    let mesMayor: any = null;

    for (const mes of mesesLista) {
      const total = totalesPorMes[mes] || 0;

      if (!mesMayor || total > mesMayor.total) {
        mesMayor = {
          mes,
          total,
        };
      }
    }

    return {
      meses: mesesLista,
      tipos,
      datos,
      totalesPorTipo,
      totalesPorMes,
      totalGeneral,
      tipoPredominante,
      mesMayor,
      empresas,
      empresaId: empresaId || null,
      mesesConsultados: cantidadMeses,
    };
  }

  private async obtenerBoletosFiltrados(
    filtros: FiltrosRangosEtarios,
  ): Promise<Boleto[]> {
    const where: any = {};

    if (filtros.fechaInicio && filtros.fechaFin) {
      const inicio = new Date(`${filtros.fechaInicio}T00:00:00`);
      const fin = new Date(`${filtros.fechaFin}T23:59:59`);

      where.creadoEn = Between(inicio, fin);
    }

    if (filtros.rutaId) {
      where.programacionRuta = {
        ruta: {
          id: filtros.rutaId,
        },
      };
    }

    return await this.boletosRepository.find({
      where,
      relations: [
        'ciudadano',
        'programacionRuta',
        'programacionRuta.ruta',
      ],
    });
  }

  private calcularResumen(boletos: Boleto[]) {
    const resumen: Record<RangoEtarioKey, any> = {
      menores: {
        key: 'menores',
        rango: 'Menores',
        descripcion: '0-17 años',
        cantidad: 0,
      },
      jovenes: {
        key: 'jovenes',
        rango: 'Jóvenes',
        descripcion: '18-25 años',
        cantidad: 0,
      },
      adultos_jovenes: {
        key: 'adultos_jovenes',
        rango: 'Adultos jóvenes',
        descripcion: '26-40 años',
        cantidad: 0,
      },
      adultos: {
        key: 'adultos',
        rango: 'Adultos',
        descripcion: '41-60 años',
        cantidad: 0,
      },
      adultos_mayores: {
        key: 'adultos_mayores',
        rango: 'Adultos mayores',
        descripcion: '61+ años',
        cantidad: 0,
      },
      sin_informacion: {
        key: 'sin_informacion',
        rango: 'Sin información',
        descripcion: 'Sin fecha de nacimiento',
        cantidad: 0,
      },
    };

    for (const boleto of boletos as any[]) {
      const fechaNacimiento = boleto.ciudadano?.fechaNacimiento;

      if (!fechaNacimiento) {
        resumen.sin_informacion.cantidad++;
        continue;
      }

      const edad = this.calcularEdad(new Date(fechaNacimiento));
      const rango = this.obtenerRangoEtario(edad);

      resumen[rango].cantidad++;
    }

    return Object.values(resumen);
  }

  private calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();

    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();

    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (
      mes < 0 ||
      (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())
    ) {
      edad--;
    }

    return edad;
  }

  private obtenerRangoEtario(edad: number): RangoEtarioKey {
    if (edad <= 17) return 'menores';
    if (edad <= 25) return 'jovenes';
    if (edad <= 40) return 'adultos_jovenes';
    if (edad <= 60) return 'adultos';

    return 'adultos_mayores';
  }

  private obtenerFiltroMesAnterior(
    filtros: FiltrosRangosEtarios,
  ): FiltrosRangosEtarios {
    if (!filtros.fechaInicio || !filtros.fechaFin) {
      const hoy = new Date();

      const inicioMesActual = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        1,
      );

      const inicioMesAnterior = new Date(
        inicioMesActual.getFullYear(),
        inicioMesActual.getMonth() - 1,
        1,
      );

      const finMesAnterior = new Date(
        inicioMesActual.getFullYear(),
        inicioMesActual.getMonth(),
        0,
      );

      return {
        rutaId: filtros.rutaId,
        fechaInicio: this.formatearFecha(inicioMesAnterior),
        fechaFin: this.formatearFecha(finMesAnterior),
      };
    }

    const inicio = new Date(`${filtros.fechaInicio}T00:00:00`);
    const fin = new Date(`${filtros.fechaFin}T23:59:59`);

    inicio.setMonth(inicio.getMonth() - 1);
    fin.setMonth(fin.getMonth() - 1);

    return {
      rutaId: filtros.rutaId,
      fechaInicio: this.formatearFecha(inicio),
      fechaFin: this.formatearFecha(fin),
    };
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().slice(0, 10);
  }
}