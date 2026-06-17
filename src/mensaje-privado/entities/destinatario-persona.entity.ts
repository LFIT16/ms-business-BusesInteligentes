import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Mensaje } from './mensaje.entity';
;

@Entity('destinatario_personas')
export class DestinatarioPersona {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'mensaje_id' })
  mensajeId?: number;

  @Column({ name: 'usuario_id' })
  usuarioId?: string;

  @Column({ default: false })
  leido?: boolean;

  @Column({ name: 'fecha_leido', type: 'datetime', nullable: true })
  fechaLeido?: Date | null;

  @ManyToOne(() => Mensaje, (m) => m.destinatariosPersona, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mensaje_id' })
  mensaje?: Mensaje;

}