import {IsNotEmpty,IsNumber,} from 'class-validator';

export class CreateIncidentesBusDto {
  @IsNumber()
  @IsNotEmpty()
  busId?: number;

  @IsNumber()
  @IsNotEmpty()
  incidenteId?: number;
}