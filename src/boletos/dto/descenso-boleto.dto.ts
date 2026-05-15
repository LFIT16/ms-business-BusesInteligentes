import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DescensoBoletoDto {
  @Type(() => Number) @IsInt() @Min(1) @IsNotEmpty()
  paraderoDescensoId!: number;
}