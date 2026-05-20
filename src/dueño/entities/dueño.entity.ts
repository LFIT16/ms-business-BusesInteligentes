import { Participacion } from "src/participacion/entities/participacion.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('dueño')
export class Dueño {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'usuario_id', unique: true })
    usuarioId?: string;

    @OneToMany(() => Participacion, (participacion) => participacion.dueño, { cascade: true })
        participacion!: Participacion[];

}
