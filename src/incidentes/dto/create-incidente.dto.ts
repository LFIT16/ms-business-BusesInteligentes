import {
  IsEnum, IsInt, IsNotEmpty, IsOptional,
  IsString, IsArray, ValidateNested, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoIncidente }     from '../enums/tipo-incidente.enum';
import { GravedadIncidente } from '../enums/gravedad-incidente.enum';

export class CreateFotoIncidenteDto {
  @IsString()
  @IsNotEmpty()
  urlFoto!: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}

export class CreateIncidenteDto {
  @IsEnum(TipoIncidente)
  tipo!: TipoIncidente;

  @IsEnum(GravedadIncidente)
  gravedad!: GravedadIncidente;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  busId!: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  conductorId?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  turnoId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFotoIncidenteDto)
  @IsOptional()
  fotos?: CreateFotoIncidenteDto[];
}