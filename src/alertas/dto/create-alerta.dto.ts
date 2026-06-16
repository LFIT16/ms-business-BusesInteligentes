import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AlcanceAlerta } from '../entities/alerta-masiva.entity';

export class CreateAlertaDto {
  @IsString()
  @IsNotEmpty()
  emisorUsuarioId!: string;

  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsString()
  @IsNotEmpty()
  mensaje!: string;

  @IsOptional()
  @IsBoolean()
  urgente?: boolean;

  @IsEnum(AlcanceAlerta)
  alcance!: AlcanceAlerta;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rutaId?: number;

  @IsOptional()
  @IsString()
  zona?: string;

  @IsOptional()
  fechaProgramada?: string;
}
