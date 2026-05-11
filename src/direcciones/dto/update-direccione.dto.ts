import { PartialType } from '@nestjs/mapped-types';
import { CreateDireccioneDto } from './create-direccione.dto';

export class UpdateDireccioneDto extends PartialType(CreateDireccioneDto) {}
