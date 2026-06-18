export class CreatePqrDto {
  tipo!: 'Peticion' | 'Queja' | 'Reclamo' | 'Sugerencia';
  categoria!: 'Conductor' | 'Bus' | 'Ruta' | 'Tarjeta' | 'Otro';
  descripcion!: string;
  usuarioId!: string;
  fotos?: string[]
}