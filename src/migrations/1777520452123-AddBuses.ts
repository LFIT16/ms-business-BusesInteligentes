import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBuses1777520452123 implements MigrationInterface {
    name = 'AddBuses1777520452123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`buses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`placa\` varchar(255) NOT NULL, \`modelo\` varchar(255) NOT NULL, \`anio\` int NOT NULL, \`capacidadMaximaPasajeros\` int NOT NULL, \`capacidadSentados\` int NOT NULL, \`capacidadParados\` int NOT NULL, \`estado\` enum ('operativo', 'mantenimiento', 'fuera_de_servicio') NOT NULL DEFAULT 'operativo', \`fotoUrl\` varchar(255) NULL, \`codigoQr\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_e78e1b9df21315024e40a67d02\` (\`placa\`), UNIQUE INDEX \`IDX_44169503e1190c003aa77393f7\` (\`codigoQr\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`nodos\` ADD \`paradero_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`nodos\` ADD CONSTRAINT \`FK_d0025d67eea6a1b5e32826b9f2c\` FOREIGN KEY (\`paradero_id\`) REFERENCES \`paraderos\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`nodos\` DROP FOREIGN KEY \`FK_d0025d67eea6a1b5e32826b9f2c\``);
        await queryRunner.query(`ALTER TABLE \`nodos\` DROP COLUMN \`paradero_id\``);
        await queryRunner.query(`DROP INDEX \`IDX_44169503e1190c003aa77393f7\` ON \`buses\``);
        await queryRunner.query(`DROP INDEX \`IDX_e78e1b9df21315024e40a67d02\` ON \`buses\``);
        await queryRunner.query(`DROP TABLE \`buses\``);
    }

}
