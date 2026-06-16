import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum AccionLog {
  UNION = 'union',
  SALIDA = 'salida',
  PROMOVIDO = 'promovido',
  REMOVIDO = 'removido',
  BLOQUEADO = 'bloqueado',
}

@Entity('logs_membresia_grupo')
export class LogMembresiaGrupo {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'grupo_id' })
  grupoId!: number;

  @Column({ name: 'usuario_afectado_id' })
  usuarioAfectadoId!: string;

  @Column({ name: 'usuario_actor_id', nullable: true })
  usuarioActorId?: string;

  @Column({
    type: 'enum',
    enum: AccionLog,
  })
  accion!: AccionLog;

  @CreateDateColumn({ name: 'fecha_accion' })
  fechaAccion?: Date;
}
