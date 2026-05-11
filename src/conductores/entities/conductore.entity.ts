import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('conductores')
export class Conductore {
  @PrimaryGeneratedColumn()
  id?: number;

  // CAMBIO CLAVE: Cambiamos 'int' por 'varchar' o lo dejamos vacío
  // para que acepte los IDs como "69abc" sin truncarlos.
  @Column({ type: 'varchar', length: 100, unique: true })
  userId?: string; // Cambiado de number a string

  @Column({ type: 'varchar', length: 20, unique: true })
  licencia?: string;

  @Column({ type: 'date', nullable: true, default: null })
  fechaVencimientoLicencia?: Date | null;

  @Column({ type: 'varchar', length: 20, nullable: true, default: null })
  telefono?: string;

  @Column({ type: 'boolean', default: true })
  activo?: boolean;

  @CreateDateColumn()
  creadoEn?: Date;
}