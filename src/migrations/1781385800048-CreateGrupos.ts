import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGrupos1781385800048 implements MigrationInterface {
    name = 'CreateGrupos1781385800048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`grupos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(100) NOT NULL, \`descripcion\` text NULL, \`esPublico\` tinyint NOT NULL DEFAULT 1, \`creador_usuario_id\` varchar(255) NOT NULL, \`activo\` tinyint NOT NULL DEFAULT 1, \`fecha_creacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fecha_actualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`membresias_grupo\` (\`id\` int NOT NULL AUTO_INCREMENT, \`grupo_id\` int NOT NULL, \`usuario_id\` varchar(255) NOT NULL, \`rol\` enum ('miembro', 'administrador') NOT NULL DEFAULT 'miembro', \`estado\` enum ('activo', 'bloqueado') NOT NULL DEFAULT 'activo', \`fecha_union\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`logs_membresia_grupo\` (\`id\` int NOT NULL AUTO_INCREMENT, \`grupo_id\` int NOT NULL, \`usuario_afectado_id\` varchar(255) NOT NULL, \`usuario_actor_id\` varchar(255) NULL, \`accion\` enum ('union', 'salida', 'promovido', 'removido', 'bloqueado') NOT NULL, \`fecha_accion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`membresias_grupo\` ADD CONSTRAINT \`FK_ee463427dd3a4ceddc20ae0ab68\` FOREIGN KEY (\`grupo_id\`) REFERENCES \`grupos\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`membresias_grupo\` DROP FOREIGN KEY \`FK_ee463427dd3a4ceddc20ae0ab68\``);
        await queryRunner.query(`DROP TABLE \`logs_membresia_grupo\``);
        await queryRunner.query(`DROP TABLE \`membresias_grupo\``);
        await queryRunner.query(`DROP TABLE \`grupos\``);
    }

}
