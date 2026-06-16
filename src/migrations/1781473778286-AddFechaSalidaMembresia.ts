import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFechaSalidaMembresia1781473778286 implements MigrationInterface {
    name = 'AddFechaSalidaMembresia1781473778286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`membresias_grupo\` ADD \`fecha_salida\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`membresias_grupo\` CHANGE \`estado\` \`estado\` enum ('activo', 'inactivo', 'bloqueado') NOT NULL DEFAULT 'activo'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`membresias_grupo\` CHANGE \`estado\` \`estado\` enum ('activo', 'bloqueado') NOT NULL DEFAULT 'activo'`);
        await queryRunner.query(`ALTER TABLE \`membresias_grupo\` DROP COLUMN \`fecha_salida\``);
    }

}
