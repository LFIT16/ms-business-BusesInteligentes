import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMensajeDto {
  @Type(() => Number)
  @IsNumber()
  grupoId!: number;

  @IsString()
  @IsNotEmpty()
  usuarioId!: string;

  @IsString()
  @IsNotEmpty()
  nombreUsuario!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  contenido!: string;
}
