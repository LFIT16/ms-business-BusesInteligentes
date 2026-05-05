import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Ruta } from 'src/rutas/entities/ruta.entity';
import { Paradero } from 'src/paradero/entities/paradero.entity';

export class CreateNodoDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  orden?: number;

  @IsNotEmpty()
  ruta?: Ruta | { id: number };

  @IsNotEmpty()
  paradero?: Paradero | { id: number };
}