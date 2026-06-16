import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('citas')
export class Cita {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'usuario_id' })
  usuarioId?: string;

  @Column({ name: 'tipo_atencion', type: 'enum', enum: ['Presencial', 'Virtual'] })
  tipoAtencion?: string;

  @Column({ name: 'tipo_consulta', type: 'enum', enum: ['Problema con tarjeta', 'Reclamo', 'Reembolso', 'Otro'] })
  tipoConsulta?: string;

  @Column({ name: 'fecha_hora' })
  fechaHora?: Date;

  @Column({ type: 'varchar', length: 500 })
  motivo?: string;

  @Column({ name: 'evento_google_id', nullable: true })
  eventoGoogleId?: string;

  @Column({ name: 'estado', default: 'agendada' })
  estado?: 'agendada' | 'cancelada' | 'completada';

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;
}