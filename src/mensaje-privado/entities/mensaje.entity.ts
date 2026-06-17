import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import { DestinatarioPersona } from './destinatario-persona.entity';

@Entity('mensajes')
export class Mensaje {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'emisor_id' })
  emisorId?: string;

  @Column({ length: 500 })
  contenido?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitud?: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitud?: number | null;

  @CreateDateColumn({ name: 'fecha_envio' })
  fechaEnvio?: Date;

  @OneToMany(() => DestinatarioPersona, (dp) => dp.mensaje, {
    cascade: true,
    eager: true,
  })
  destinatariosPersona?: DestinatarioPersona[];
}