import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ruta } from '../../rutas/entities/ruta.entity';
import { Paradero } from '../../paradero/entities/paradero.entity';

@Entity('nodos')
export class Nodo {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    orden?: number;

    @ManyToOne(() => Ruta, (ruta) => ruta.nodos)
    ruta?: Ruta;

    
  @ManyToOne(() => Paradero, (paradero) => paradero.nodos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paradero_id' })
  paradero?: Paradero;
}