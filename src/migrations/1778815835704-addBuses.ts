import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBuses1778815835704 implements MigrationInterface {
    name = 'AddBuses1778815835704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`boletos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`ciudadanoId\` int NOT NULL, \`programacionRutaId\` int NOT NULL, \`metodoPagoCiudadanoId\` int NOT NULL, \`paraderoAbordajeId\` int NOT NULL, \`paraderoDescensoId\` int NULL, \`montoTarifa\` decimal(10,2) NOT NULL, \`saldoRestante\` decimal(12,2) NULL, \`timestampAbordaje\` timestamp NOT NULL, \`timestampDescenso\` timestamp NULL, \`estado\` enum ('activo', 'completado', 'cancelado') NOT NULL DEFAULT 'activo', \`creadoEn\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`boletos\` ADD CONSTRAINT \`FK_ab53d73fc2b02e099e23171a09f\` FOREIGN KEY (\`ciudadanoId\`) REFERENCES \`ciudadanos\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`boletos\` ADD CONSTRAINT \`FK_397144d322e00220bc15903f470\` FOREIGN KEY (\`programacionRutaId\`) REFERENCES \`programaciones_ruta\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`boletos\` ADD CONSTRAINT \`FK_9876e17260b5ec3353ff9489e3f\` FOREIGN KEY (\`metodoPagoCiudadanoId\`) REFERENCES \`metodos_pago_ciudadano\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`boletos\` ADD CONSTRAINT \`FK_43d9d1f619ca23fb6b69cbef055\` FOREIGN KEY (\`paraderoAbordajeId\`) REFERENCES \`paraderos\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`boletos\` ADD CONSTRAINT \`FK_d3debf3aa7646799e5a335fc6f7\` FOREIGN KEY (\`paraderoDescensoId\`) REFERENCES \`paraderos\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`boletos\` DROP FOREIGN KEY \`FK_d3debf3aa7646799e5a335fc6f7\``);
        await queryRunner.query(`ALTER TABLE \`boletos\` DROP FOREIGN KEY \`FK_43d9d1f619ca23fb6b69cbef055\``);
        await queryRunner.query(`ALTER TABLE \`boletos\` DROP FOREIGN KEY \`FK_9876e17260b5ec3353ff9489e3f\``);
        await queryRunner.query(`ALTER TABLE \`boletos\` DROP FOREIGN KEY \`FK_397144d322e00220bc15903f470\``);
        await queryRunner.query(`ALTER TABLE \`boletos\` DROP FOREIGN KEY \`FK_ab53d73fc2b02e099e23171a09f\``);
        await queryRunner.query(`DROP TABLE \`boletos\``);
    }

}
