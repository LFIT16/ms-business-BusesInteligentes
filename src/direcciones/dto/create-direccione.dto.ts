import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDireccioneDto {
  @IsString()
  @IsNotEmpty({ message: 'El país es obligatorio' })
  pais?: string;

  @IsString()
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  ciudad?: string;

  @IsString()
  @IsNotEmpty({ message: 'El barrio es obligatorio' })
  barrio?: string;

  @IsString()
  @IsNotEmpty({ message: 'La calle es obligatoria' })
  calle?: string;

  @IsString()
  @IsNotEmpty({ message: 'El número de dirección es obligatorio' })
  numero?: string;

  @IsString()
  @IsOptional()
  referencia?: string;

  @IsString()
  @IsOptional()
  codigoPostal?: string;

  @IsNotEmpty({ message: 'El ciudadanoId es obligatorio' })
  ciudadanoId?: number;
}