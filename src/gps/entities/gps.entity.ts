import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Bus } from '../../buses/entities/bus.entity';

@Entity('gps')
export class Gps {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  codigo!: string;

  @Column({ name: 'busId', unique: true })
  busId!: number;

  @OneToOne(() => Bus, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'busId' })
  bus!: Bus;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    default: null,
  })
  latitud!: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    default: null,
  })
  longitud!: number | null;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: true,
    default: null,
  })
  velocidad!: number | null;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: true,
    default: null,
  })
  rumbo!: number | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  ultimaActualizacion!: Date | null;

  @Column({ default: true })
  activo!: boolean;

  @CreateDateColumn()
  creadoEn!: Date;

  @UpdateDateColumn()
  actualizadoEn!: Date;
}