export class RespuestaClimaDto {
  ciudad?: string;
  temperatura?: number;
  condicion?: string;
  probabilidadLluvia?: number;
  humedad?: number;
  viento? : number;
  recomendacion?: string;
  mensaje?: string;
  requiereAlerta?: boolean;
}