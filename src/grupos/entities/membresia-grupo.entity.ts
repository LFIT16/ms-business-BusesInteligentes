import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Grupo } from './grupo.entity';

export enum RolMembresia {
  MIEMBRO = 'miembro',
  ADMINISTRADOR = 'administrador',
}

export enum EstadoMembresia {
  ACTIVO    = 'activo',
  INACTIVO  = 'inactivo',
  BLOQUEADO = 'bloqueado',
}

@Entity('membresias_grupo')
export class MembresiaGrupo {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'grupo_id' })
  grupoId!: number;

  @Column({ name: 'usuario_id' })
  usuarioId!: string;

  @Column({
    type: 'enum',
    enum: RolMembresia,
    default: RolMembresia.MIEMBRO,
  })
  rol!: RolMembresia;

  @Column({
    type: 'enum',
    enum: EstadoMembresia,
    default: EstadoMembresia.ACTIVO,
  })
  estado!: EstadoMembresia;

  @CreateDateColumn({ name: 'fecha_union' })
  fechaUnion?: Date;
  
  @Column({ name: 'fecha_salida', nullable: true })
  fechaSalida?: Date;

  @ManyToOne(() => Grupo, grupo => grupo.membresias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grupo_id' })
  grupo?: Grupo;
}
