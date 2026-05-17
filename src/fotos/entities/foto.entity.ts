import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn,} from 'typeorm';
import { IncidentesBus } from '../../incidentes-bus/entities/incidentes-bus.entity';

@Entity('fotos')
export class Foto {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'longtext', nullable: true })
  urlFoto?: string;

  @Column({ nullable: true })
  descripcion?: string;

  @ManyToOne(() => IncidentesBus, incidenteBus => incidenteBus.fotos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'incidente_bus_id' })
  incidenteBus?: IncidentesBus;

  @Column({ name: 'incidente_bus_id' })
  incidenteBusId?: number;

  @CreateDateColumn({ name: 'fecha_registro' })
  fechaRegistro?: Date;
}