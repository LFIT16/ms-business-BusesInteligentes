import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBoletoDto {
  @Type(() => Number) @IsInt() @Min(1) @IsNotEmpty()
  ciudadanoId!: number;

  @Type(() => Number) @IsInt() @Min(1) @IsNotEmpty()
  programacionRutaId!: number;

  @Type(() => Number) @IsInt() @Min(1) @IsNotEmpty()
  metodoPagoCiudadanoId!: number;

  @Type(() => Number) @IsInt() @Min(1) @IsNotEmpty()
  paraderoAbordajeId!: number;
}