// src/incidentes-bus/entities/incidente-bus.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

import { Bus } from '../../buses/entities/bus.entity';
import { Foto } from '../../fotos/entities/foto.entity';
import { Incidente } from '../../incidentes/entities/incidente.entity';

@Entity('incidentes_bus')
export class IncidentesBus {
  @PrimaryGeneratedColumn()
  id?: number;

   @Column({ name: 'incidente_id' })
  incidenteId?: number;

  @ManyToOne(() => Incidente, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'incidente_id' })
  incidente?: Incidente;

  @Column({ name: 'bus_id' })
  busId?: number;

  @ManyToOne(() => Bus, bus => bus.incidentesBus, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bus_id' })
  bus?: Bus;

  @OneToMany(() => Foto, foto => foto.incidenteBus)
  fotos?: Foto[];

  @CreateDateColumn({ name: 'fecha_registro' })
  fechaRegistro?: Date;
}