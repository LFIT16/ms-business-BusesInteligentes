import { IsEnum, IsNotEmpty, IsNumber,} from 'class-validator';
import { TipoValidacion } from '../enums/tipo-validacion.enum';

export class CreateHistorialDto {
  @IsNumber()
  @IsNotEmpty()
  boletoId?: number;

  @IsNumber()
  @IsNotEmpty()
  nodoId?: number;

  @IsEnum(TipoValidacion)
  @IsNotEmpty()
  tipo?: TipoValidacion;
}