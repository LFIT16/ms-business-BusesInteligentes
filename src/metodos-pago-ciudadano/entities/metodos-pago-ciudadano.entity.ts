import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Ciudadano } from '../../ciudadanos/entities/ciudadano.entity';
import { MetodoPago } from '../../metodos-pago/entities/metodos-pago.entity';

@Entity('metodos_pago_ciudadano')
export class MetodoPagoCiudadano {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'numero_identificacion' })
  numeroIdentificacion?: string;

  @Column({ default: true })
  activo?: boolean;

  @ManyToOne(() => Ciudadano, ciudadano => ciudadano.metodosPagoCiudadano, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ciudadano_id' })
  ciudadano?: Ciudadano;

  @ManyToOne(
    () => MetodoPago,
    metodoPago => metodoPago.metodosPagoCiudadano,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'metodo_pago_id' })
  metodoPago?: MetodoPago;
}