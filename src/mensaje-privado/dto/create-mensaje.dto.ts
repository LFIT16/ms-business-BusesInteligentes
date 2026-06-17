import {
  IsString, MaxLength, IsOptional, IsNumber,
} from 'class-validator';

export class CreateMensajeDto {
  @IsString()
  destinatarioUsuarioId?: string;

  @IsString()
  @MaxLength(500)
  contenido?: string;

  @IsOptional()
  @IsNumber()
  latitud?: number;

  @IsOptional()
  @IsNumber()
  longitud?: number;
}