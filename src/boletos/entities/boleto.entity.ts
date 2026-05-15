import {
  Entity, Column, PrimaryGeneratedColumn,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { Ciudadano }            from '../../ciudadanos/entities/ciudadano.entity';
import { ProgramacionRuta }     from '../../programaciones-ruta/entities/programacion-ruta.entity';
import { MetodoPagoCiudadano }  from '../../metodos-pago-ciudadano/entities/metodos-pago-ciudadano.entity';
import { Paradero }             from '../../paradero/entities/paradero.entity';
import { EstadoBoleto }         from '../enums/estado-boleto.enum';

@Entity('boletos')
export class Boleto {

  @PrimaryGeneratedColumn()
  id!: number;

  // ── Ciudadano ──────────────────────────────────────────────────────
  @Column()
  ciudadanoId!: number;

  @ManyToOne(() => Ciudadano, { eager: false })
  @JoinColumn({ name: 'ciudadanoId' })
  ciudadano!: Ciudadano;

  // ── Programación ───────────────────────────────────────────────────
  @Column()
  programacionRutaId!: number;

  @ManyToOne(() => ProgramacionRuta, { eager: false })
  @JoinColumn({ name: 'programacionRutaId' })
  programacionRuta!: ProgramacionRuta;

  // ── Método de pago ─────────────────────────────────────────────────
  @Column()
  metodoPagoCiudadanoId!: number;

  @ManyToOne(() => MetodoPagoCiudadano, { eager: false })
  @JoinColumn({ name: 'metodoPagoCiudadanoId' })
  metodoPagoCiudadano!: MetodoPagoCiudadano;

  // ── Paraderos ──────────────────────────────────────────────────────
  @Column()
  paraderoAbordajeId!: number;

  @ManyToOne(() => Paradero, { eager: false })
  @JoinColumn({ name: 'paraderoAbordajeId' })
  paraderoAbordaje!: Paradero;

  @Column({ nullable: true })
  paraderoDescensoId!: number;

  @ManyToOne(() => Paradero, { nullable: true, eager: false })
  @JoinColumn({ name: 'paraderoDescensoId' })
  paraderoDescenso!: Paradero;

  // ── Snapshot financiero ────────────────────────────────────────────
  /** Tarifa cobrada en el momento del abordaje */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montoTarifa!: number;

  /** Saldo restante tras el descuento (null si no es recargable) */
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  saldoRestante!: number | null;

  // ── Timestamps ─────────────────────────────────────────────────────
  @Column({ type: 'timestamp' })
  timestampAbordaje!: Date;

  @Column({ type: 'timestamp', nullable: true })
  timestampDescenso!: Date;

  // ── Estado ─────────────────────────────────────────────────────────
  @Column({ type: 'enum', enum: EstadoBoleto, default: EstadoBoleto.ACTIVO })
  estado!: EstadoBoleto;

  @CreateDateColumn()
  creadoEn!: Date;
}