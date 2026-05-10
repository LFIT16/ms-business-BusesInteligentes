import { PartialType } from '@nestjs/mapped-types';
import { CreateRecargasDto } from './create-recargas.dto';

export class UpdateRecargasDto extends PartialType(CreateRecargasDto) {}
