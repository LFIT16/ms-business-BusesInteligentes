import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Nodo } from '../../nodos/entities/nodo.entity';

export enum ClasificacionParadero {
  PRINCIPAL = 'principal',
  SECUNDARIO = 'secundario',
  TERMINAL = 'terminal',
}

@Entity('paraderos')
export class Paradero {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  nombre?: string;

  @Column('decimal', { precision: 10, scale: 7 })
  latitud?: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitud?: number;

  @Column({
    type: 'enum',
    enum: ClasificacionParadero,
    default: ClasificacionParadero.SECUNDARIO,
  })
  clasificacion?: ClasificacionParadero;

 @OneToMany(() => Nodo, (nodo) => nodo.paradero)
  nodos?: Nodo[];
}