import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength,} from 'class-validator';
import { EstadoBus } from '../enums/estado-bus.enum';

export class CreateBusDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10)
  placa!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  modelo?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1990)
  @Max(2030)
  anio?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  capacidadMaximaPasajeros?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(200)
  capacidadSentados?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(200)
  capacidadParados?: number;

  @IsEnum(EstadoBus)
  estado?: EstadoBus;

  @IsOptional()
  @IsString()
  fotoUrl?: string;
}