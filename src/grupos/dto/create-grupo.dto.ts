import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGrupoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del grupo es obligatorio' })
  @MinLength(3)
  @MaxLength(100)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  esPublico?: boolean;

  @IsString()
  @IsNotEmpty({ message: 'El creadorUsuarioId es obligatorio' })
  creadorUsuarioId!: string;

  @IsOptional()
  @IsString()
  fotoUrl?: string;

  // HU-ENTR-3-006: miembros iniciales a agregar al crear
  @IsOptional()
  @IsArray()
  miembrosIniciales?: string[]; // array de usuarioIds
}
