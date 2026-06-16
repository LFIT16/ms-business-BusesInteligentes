export class CreatePqrDto {
  tipo!: 'Petición' | 'Queja' | 'Reclamo' | 'Sugerencia';
  categoria!: 'Conductor' | 'Bus' | 'Ruta' | 'Tarjeta' | 'Otro';
  descripcion!: string;
  usuarioId!: string;
}