import { PartialType } from '@nestjs/mapped-types';
import { CreateMetodosPagoCiudadanoDto } from './create-metodos-pago-ciudadano.dto';

export class UpdateMetodosPagoCiudadanoDto extends PartialType(CreateMetodosPagoCiudadanoDto) {}
