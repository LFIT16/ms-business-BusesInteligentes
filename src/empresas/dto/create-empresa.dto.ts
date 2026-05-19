import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nit!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  telefono?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(150)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  direccion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}