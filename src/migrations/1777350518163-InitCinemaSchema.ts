import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCinemaSchema1777350518163 implements MigrationInterface {
    name = 'InitCinemaSchema1777350518163'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`nodos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orden\` int NOT NULL, \`rutaId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rutas\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`descripcion\` varchar(255) NOT NULL, \`tarifa\` decimal(10,2) NOT NULL, \`tiempoEstimadoTotal\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`nodos\` ADD CONSTRAINT \`FK_f391e6cd6b657b2d43c00bead30\` FOREIGN KEY (\`rutaId\`) REFERENCES \`rutas\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`nodos\` DROP FOREIGN KEY \`FK_f391e6cd6b657b2d43c00bead30\``);
        await queryRunner.query(`DROP TABLE \`rutas\``);
        await queryRunner.query(`DROP TABLE \`nodos\``);
    }

}
