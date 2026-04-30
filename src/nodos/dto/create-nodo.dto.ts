import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Ruta } from 'src/rutas/entities/ruta.entity';
//import { Paradero } from 'src/paraderos/entities/paradero.entity';

export class CreateNodoDto {
  @IsInt()
  @Min(1)
  orden?: number;

  @IsNotEmpty()
  ruta?: Ruta;

  //@IsNotEmpty()
  //paradero?: Paradero;
}