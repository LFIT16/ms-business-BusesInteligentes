import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('configuraciones_clima')
export class ConfiguracionClima {

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    name: 'usuario_id',
    unique: true
  })
  usuarioId?: string;

  @Column({
    nullable: true
  })
  email?: string;

  @Column({
    nullable: true
  })
  telefono?: string;

  @Column({
    default: false
  })
  activado?: boolean;

  @Column({
    name: 'horario_viaje',
    nullable: true
  })
  horarioViaje?: string;

  @Column({
    nullable: true
  })
  ciudad?: string;

  @Column({
    name: 'canal_preferido',
    type: 'enum',
    enum: ['email', 'whatsapp', 'push'],
    default: 'email'
  })
  canalPreferido?: 'email' | 'whatsapp' | 'push';

  @Column({
    name: 'alerta_enviada_hoy',
    default: false
  })
  alertaEnviadaHoy?: boolean;

  @Column({
    name: 'ultima_alerta_enviada',
    nullable: true
  })
  ultimaAlertaEnviada?: Date;

  @CreateDateColumn({
    name: 'created_at'
  })
  createdAt?: Date;

  @UpdateDateColumn({
    name: 'updated_at'
  })
  updatedAt?: Date;
}