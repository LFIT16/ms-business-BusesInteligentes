import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength, ValidateNested,
} from 'class-validator';
import { CreateNodoDto } from 'src/nodos/dto/create-nodo.dto';

export class CreateRutaDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  nombre?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  descripcion?: string;

  @IsNumber()
  @Min(0)
  tarifa?: number;

  @IsInt()
  @Min(1)
  @Max(1440)
  tiempoEstimadoTotal?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNodoDto)
  nodos?: CreateNodoDto[];
}