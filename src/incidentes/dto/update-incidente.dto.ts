import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoIncidente } from '../enums/estado-incidente.enum';

export class UpdateIncidenteDto {
  @IsEnum(EstadoIncidente)
  @IsOptional()
  estado?: EstadoIncidente;

  @IsString()
  @IsOptional()
  comentario?: string;
}