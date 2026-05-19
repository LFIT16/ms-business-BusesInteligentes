import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateGpsDto {
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @IsNumber()
  busId!: number;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud?: number;

  @IsOptional()
  @IsNumber()
  velocidad?: number;

  @IsOptional()
  @IsNumber()
  rumbo?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}