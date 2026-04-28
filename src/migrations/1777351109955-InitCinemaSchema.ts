import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCinemaSchema1777351109955 implements MigrationInterface {
    name = 'InitCinemaSchema1777351109955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`paraderos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`latitud\` decimal(10,7) NOT NULL, \`longitud\` decimal(10,7) NOT NULL, \`clasificacion\` enum ('principal', 'secundario', 'terminal') NOT NULL DEFAULT 'secundario', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`nodos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orden\` int NOT NULL, \`rutaId\` int NULL, \`paradero_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rutas\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`descripcion\` varchar(255) NOT NULL, \`tarifa\` decimal(10,2) NOT NULL, \`tiempoEstimadoTotal\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`nodos\` ADD CONSTRAINT \`FK_f391e6cd6b657b2d43c00bead30\` FOREIGN KEY (\`rutaId\`) REFERENCES \`rutas\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nodos\` ADD CONSTRAINT \`FK_d0025d67eea6a1b5e32826b9f2c\` FOREIGN KEY (\`paradero_id\`) REFERENCES \`paraderos\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`nodos\` DROP FOREIGN KEY \`FK_d0025d67eea6a1b5e32826b9f2c\``);
        await queryRunner.query(`ALTER TABLE \`nodos\` DROP FOREIGN KEY \`FK_f391e6cd6b657b2d43c00bead30\``);
        await queryRunner.query(`DROP TABLE \`rutas\``);
        await queryRunner.query(`DROP TABLE \`nodos\``);
        await queryRunner.query(`DROP TABLE \`paraderos\``);
    }

}
