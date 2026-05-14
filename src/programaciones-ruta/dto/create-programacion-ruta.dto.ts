import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Recurrencia } from '../enums/recurrencia.enum';

export class CreateProgramacionRutaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  rutaId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  busId!: number;

  /** Formato: YYYY-MM-DD */
  @IsDateString()
  @IsNotEmpty()
  fechaSalida!: string;

  /** Formato: HH:mm o HH:mm:ss */
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'horaSalida debe tener formato HH:mm o HH:mm:ss',
  })
  horaSalida!: string;

  @IsEnum(Recurrencia)
  @IsOptional()
  recurrencia?: Recurrencia;

  /** Tolerancia en minutos (1–60), por defecto 5 */
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(60)
  @IsOptional()
  toleranciaSalida?: number;
}