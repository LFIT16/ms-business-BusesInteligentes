import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Grupo } from '../../grupos/entities/grupo.entity';
import { LecturaMensaje } from './lectura-mensaje.entity';

@Entity('mensajes_grupo')
export class MensajeGrupo {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'grupo_id' })
  grupoId!: number;

  @Column({ name: 'usuario_id' })
  usuarioId!: string;

  @Column({ name: 'nombre_usuario', length: 255 })
  nombreUsuario!: string;

  @Column({ type: 'text' })
  contenido!: string;

  @Column({ default: false })
  eliminado!: boolean;

  @CreateDateColumn({ name: 'fecha_envio' })
  fechaEnvio?: Date;

  @ManyToOne(() => Grupo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grupo_id' })
  grupo?: Grupo;

  @OneToMany(() => LecturaMensaje, lectura => lectura.mensaje)
  lecturas?: LecturaMensaje[];
}
