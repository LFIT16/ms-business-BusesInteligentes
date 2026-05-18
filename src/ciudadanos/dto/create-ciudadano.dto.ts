import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCiudadanoDto {
  @IsString()
  @IsNotEmpty({ message: 'El usuarioId es obligatorio' })
  usuarioId?: string;
  
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;
}