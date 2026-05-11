import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TipoMetodoPago } from '../enums/tipo-metodo-pago.enum';

export class CreateMetodosPagoDto {
  @IsEnum(TipoMetodoPago, {
    message: 'El tipo de método de pago no es válido',
  })
  @IsNotEmpty({ message: 'El tipo de método de pago es obligatorio' })
  tipo?: TipoMetodoPago;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del método de pago es obligatorio' })
  nombre?: string;
}