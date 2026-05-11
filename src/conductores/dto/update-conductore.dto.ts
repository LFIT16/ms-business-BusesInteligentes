import { PartialType } from '@nestjs/mapped-types';
import { CreateConductoreDto } from './create-conductore.dto';

export class UpdateConductoreDto extends PartialType(CreateConductoreDto) {}