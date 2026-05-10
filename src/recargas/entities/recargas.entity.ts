import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, } from 'typeorm';

import { MetodoPagoCiudadano } from '../../metodos-pago-ciudadano/entities/metodos-pago-ciudadano.entity';
import { EstadoRecarga } from '../enums/estado-recarga.enum';

@Entity('recargas')
export class Recargas {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'metodo_pago_ciudadano_id' })
  metodoPagoCiudadanoId?: number;

  @ManyToOne(() => MetodoPagoCiudadano, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'metodo_pago_ciudadano_id' })
  metodoPagoCiudadano?: MetodoPagoCiudadano;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  monto?: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  comision?: number;

  @Column({
    name: 'total_pagar',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalPagar?: number;

  @Column({
    type: 'enum',
    enum: EstadoRecarga,
    default: EstadoRecarga.PENDIENTE,
  })
  estado?: EstadoRecarga;

  @Column({
    name: 'referencia_interna',
    unique: true,
  })
  referenciaInterna?: string;

  @Column({
    name: 'referencia_epayco',
    nullable: true,
  })
  referenciaEpayco?: string;

  @Column({
    name: 'transaccion_epayco',
    nullable: true,
  })
  transaccionEpayco?: string;

  @Column({ default: false })
  aplicada?: boolean;

  @Column({
    name: 'payload_epayco',
    type: 'json',
    nullable: true,
  })
  payloadEpayco?: any;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt?: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt?: Date;
}