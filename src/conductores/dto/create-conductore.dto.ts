import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString, // Importante: usaremos validación de cadena
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateConductoreDto {
  /** * ID del usuario con rol=conductor 
   * CAMBIO: Quitamos @Type(() => Number), @IsInt() y @Min(1)
   */
  @IsString()
  @IsNotEmpty()
  userId?: string; // Cambiado de number a string

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(20)
  licencia?: string;

  @IsDateString()
  @IsOptional()
  fechaVencimientoLicencia?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}