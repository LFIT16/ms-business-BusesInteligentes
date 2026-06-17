import {
  IsOptional,
  IsBoolean,
  IsString,
  IsIn
} from 'class-validator';

export class ConfigurarClimaDto {

  @IsOptional()
  @IsBoolean()
  activado?: boolean;

  @IsOptional()
  @IsString()
  horarioViaje?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsIn(['email', 'whatsapp', 'push'])
  canalPreferido?: 'email' | 'whatsapp' | 'push';

  // 👈 guardar email
  @IsOptional()
  @IsString()
  email?: string;

  // 👈 guardar teléfono
  @IsOptional()
  @IsString()
  telefono?: string;
}