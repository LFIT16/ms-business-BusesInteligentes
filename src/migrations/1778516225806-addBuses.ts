import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBuses1778516225806 implements MigrationInterface {
    name = 'AddBuses1778516225806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_f06f081193549254c548f47bed\` ON \`conductores\``);
        await queryRunner.query(`ALTER TABLE \`conductores\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`conductores\` ADD \`userId\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`conductores\` ADD UNIQUE INDEX \`IDX_f06f081193549254c548f47bed\` (\`userId\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`conductores\` DROP INDEX \`IDX_f06f081193549254c548f47bed\``);
        await queryRunner.query(`ALTER TABLE \`conductores\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`conductores\` ADD \`userId\` int NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_f06f081193549254c548f47bed\` ON \`conductores\` (\`userId\`)`);
    }

}
