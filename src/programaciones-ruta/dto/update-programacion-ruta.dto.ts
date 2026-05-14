import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramacionRutaDto } from './create-programacion-ruta.dto';

export class UpdateProgramacionRutaDto extends PartialType(CreateProgramacionRutaDto) {}