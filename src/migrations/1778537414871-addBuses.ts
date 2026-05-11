import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBuses1778537414871 implements MigrationInterface {
    name = 'AddBuses1778537414871'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`turnos\` ADD \`horaRealFin\` timestamp NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`turnos\` DROP COLUMN \`horaRealFin\``);
    }

}
