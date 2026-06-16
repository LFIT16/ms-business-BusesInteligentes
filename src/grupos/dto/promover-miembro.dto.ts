import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RolMembresia } from '../entities/membresia-grupo.entity';

export class PromoverMiembroDto {
  @IsString()
  @IsNotEmpty()
  usuarioId!: string;

  @IsEnum(RolMembresia)
  rol!: RolMembresia;

  @IsString()
  @IsNotEmpty()
  actorUsuarioId!: string;
}
