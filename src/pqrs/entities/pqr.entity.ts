import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TipoPQRS } from '../enums/tipo-pqrs.enum';
import { CategoriaPQRS } from '../enums/categoria-pqrs.enum';
import { EstadoPQRS } from '../enums/estado-pqrs.enum';

@Entity('pqrs')
export class PQRS {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  radicado?: string;

  @Column({ type: 'enum', enum: TipoPQRS })
  tipo?: TipoPQRS;

  @Column({ type: 'enum', enum: CategoriaPQRS })
  categoria?: CategoriaPQRS;

  @Column({ type: 'varchar', length: 500 })
  descripcion?: string;

  @Column()
  usuarioId?: string;

  @Column({
    type: 'enum',
    enum: EstadoPQRS,
    default: EstadoPQRS.ENVIADO,
  })
  estado?: EstadoPQRS;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}