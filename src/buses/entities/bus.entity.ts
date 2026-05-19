import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { EstadoBus } from '../enums/estado-bus.enum';
import { IncidentesBus } from '../../incidentes-bus/entities/incidentes-bus.entity';
import { Gps } from '../../gps/entities/gps.entity';
import { Empresa } from '../../empresas/entities/empresa.entity';


@Entity('buses')
export class Bus {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  placa?: string;

  @Column()
  modelo?: string;

  @Column()
  anio?: number;

  @Column()
  capacidadMaximaPasajeros?: number;

  @Column()
  capacidadSentados?: number;

  @Column()
  capacidadParados?: number;

  @Column({
    type: 'enum',
    enum: EstadoBus,
    default: EstadoBus.OPERATIVO,
  })
  estado!: EstadoBus;

  @Column({ type: 'longtext', nullable: true })
  fotoUrl?: string;

  @Column({ unique: true })
  codigoQr?: string;

  // ── Nuevo campo para tracking GPS ──────────────────────────────────
  @Column({ default: false })
  gpsActivo?: boolean;

  @OneToMany(() => IncidentesBus, incidenteBus => incidenteBus.bus)
  incidentesBus?: IncidentesBus[];

  @OneToOne(() => Gps, gps => gps.bus)
  gps!: Gps;

  @Column({ name: 'empresa_id', nullable: true })
  empresaId?: number;

  @ManyToOne(() => Empresa, empresa => empresa.buses, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'empresa_id' })
  empresa?: Empresa;
}