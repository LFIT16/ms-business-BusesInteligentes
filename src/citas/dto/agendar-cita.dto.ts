export class AgendarCitaDto {
  tipoAtencion!: 'Presencial' | 'Virtual';
  tipoConsulta?: 'Problema con tarjeta' | 'Reclamo' | 'Reembolso' | 'Otro';
  fechaHora?: string;
  motivo?: string;
}
