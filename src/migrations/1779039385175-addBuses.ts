import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBuses1779039385175 implements MigrationInterface {
    name = 'AddBuses1779039385175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`fotos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`urlFoto\` longtext NULL, \`descripcion\` varchar(255) NULL, \`incidente_bus_id\` int NOT NULL, \`fecha_registro\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`incidentes_bus\` (\`id\` int NOT NULL AUTO_INCREMENT, \`incidente_id\` int NOT NULL, \`bus_id\` int NOT NULL, \`fecha_registro\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`incidentes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tipo\` enum ('mecanico', 'accidente', 'retraso', 'otro') NOT NULL, \`gravedad\` enum ('bajo', 'medio', 'alto', 'critico') NOT NULL, \`descripcion\` text NULL, \`conductorId\` int NULL, \`turnoId\` int NULL, \`estado\` enum ('pendiente', 'en_revision', 'resuelto') NOT NULL DEFAULT 'pendiente', \`comentario\` text NULL, \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`fotos\` ADD CONSTRAINT \`FK_ff62ea628675c35a75cf5c65ea4\` FOREIGN KEY (\`incidente_bus_id\`) REFERENCES \`incidentes_bus\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`incidentes_bus\` ADD CONSTRAINT \`FK_0a803fc3333c4201abde7e6b071\` FOREIGN KEY (\`bus_id\`) REFERENCES \`buses\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`incidentes_bus\` DROP FOREIGN KEY \`FK_0a803fc3333c4201abde7e6b071\``);
        await queryRunner.query(`ALTER TABLE \`fotos\` DROP FOREIGN KEY \`FK_ff62ea628675c35a75cf5c65ea4\``);
        await queryRunner.query(`DROP TABLE \`incidentes\``);
        await queryRunner.query(`DROP TABLE \`incidentes_bus\``);
        await queryRunner.query(`DROP TABLE \`fotos\``);
    }

}
