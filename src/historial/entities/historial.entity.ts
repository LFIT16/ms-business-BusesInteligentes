import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn,} from 'typeorm';
import { Boleto } from '../../boletos/entities/boleto.entity';
import { Nodo } from '../../nodos/entities/nodo.entity';
import { TipoValidacion } from '../enums/tipo-validacion.enum';

@Entity('historial')
export class Historial {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'boleto_id' })
  boletoId?: number;

  @ManyToOne(() => Boleto, boleto => boleto.historial, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'boleto_id' })
  boleto?: Boleto;

  @Column({ name: 'nodo_id' })
  nodoId?: number;

  @ManyToOne(() => Nodo, nodo => nodo.historial, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'nodo_id' })
  nodo?: Nodo;

  @Column({
    type: 'enum',
    enum: TipoValidacion,
  })
  tipo?: TipoValidacion;

  @CreateDateColumn({ name: 'fecha_validacion' })
  fechaValidacion?: Date;
}