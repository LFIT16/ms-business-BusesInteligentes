import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Bus } from '../../buses/entities/bus.entity';
import { Conductore } from '../../conductores/entities/conductore.entity';
import { Participacion } from 'src/participacion/entities/participacion.entity';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  nit!: string;

  @Column()
  nombre!: string;

  @Column({ nullable: true })
  telefono?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  direccion?: string;

  @Column({ default: true })
  activo!: boolean;

  @OneToMany(() => Bus, bus => bus.empresa)
  buses?: Bus[];

  @OneToMany(() => Conductore, conductor => conductor.empresa)
  conductores?: Conductore[];

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn!: Date;

  @OneToMany(() => Participacion, participacion => participacion.empresa)
  participacion?: Participacion[];
}