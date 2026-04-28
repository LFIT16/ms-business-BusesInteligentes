import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Ruta } from 'src/rutas/entities/ruta.entity';
//import { Paradero } from 'src/paraderos/entities/paradero.entity';

@Entity('nodos')
export class Nodo {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    orden?: number;

    @ManyToOne(() => Ruta, (ruta) => ruta.nodos)
    ruta?: Ruta;

    //@ManyToOne(() => Paradero, (paradero) => paradero.nodos)
    //paradero?: Paradero;
}