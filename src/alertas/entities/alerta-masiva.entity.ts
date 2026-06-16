import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum AlcanceAlerta {
  TODOS      = 'todos',
  POR_RUTA   = 'por_ruta',
  POR_ZONA   = 'por_zona',
}

@Entity('alertas_masivas')
export class AlertaMasiva {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'emisor_usuario_id' })
  emisorUsuarioId!: string;

  @Column()
  titulo!: string;

  @Column({ type: 'text' })
  mensaje!: string;

  @Column({ default: false })
  urgente!: boolean;

  @Column({
    type: 'enum',
    enum: AlcanceAlerta,
    default: AlcanceAlerta.TODOS,
  })
  alcance!: AlcanceAlerta;

  @Column({ name: 'ruta_id', nullable: true })
  rutaId?: number;

  @Column({ nullable: true })
  zona?: string; // barrio o ciudad

  @Column({ name: 'total_destinatarios', default: 0 })
  totalDestinatarios!: number;

  @Column({ name: 'total_leidos', default: 0 })
  totalLeidos!: number;

  @Column({ name: 'fecha_programada', nullable: true })
  fechaProgramada?: Date;

  @Column({ default: false })
  enviada!: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion?: Date;
}
