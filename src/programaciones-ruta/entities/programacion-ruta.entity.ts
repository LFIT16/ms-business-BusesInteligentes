import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Bus } from '../../buses/entities/bus.entity';
import { Ruta } from '../../rutas/entities/ruta.entity';
import { EstadoProgramacion } from '../enums/estado-programacion.enum';
import { Recurrencia } from '../enums/recurrencia.enum';

@Entity('programaciones_ruta')
export class ProgramacionRuta {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  rutaId!: number;

  @ManyToOne(() => Ruta, { eager: true })
  @JoinColumn({ name: 'rutaId' })
  ruta!: Ruta;

  @Column()
  busId!: number;

  @ManyToOne(() => Bus, { eager: true })
  @JoinColumn({ name: 'busId' })
  bus!: Bus;

  /** Fecha de salida: solo la parte de fecha (YYYY-MM-DD) */
  @Column({ type: 'date' })
  fechaSalida!: string;

  /** Hora de salida: solo la parte de hora (HH:mm:ss) */
  @Column({ type: 'time' })
  horaSalida!: string;

  @Column({
    type: 'enum',
    enum: Recurrencia,
    default: Recurrencia.NINGUNA,
  })
  recurrencia!: Recurrencia;

  /** Tolerancia en minutos para la salida (ej: 5 → ±5 min) */
  @Column({ type: 'int', default: 5 })
  toleranciaSalida!: number;

  @Column({
    type: 'enum',
    enum: EstadoProgramacion,
    default: EstadoProgramacion.PROGRAMADO,
  })
  estado!: EstadoProgramacion;

  @CreateDateColumn()
  creadoEn!: Date;
}