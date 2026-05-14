import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBuses1778558040846 implements MigrationInterface {
    name = 'AddBuses1778558040846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`programaciones_ruta\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rutaId\` int NOT NULL, \`busId\` int NOT NULL, \`fechaSalida\` date NOT NULL, \`horaSalida\` time NOT NULL, \`recurrencia\` enum ('ninguna', 'lunes_viernes', 'fines_semana', 'diaria') NOT NULL DEFAULT 'ninguna', \`toleranciaSalida\` int NOT NULL DEFAULT '5', \`estado\` enum ('programado', 'en_curso', 'finalizado', 'cancelado') NOT NULL DEFAULT 'programado', \`creadoEn\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`programaciones_ruta\` ADD CONSTRAINT \`FK_6576c91d3c5198864f64c9a9556\` FOREIGN KEY (\`rutaId\`) REFERENCES \`rutas\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`programaciones_ruta\` ADD CONSTRAINT \`FK_bdaff234636888e7aa54c2137c5\` FOREIGN KEY (\`busId\`) REFERENCES \`buses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`programaciones_ruta\` DROP FOREIGN KEY \`FK_bdaff234636888e7aa54c2137c5\``);
        await queryRunner.query(`ALTER TABLE \`programaciones_ruta\` DROP FOREIGN KEY \`FK_6576c91d3c5198864f64c9a9556\``);
        await queryRunner.query(`DROP TABLE \`programaciones_ruta\``);
    }

}
