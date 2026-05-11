import { IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { EstadoBus } from '../../buses/enums/estado-bus.enum';

// Solo los estados válidos que puede reportar el conductor al iniciar
const EstadosBusInicio = [EstadoBus.OPERATIVO, EstadoBus.MANTENIMIENTO] as const;

export class IniciarTurnoDto {
  @IsEnum(EstadoBus)
  estadoBus?: EstadoBus;

  // Obligatorio solo si el bus no está 100% operativo
  @ValidateIf((o) => o.estadoBus !== EstadoBus.OPERATIVO)
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}