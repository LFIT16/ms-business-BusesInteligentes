import { IsNotEmpty, IsString } from 'class-validator';

export class RemoverMiembroDto {
  @IsString()
  @IsNotEmpty()
  usuarioId!: string;

  @IsString()
  @IsNotEmpty()
  actorUsuarioId!: string;
}
