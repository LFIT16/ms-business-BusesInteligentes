import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { MetodoPagoCiudadano } from '../../metodos-pago-ciudadano/entities/metodos-pago-ciudadano.entity';
import { TipoMetodoPago } from '../enums/tipo-metodo-pago.enum';

@Entity('metodos_pago')
export class MetodoPago {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    type: 'enum',
    enum: TipoMetodoPago,
    default: TipoMetodoPago.DEBITO,
  })
  tipo?: TipoMetodoPago;

  @Column()
  nombre?: string;

  @OneToMany(() => MetodoPagoCiudadano, metodoPagoCiudadano => metodoPagoCiudadano.metodoPago,)
  metodosPagoCiudadano?: MetodoPagoCiudadano[];
}