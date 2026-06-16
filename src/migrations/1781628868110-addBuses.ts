import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBuses1781628868110 implements MigrationInterface {
    name = 'AddBuses1781628868110'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`lecturas_mensaje\` (\`id\` int NOT NULL AUTO_INCREMENT, \`mensaje_id\` int NOT NULL, \`usuario_id\` varchar(255) NOT NULL, \`fecha_lectura\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`alertas_masivas\` (\`id\` int NOT NULL AUTO_INCREMENT, \`emisor_usuario_id\` varchar(255) NOT NULL, \`titulo\` varchar(255) NOT NULL, \`mensaje\` text NOT NULL, \`urgente\` tinyint NOT NULL DEFAULT 0, \`alcance\` enum ('todos', 'por_ruta', 'por_zona') NOT NULL DEFAULT 'todos', \`ruta_id\` int NULL, \`zona\` varchar(255) NULL, \`total_destinatarios\` int NOT NULL DEFAULT '0', \`total_leidos\` int NOT NULL DEFAULT '0', \`fecha_programada\` datetime NULL, \`enviada\` tinyint NOT NULL DEFAULT 0, \`fecha_creacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`grupos\` ADD \`foto_url\` longtext NULL`);
        await queryRunner.query(`ALTER TABLE \`mensajes_grupo\` ADD \`eliminado\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`lecturas_mensaje\` ADD CONSTRAINT \`FK_1cbe97c0747b776d032128d1ddc\` FOREIGN KEY (\`mensaje_id\`) REFERENCES \`mensajes_grupo\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`lecturas_mensaje\` DROP FOREIGN KEY \`FK_1cbe97c0747b776d032128d1ddc\``);
        await queryRunner.query(`ALTER TABLE \`mensajes_grupo\` DROP COLUMN \`eliminado\``);
        await queryRunner.query(`ALTER TABLE \`grupos\` DROP COLUMN \`foto_url\``);
        await queryRunner.query(`DROP TABLE \`alertas_masivas\``);
        await queryRunner.query(`DROP TABLE \`lecturas_mensaje\``);
    }

}
