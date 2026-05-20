import { IsNotEmpty, IsString } from "class-validator";

export class CreateDueñoDto {
    @IsString()
      @IsNotEmpty({ message: 'El usuarioId es obligatorio' })
      usuarioId?: string;
}
