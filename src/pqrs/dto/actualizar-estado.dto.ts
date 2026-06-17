import { IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { EstadoPQRS } from '../enums/estado-pqrs.enum';

console.log('📋 Valores del enum EstadoPQRS:', Object.values(EstadoPQRS));

export class ActualizarEstadoDto {
  @IsEnum(EstadoPQRS, {
    message: `estado debe ser uno de: ${Object.values(EstadoPQRS).join(', ')}`,
  })
  estado?: EstadoPQRS;

  @ValidateIf((dto) => dto.estado === EstadoPQRS.RESUELTO)
  @IsString({ message: 'respuesta es obligatoria cuando el estado es Resuelto' })
  @MaxLength(1000)
  @IsOptional()
  respuesta?: string;
}