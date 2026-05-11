import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'horaFinPosterior', async: false })
class HoraFinPosteriorAInicio implements ValidatorConstraintInterface {
  validate(horaFin: string, args: ValidationArguments) {
    const obj = args.object as any;
    if (!obj.horaInicio || !horaFin) return true;
    return new Date(horaFin) > new Date(obj.horaInicio);
  }
  defaultMessage() {
    return 'horaFin debe ser posterior a horaInicio';
  }
}

export class CreateTurnoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  conductorId!: number; 

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  busId!: number;       

  @IsDateString()
  @IsNotEmpty()
  horaInicio!: string;  

  @IsDateString()
  @IsNotEmpty()
  @Validate(HoraFinPosteriorAInicio)
  horaFin!: string;      
}