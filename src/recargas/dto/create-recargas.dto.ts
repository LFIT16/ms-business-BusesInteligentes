import { IsInt, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class CreateRecargasDto {
  @IsInt({ message: 'El metodoPagoCiudadanoId debe ser un número entero' })
  @IsNotEmpty({ message: 'El metodoPagoCiudadanoId es obligatorio' })
  metodoPagoCiudadanoId?: number;

  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(5000, { message: 'El monto mínimo de recarga es $5.000' })
  @Max(500000, { message: 'El monto máximo de recarga es $500.000' })
  monto?: number;
}