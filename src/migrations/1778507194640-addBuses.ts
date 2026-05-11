import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBuses1778507194640 implements MigrationInterface {
    name = 'AddBuses1778507194640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`turnos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`conductorId\` int NOT NULL, \`busId\` int NOT NULL, \`horaInicio\` timestamp NOT NULL, \`horaFin\` timestamp NOT NULL, \`estadoTurno\` enum ('pendiente', 'en_curso', 'finalizado') NOT NULL DEFAULT 'pendiente', \`estadoBus\` enum ('operativo', 'mantenimiento', 'fuera_de_servicio') NULL, \`observaciones\` text NULL, \`horaRealInicio\` timestamp NULL, \`creadoEn\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`conductores\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`licencia\` varchar(20) NOT NULL, \`fechaVencimientoLicencia\` date NULL, \`telefono\` varchar(20) NULL, \`activo\` tinyint NOT NULL DEFAULT 1, \`creadoEn\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_f06f081193549254c548f47bed\` (\`userId\`), UNIQUE INDEX \`IDX_a01e7172ea361195be58ab5962\` (\`licencia\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`buses\` ADD \`gpsActivo\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`turnos\` ADD CONSTRAINT \`FK_0e3c41db75e34985b4702fce8b6\` FOREIGN KEY (\`busId\`) REFERENCES \`buses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`turnos\` DROP FOREIGN KEY \`FK_0e3c41db75e34985b4702fce8b6\``);
        await queryRunner.query(`ALTER TABLE \`buses\` DROP COLUMN \`gpsActivo\``);
        await queryRunner.query(`DROP INDEX \`IDX_a01e7172ea361195be58ab5962\` ON \`conductores\``);
        await queryRunner.query(`DROP INDEX \`IDX_f06f081193549254c548f47bed\` ON \`conductores\``);
        await queryRunner.query(`DROP TABLE \`conductores\``);
        await queryRunner.query(`DROP TABLE \`turnos\``);
    }

}
