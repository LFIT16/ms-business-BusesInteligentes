import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Ruta } from '../../rutas/entities/ruta.entity';
import { Paradero } from '../../paradero/entities/paradero.entity';
import { Historial } from '../../historial/entities/historial.entity';

@Entity('nodos')
export class Nodo {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    orden?: number;

    @ManyToOne(() => Ruta, ruta => ruta.nodos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ruta_id' })
    ruta?: Ruta;

    @ManyToOne(() => Paradero, (paradero) => paradero.nodos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'paradero_id' })
    paradero?: Paradero;

    @OneToMany(() => Historial, historial => historial.nodo)
    historial?: Historial[];
}