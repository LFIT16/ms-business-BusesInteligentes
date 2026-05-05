import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCinemaSchema1778004077881 implements MigrationInterface {
    name = 'InitCinemaSchema1778004077881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`paraderos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`latitud\` decimal(10,7) NOT NULL, \`longitud\` decimal(10,7) NOT NULL, \`clasificacion\` enum ('principal', 'secundario', 'terminal') NOT NULL DEFAULT 'secundario', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`nodos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orden\` int NOT NULL, \`ruta_id\` int NULL, \`paradero_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rutas\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`descripcion\` varchar(255) NOT NULL, \`tarifa\` decimal(10,2) NOT NULL, \`tiempoEstimadoTotal\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`direcciones\` (\`id\` int NOT NULL AUTO_INCREMENT, \`pais\` varchar(255) NOT NULL, \`ciudad\` varchar(255) NOT NULL, \`barrio\` varchar(255) NOT NULL, \`calle\` varchar(255) NOT NULL, \`numero\` varchar(255) NOT NULL, \`referencia\` varchar(255) NULL, \`codigo_postal\` varchar(255) NULL, \`ciudadano_id\` int NULL, UNIQUE INDEX \`REL_7ac22ce345137644b3064e2eea\` (\`ciudadano_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ciudadanos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`usuario_id\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_168b2c49c946cf96cf66ec73ff\` (\`usuario_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`metodos_pago\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tipo\` enum ('debito', 'credito', 'recargable', 'app_movil', 'efectivo') NOT NULL DEFAULT 'debito', \`nombre\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`metodos_pago_ciudadano\` (\`id\` int NOT NULL AUTO_INCREMENT, \`numero_identificacion\` varchar(255) NOT NULL, \`activo\` tinyint NOT NULL DEFAULT 1, \`ciudadano_id\` int NULL, \`metodo_pago_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`buses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`placa\` varchar(255) NOT NULL, \`modelo\` varchar(255) NOT NULL, \`anio\` int NOT NULL, \`capacidadMaximaPasajeros\` int NOT NULL, \`capacidadSentados\` int NOT NULL, \`capacidadParados\` int NOT NULL, \`estado\` enum ('operativo', 'mantenimiento', 'fuera_de_servicio') NOT NULL DEFAULT 'operativo', \`fotoUrl\` varchar(255) NULL, \`codigoQr\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_e78e1b9df21315024e40a67d02\` (\`placa\`), UNIQUE INDEX \`IDX_44169503e1190c003aa77393f7\` (\`codigoQr\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`buses\` ADD \`disponible\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`nodos\` ADD CONSTRAINT \`FK_1db8f2a7fbf11fb7562736c37df\` FOREIGN KEY (\`ruta_id\`) REFERENCES \`rutas\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nodos\` ADD CONSTRAINT \`FK_d0025d67eea6a1b5e32826b9f2c\` FOREIGN KEY (\`paradero_id\`) REFERENCES \`paraderos\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`direcciones\` ADD CONSTRAINT \`FK_7ac22ce345137644b3064e2eea7\` FOREIGN KEY (\`ciudadano_id\`) REFERENCES \`ciudadanos\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`metodos_pago_ciudadano\` ADD CONSTRAINT \`FK_6ba1a4e7e5a41ad538ea80f63f6\` FOREIGN KEY (\`ciudadano_id\`) REFERENCES \`ciudadanos\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`metodos_pago_ciudadano\` ADD CONSTRAINT \`FK_bbe14de130dc5b277a69019f33f\` FOREIGN KEY (\`metodo_pago_id\`) REFERENCES \`metodos_pago\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`metodos_pago_ciudadano\` DROP FOREIGN KEY \`FK_bbe14de130dc5b277a69019f33f\``);
        await queryRunner.query(`ALTER TABLE \`metodos_pago_ciudadano\` DROP FOREIGN KEY \`FK_6ba1a4e7e5a41ad538ea80f63f6\``);
        await queryRunner.query(`ALTER TABLE \`direcciones\` DROP FOREIGN KEY \`FK_7ac22ce345137644b3064e2eea7\``);
        await queryRunner.query(`ALTER TABLE \`nodos\` DROP FOREIGN KEY \`FK_d0025d67eea6a1b5e32826b9f2c\``);
        await queryRunner.query(`ALTER TABLE \`nodos\` DROP FOREIGN KEY \`FK_1db8f2a7fbf11fb7562736c37df\``);
        await queryRunner.query(`ALTER TABLE \`buses\` DROP COLUMN \`disponible\``);
        await queryRunner.query(`DROP INDEX \`IDX_44169503e1190c003aa77393f7\` ON \`buses\``);
        await queryRunner.query(`DROP INDEX \`IDX_e78e1b9df21315024e40a67d02\` ON \`buses\``);
        await queryRunner.query(`DROP TABLE \`buses\``);
        await queryRunner.query(`DROP TABLE \`metodos_pago_ciudadano\``);
        await queryRunner.query(`DROP TABLE \`metodos_pago\``);
        await queryRunner.query(`DROP INDEX \`IDX_168b2c49c946cf96cf66ec73ff\` ON \`ciudadanos\``);
        await queryRunner.query(`DROP TABLE \`ciudadanos\``);
        await queryRunner.query(`DROP INDEX \`REL_7ac22ce345137644b3064e2eea\` ON \`direcciones\``);
        await queryRunner.query(`DROP TABLE \`direcciones\``);
        await queryRunner.query(`DROP TABLE \`rutas\``);
        await queryRunner.query(`DROP TABLE \`nodos\``);
        await queryRunner.query(`DROP TABLE \`paraderos\``);
    }

}
