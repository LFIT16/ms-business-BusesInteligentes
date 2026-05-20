import { Collection, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Dueño } from '../../dueño/entities/dueño.entity';
import { Empresa } from "src/empresas/entities/empresa.entity";



@Entity('participacion')
export class Participacion {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    porcentajeParticipacion?: number;

    @ManyToOne(() => Dueño, dueño => dueño.participacion, { onDelete: 'CASCADE' })
    @JoinColumn( {name: 'dueño_id'})
    dueño?: Dueño[];

    @ManyToOne(() => Empresa, empresa => empresa.participacion, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'empresa_id' })
    empresa?: Empresa [];

}
