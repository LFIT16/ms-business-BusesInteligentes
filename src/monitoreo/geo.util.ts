import { Nodo } from '../nodos/entities/nodo.entity';

export function calcularDistanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export interface PuntoRuta {
  nodo: Nodo;
  distanciaDesdeInicioKm: number;
  tiempoEstimadoDesdeInicioMin: number;
}

export interface PosicionEnRuta {
  /** Índice del nodo de referencia más cercano (para "paradero más cercano") */
  index: number;
  /** Distancia perpendicular del bus a la ruta (qué tan lejos está de la línea) */
  distanciaKm: number;
  /** Posición interpolada del bus a lo largo de toda la ruta, en km acumulados */
  distanciaDesdeInicioKm: number;
}

export function construirPerfilRuta(
  nodos: Nodo[],
  tiempoEstimadoTotalMin: number,
): PuntoRuta[] {
  const ordenados = [...nodos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  const perfil: PuntoRuta[] = [];
  let acumuladoKm = 0;

  for (let i = 0; i < ordenados.length; i++) {
    if (i > 0) {
      const anterior = ordenados[i - 1].paradero!;
      const actual = ordenados[i].paradero!;
      acumuladoKm += calcularDistanciaKm(
        Number(anterior.latitud),
        Number(anterior.longitud),
        Number(actual.latitud),
        Number(actual.longitud),
      );
    }

    perfil.push({
      nodo: ordenados[i],
      distanciaDesdeInicioKm: acumuladoKm,
      tiempoEstimadoDesdeInicioMin: 0,
    });
  }

  const distanciaTotalKm = perfil[perfil.length - 1]?.distanciaDesdeInicioKm || 0;

  for (const punto of perfil) {
    punto.tiempoEstimadoDesdeInicioMin =
      distanciaTotalKm > 0
        ? (punto.distanciaDesdeInicioKm / distanciaTotalKm) * tiempoEstimadoTotalMin
        : 0;
  }

  return perfil;
}

/**
 * Encuentra la posición del bus proyectándolo sobre cada segmento
 * de la ruta (no solo sobre los nodos/paraderos), y devuelve su
 * posición interpolada en km a lo largo de toda la ruta.
 *
 * Esto evita que el bus quede "anclado" al índice de un paradero
 * cuando en realidad está avanzando entre dos paraderos.
 */
export function encontrarPuntoMasCercano(
  perfil: PuntoRuta[],
  lat: number,
  lng: number,
): PosicionEnRuta | null {
  if (perfil.length === 0) return null;

  if (perfil.length === 1) {
    const p = perfil[0].nodo.paradero!;
    return {
      index: 0,
      distanciaKm: calcularDistanciaKm(lat, lng, Number(p.latitud), Number(p.longitud)),
      distanciaDesdeInicioKm: 0,
    };
  }

  let mejor: PosicionEnRuta | null = null;

  for (let i = 0; i < perfil.length - 1; i++) {
    const a = perfil[i].nodo.paradero!;
    const b = perfil[i + 1].nodo.paradero!;

    const lat1 = Number(a.latitud);
    const lon1 = Number(a.longitud);
    const lat2 = Number(b.latitud);
    const lon2 = Number(b.longitud);

    // Proyección del punto (lat, lng) sobre el segmento a-b,
    // tratando lat/lng como coordenadas planas (aproximación válida
    // para distancias cortas como tramos de ruta urbana).
    const ax = lon1;
    const ay = lat1;
    const bx = lon2;
    const by = lat2;
    const px = lng;
    const py = lat;

    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;

    let t = lenSq > 0 ? ((px - ax) * dx + (py - ay) * dy) / lenSq : 0;
    t = Math.max(0, Math.min(1, t)); // clamp al segmento [a, b]

    const projLon = ax + t * dx;
    const projLat = ay + t * dy;

    const distanciaKm = calcularDistanciaKm(lat, lng, projLat, projLon);

    const segmentoKm =
      perfil[i + 1].distanciaDesdeInicioKm - perfil[i].distanciaDesdeInicioKm;
    const distanciaDesdeInicioKm =
      perfil[i].distanciaDesdeInicioKm + t * segmentoKm;

    if (!mejor || distanciaKm < mejor.distanciaKm) {
      mejor = {
        index: t < 1 ? i : i + 1,
        distanciaKm,
        distanciaDesdeInicioKm,
      };
    }
  }

  return mejor;
}