import { IsNotEmpty, IsNumber, IsOptional, IsString,} from 'class-validator';

export class CreateFotoDto {
  @IsNumber()
  @IsNotEmpty()
  incidenteBusId?: number;

  @IsString()
  @IsNotEmpty()
  urlFoto?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}