import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MensajeGrupo } from './mensaje-grupo.entity';

@Entity('lecturas_mensaje')
export class LecturaMensaje {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'mensaje_id' })
  mensajeId!: number;
  

  @Column({ name: 'usuario_id' })
  usuarioId!: string;

  @CreateDateColumn({ name: 'fecha_lectura' })
  fechaLectura?: Date;

  @ManyToOne(() => MensajeGrupo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mensaje_id' })
  mensaje?: MensajeGrupo;

  
}
