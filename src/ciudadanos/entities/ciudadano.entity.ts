import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

import { Direccion } from '../../direcciones/entities/direccione.entity';
import { MetodoPagoCiudadano } from '../../metodos-pago-ciudadano/entities/metodos-pago-ciudadano.entity';

@Entity('ciudadanos')
export class Ciudadano {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'usuario_id', unique: true })
  usuarioId?: string;

  @OneToOne(() => Direccion, direccion => direccion.ciudadano, {
    cascade: true,
  })
  direccion?: Direccion;

  @OneToMany(
    () => MetodoPagoCiudadano,
    metodoPagoCiudadano => metodoPagoCiudadano.ciudadano,
  )
  metodosPagoCiudadano?: MetodoPagoCiudadano[];
}