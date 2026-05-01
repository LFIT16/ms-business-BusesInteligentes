import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { EstadoBus } from '../enums/estado-bus.enum';

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

  @Column({ nullable: true })
  fotoUrl?: string;

  @Column({ unique: true })
  codigoQr?: string;

}