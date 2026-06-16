import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MembresiaGrupo } from './membresia-grupo.entity';

@Entity('grupos')
export class Grupo {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ default: true })
  esPublico!: boolean;

  @Column({ name: 'creador_usuario_id' })
  creadorUsuarioId!: string;

  @Column({ default: true })
  activo!: boolean;

  // HU-ENTR-3-006: imagen de perfil del grupo
  @Column({ name: 'foto_url', type: 'longtext', nullable: true })
  fotoUrl?: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion?: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion?: Date;

  @OneToMany(() => MembresiaGrupo, membresia => membresia.grupo, {
    cascade: true,
  })
  membresias?: MembresiaGrupo[];
}
