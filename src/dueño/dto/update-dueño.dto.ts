import { PartialType } from '@nestjs/mapped-types';
import { CreateDueñoDto } from './create-dueño.dto';

export class UpdateDueñoDto extends PartialType(CreateDueñoDto) {}
