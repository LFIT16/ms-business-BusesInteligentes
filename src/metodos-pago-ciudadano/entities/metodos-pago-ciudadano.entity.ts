import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany} from 'typeorm';

import { Ciudadano } from '../../ciudadanos/entities/ciudadano.entity';
import { MetodoPago } from '../../metodos-pago/entities/metodos-pago.entity';
import { Recargas } from '../../recargas/entities/recargas.entity';

@Entity('metodos_pago_ciudadano')
export class MetodoPagoCiudadano {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({name: 'numero_identificacion',unique: true,})
  numeroIdentificacion?: string;

  @Column({type: 'decimal', precision: 12, scale: 2, default: 0,})
  saldo?: number;

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

  @OneToMany(() => Recargas, recarga => recarga.metodoPagoCiudadano)
  recargas?: Recargas[];
}