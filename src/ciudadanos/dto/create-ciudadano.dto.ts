import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCiudadanoDto {
  @IsString()
  @IsNotEmpty({ message: 'El usuarioId es obligatorio' })
  usuarioId?: string;
}