import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, } from 'class-validator';

export class CreateMetodosPagoCiudadanoDto {
  @IsInt({ message: 'El ciudadanoId debe ser un número entero' })
  @IsNotEmpty({ message: 'El ciudadanoId es obligatorio' })
  ciudadanoId?: number;

  @IsInt({ message: 'El metodoPagoId debe ser un número entero' })
  @IsNotEmpty({ message: 'El metodoPagoId es obligatorio' })
  metodoPagoId?: number;

  @IsString()
  @IsNotEmpty({
    message: 'El número de identificación del instrumento de pago es obligatorio',
  })
  numeroIdentificacion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}