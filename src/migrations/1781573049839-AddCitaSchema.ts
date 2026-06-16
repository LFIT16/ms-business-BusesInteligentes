import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCitaSchema1781573049839 implements MigrationInterface {
    name = 'AddCitaSchema1781573049839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`conductores\` DROP FOREIGN KEY \`fk_conductores_empresa\``);
        await queryRunner.query(`ALTER TABLE \`buses\` DROP FOREIGN KEY \`fk_buses_empresa\``);
        await queryRunner.query(`DROP INDEX \`uq_empresas_nit\` ON \`empresas\``);
        await queryRunner.query(`CREATE TABLE \`citas\` (\`id\` int NOT NULL AUTO_INCREMENT, \`usuario_id\` varchar(255) NOT NULL, \`tipo_atencion\` enum ('Presencial', 'Virtual') NOT NULL, \`tipo_consulta\` enum ('Problema con tarjeta', 'Reclamo', 'Reembolso', 'Otro') NOT NULL, \`fecha_hora\` datetime NOT NULL, \`motivo\` varchar(500) NOT NULL, \`evento_google_id\` varchar(255) NULL, \`estado\` varchar(255) NOT NULL DEFAULT 'agendada', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`empresas\` DROP COLUMN \`nit\``);
        await queryRunner.query(`ALTER TABLE \`empresas\` ADD \`nit\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`empresas\` ADD UNIQUE INDEX \`IDX_3815a71fa4034941beaf005118\` (\`nit\`)`);
        await queryRunner.query(`ALTER TABLE \`empresas\` DROP COLUMN \`nombre\``);
        await queryRunner.query(`ALTER TABLE \`empresas\` ADD \`nombre\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`empresas\` DROP COLUMN \`telefono\``);
        await queryRunner.query(`ALTER TABLE \`empresas\` ADD \`telefono\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`empresas\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`empresas\` ADD \`email\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`empresas\` DROP COLUMN \`creado_en\``);
        await queryRunner.query(`ALTER TABLE \`empresas\` ADD \`creado_en\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`empresas\` DROP COLUMN \`actualizado_en\``);
        await queryRunner.query(`ALTER TABLE \`empresas\` ADD \`actualizado_en\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`conductores\` ADD CONSTRAINT \`FK_070ef78ae19c573994f6a55e7e8\` FOREIGN KEY (\`empresa_id\`) REFERENCES \`empresas\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`buses\` ADD CONSTRAINT \`FK_45fbb665b161ccb9b63acb9904c\` FOREIGN KEY (\`empresa_id\`) REFERENCES \`empresas\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`buses\` DROP FOREIGN KEY \`FK_45fbb665b161ccb9b63acb9904c\``);
        await queryRunner.query(`ALTER TABLE \`conductores\` DROP FOREIGN KEY \`FK_070ef78ae19c573994f6a55e7e8\``);
        await queryRunner.query(`ALTER TABLE \`empresas\` DROP COLUMN \`actualizado_en\``);
        await queryRunner.query(`ALTER TABLE \`empresas\` ADD \`actualizado_en\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`empresas\` DROP COLUMN \`creado_en\``);
        await queryRunner.query(`ALTER TABLE \`empresas\` ADD \`creado_en\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`empresas\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`empresas\` ADD \`email\` varchar(150) NULL`);
        await queryRunner.query(`ALTER TABLE \`empresas\` DROP COLUMN \`telefono\``);
        await queryRunner.query(`ALTER TABLE \`empresas\` ADD \`telefono\` varchar(30) NULL`);
        await queryRunner.query(`ALTER TABLE \`empresas\` DROP COLUMN \`nombre\``);
        await queryRunner.query(`ALTER TABLE \`empresas\` ADD \`nombre\` varchar(150) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`empresas\` DROP INDEX \`IDX_3815a71fa4034941beaf005118\``);
        await queryRunner.query(`ALTER TABLE \`empresas\` DROP COLUMN \`nit\``);
        await queryRunner.query(`ALTER TABLE \`empresas\` ADD \`nit\` varchar(50) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`citas\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`uq_empresas_nit\` ON \`empresas\` (\`nit\`)`);
        await queryRunner.query(`ALTER TABLE \`buses\` ADD CONSTRAINT \`fk_buses_empresa\` FOREIGN KEY (\`empresa_id\`) REFERENCES \`empresas\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`conductores\` ADD CONSTRAINT \`fk_conductores_empresa\` FOREIGN KEY (\`empresa_id\`) REFERENCES \`empresas\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
