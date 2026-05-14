import { PartialType } from '@nestjs/mapped-types';
import { CreateIncidentesBusDto } from './create-incidentes-bus.dto';

export class UpdateIncidentesBusDto extends PartialType(CreateIncidentesBusDto) {}
