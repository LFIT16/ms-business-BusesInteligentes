import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { Ciudadano } from '../../ciudadanos/entities/ciudadano.entity';

@Entity('direcciones')
export class Direccion {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  pais?: string;

  @Column()
  ciudad?: string;

  @Column()
  barrio?: string;

  @Column()
  calle?: string;

  @Column()
  numero?: string;

  @Column({ nullable: true })
  referencia?: string;

  @Column({ name: 'codigo_postal', nullable: true })
  codigoPostal?: string;

  @ManyToOne(() => Ciudadano, ciudadano => ciudadano.direcciones, {
  onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ciudadano_id' })
  ciudadano?: Ciudadano;
}
