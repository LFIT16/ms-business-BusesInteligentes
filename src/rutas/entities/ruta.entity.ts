import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Nodo } from '../../nodos/entities/nodo.entity';

@Entity('rutas')
export class Ruta {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    nombre?: string;

    @Column()
    descripcion?: string;

    @Column('decimal', { precision: 10, scale: 2 })
    tarifa?: number;

    @Column()
    tiempoEstimadoTotal?: number;

    @OneToMany(() => Nodo, (nodo) => nodo.ruta, { cascade: true })
    nodos!: Nodo[];
}