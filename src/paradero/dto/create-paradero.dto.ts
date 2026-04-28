import { IsString, IsNumber, IsEnum, IsOptional, MinLength, MaxLength, Min, Max } from 'class-validator';
import { ClasificacionParadero } from '../entities/paradero.entity';

export class CreateParaderoDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud?: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud?: number;

  @IsOptional()
  @IsEnum(ClasificacionParadero)
  clasificacion?: ClasificacionParadero;
}