import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
} from 'typeorm';
import { TipoIncidente }     from '../enums/tipo-incidente.enum';
import { GravedadIncidente } from '../enums/gravedad-incidente.enum';
import { EstadoIncidente }   from '../enums/estado-incidente.enum';

@Entity('incidentes')
export class Incidente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: TipoIncidente })
  tipo!: TipoIncidente;

  @Column({ type: 'enum', enum: GravedadIncidente })
  gravedad!: GravedadIncidente;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ nullable: true })
  conductorId!: number;

  @Column({ nullable: true })
  turnoId!: number;

  @Column({ type: 'enum', enum: EstadoIncidente, default: EstadoIncidente.PENDIENTE })
  estado!: EstadoIncidente;

  @Column({ type: 'text', nullable: true, default: null })
  comentario!: string | null;

  @CreateDateColumn()
  timestamp!: Date;
}