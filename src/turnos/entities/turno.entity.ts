import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Bus } from '../../buses/entities/bus.entity';
import { EstadoTurno } from '../enums/estado-turno.enum';
import { EstadoBus } from '../../buses/enums/estado-bus.enum';

@Entity('turnos')
export class Turno {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  conductorId!: number;

  @ManyToOne(() => Bus, { eager: true })
  @JoinColumn({ name: 'busId' })
  bus!: Bus;

  @Column()
  busId!: number;

  @Column({ type: 'timestamp' })
  horaInicio!: Date;

  @Column({ type: 'timestamp' })
  horaFin!: Date;

  @Column({
    type: 'enum',
    enum: EstadoTurno,
    default: EstadoTurno.PENDIENTE,
  })
  estadoTurno!: EstadoTurno;

  @Column({
    type: 'enum',
    enum: EstadoBus,
    nullable: true,
    default: null,
  })
  estadoBus!: EstadoBus | null;

  @Column({ type: 'text', nullable: true, default: null })
  observaciones!: string | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  horaRealInicio!: Date | null;

  @CreateDateColumn()
  creadoEn!: Date;
  
  @Column({ type: 'timestamp', nullable: true, default: null })
horaRealFin!: Date | null;
}