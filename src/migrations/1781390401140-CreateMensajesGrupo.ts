import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMensajesGrupo1781390401140 implements MigrationInterface {
    name = 'CreateMensajesGrupo1781390401140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`mensajes_grupo\` (\`id\` int NOT NULL AUTO_INCREMENT, \`grupo_id\` int NOT NULL, \`usuario_id\` varchar(255) NOT NULL, \`nombre_usuario\` varchar(255) NOT NULL, \`contenido\` text NOT NULL, \`fecha_envio\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`mensajes_grupo\` ADD CONSTRAINT \`FK_b6d648214ed1bf25ab4c49b71df\` FOREIGN KEY (\`grupo_id\`) REFERENCES \`grupos\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mensajes_grupo\` DROP FOREIGN KEY \`FK_b6d648214ed1bf25ab4c49b71df\``);
        await queryRunner.query(`DROP TABLE \`mensajes_grupo\``);
    }

}
