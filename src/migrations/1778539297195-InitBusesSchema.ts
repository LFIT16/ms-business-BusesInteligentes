import { MigrationInterface, QueryRunner } from "typeorm";

<<<<<<<< HEAD:src/migrations/1778539552771-InitBusesSchema.ts
export class InitBusesSchema1778539552771 implements MigrationInterface {
    name = 'InitBusesSchema1778539552771'
========
export class InitBusesSchema1778539297195 implements MigrationInterface {
    name = 'InitBusesSchema1778539297195'
>>>>>>>> fc2205debe2472b3aa3dce1deae8e27a8d815bda:src/migrations/1778539297195-InitBusesSchema.ts

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`buses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`placa\` varchar(255) NOT NULL, \`modelo\` varchar(255) NOT NULL, \`anio\` int NOT NULL, \`capacidadMaximaPasajeros\` int NOT NULL, \`capacidadSentados\` int NOT NULL, \`capacidadParados\` int NOT NULL, \`estado\` enum ('operativo', 'mantenimiento', 'fuera_de_servicio') NOT NULL DEFAULT 'operativo', \`fotoUrl\` longtext NULL, \`codigoQr\` varchar(255) NOT NULL, \`gpsActivo\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_e78e1b9df21315024e40a67d02\` (\`placa\`), UNIQUE INDEX \`IDX_44169503e1190c003aa77393f7\` (\`codigoQr\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`turnos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`conductorId\` int NOT NULL, \`busId\` int NOT NULL, \`horaInicio\` timestamp NOT NULL, \`horaFin\` timestamp NOT NULL, \`estadoTurno\` enum ('pendiente', 'en_curso', 'finalizado') NOT NULL DEFAULT 'pendiente', \`estadoBus\` enum ('operativo', 'mantenimiento', 'fuera_de_servicio') NULL, \`observaciones\` text NULL, \`horaRealInicio\` timestamp NULL, \`creadoEn\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`horaRealFin\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`paraderos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`latitud\` decimal(10,7) NOT NULL, \`longitud\` decimal(10,7) NOT NULL, \`clasificacion\` enum ('principal', 'secundario', 'terminal') NOT NULL DEFAULT 'secundario', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`nodos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orden\` int NOT NULL, \`ruta_id\` int NULL, \`paradero_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rutas\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`descripcion\` varchar(255) NOT NULL, \`tarifa\` decimal(10,2) NOT NULL, \`tiempoEstimadoTotal\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`direcciones\` (\`id\` int NOT NULL AUTO_INCREMENT, \`pais\` varchar(255) NOT NULL, \`ciudad\` varchar(255) NOT NULL, \`barrio\` varchar(255) NOT NULL, \`calle\` varchar(255) NOT NULL, \`numero\` varchar(255) NOT NULL, \`referencia\` varchar(255) NULL, \`codigo_postal\` varchar(255) NULL, \`ciudadano_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ciudadanos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`usuario_id\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_168b2c49c946cf96cf66ec73ff\` (\`usuario_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`metodos_pago\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tipo\` enum ('debito', 'credito', 'recargable', 'app_movil', 'efectivo') NOT NULL DEFAULT 'debito', \`nombre\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`metodos_pago_ciudadano\` (\`id\` int NOT NULL AUTO_INCREMENT, \`numero_identificacion\` varchar(255) NOT NULL, \`saldo\` decimal(12,2) NOT NULL DEFAULT '0.00', \`activo\` tinyint NOT NULL DEFAULT 1, \`ciudadano_id\` int NULL, \`metodo_pago_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`recargas\` (\`id\` int NOT NULL AUTO_INCREMENT, \`metodo_pago_ciudadano_id\` int NOT NULL, \`monto\` decimal(12,2) NOT NULL, \`comision\` decimal(12,2) NOT NULL DEFAULT '0.00', \`total_pagar\` decimal(12,2) NOT NULL DEFAULT '0.00', \`estado\` enum ('pendiente', 'aprobada', 'rechazada', 'fallida', 'reversada') NOT NULL DEFAULT 'pendiente', \`referencia_interna\` varchar(255) NOT NULL, \`referencia_epayco\` varchar(255) NULL, \`transaccion_epayco\` varchar(255) NULL, \`aplicada\` tinyint NOT NULL DEFAULT 0, \`payload_epayco\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_c1280fce4230c8859f3d713430\` (\`referencia_interna\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`conductores\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` varchar(100) NOT NULL, \`licencia\` varchar(20) NOT NULL, \`fechaVencimientoLicencia\` date NULL, \`telefono\` varchar(20) NULL, \`activo\` tinyint NOT NULL DEFAULT 1, \`creadoEn\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_f06f081193549254c548f47bed\` (\`userId\`), UNIQUE INDEX \`IDX_a01e7172ea361195be58ab5962\` (\`licencia\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
<<<<<<<< HEAD:src/migrations/1778539552771-InitBusesSchema.ts
        await queryRunner.query(`ALTER TABLE \`buses\` DROP COLUMN \`fotoUrl\``);
        await queryRunner.query(`ALTER TABLE \`buses\` ADD \`fotoUrl\` varchar(255) NULL`);
========
        await queryRunner.query(`ALTER TABLE \`buses\` DROP COLUMN \`gpsActivo\``);
        await queryRunner.query(`ALTER TABLE \`buses\` ADD \`gpsActivo\` tinyint NOT NULL DEFAULT 0`);
>>>>>>>> fc2205debe2472b3aa3dce1deae8e27a8d815bda:src/migrations/1778539297195-InitBusesSchema.ts
        await queryRunner.query(`ALTER TABLE \`turnos\` ADD CONSTRAINT \`FK_0e3c41db75e34985b4702fce8b6\` FOREIGN KEY (\`busId\`) REFERENCES \`buses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nodos\` ADD CONSTRAINT \`FK_1db8f2a7fbf11fb7562736c37df\` FOREIGN KEY (\`ruta_id\`) REFERENCES \`rutas\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nodos\` ADD CONSTRAINT \`FK_d0025d67eea6a1b5e32826b9f2c\` FOREIGN KEY (\`paradero_id\`) REFERENCES \`paraderos\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`direcciones\` ADD CONSTRAINT \`FK_7ac22ce345137644b3064e2eea7\` FOREIGN KEY (\`ciudadano_id\`) REFERENCES \`ciudadanos\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`metodos_pago_ciudadano\` ADD CONSTRAINT \`FK_6ba1a4e7e5a41ad538ea80f63f6\` FOREIGN KEY (\`ciudadano_id\`) REFERENCES \`ciudadanos\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`metodos_pago_ciudadano\` ADD CONSTRAINT \`FK_bbe14de130dc5b277a69019f33f\` FOREIGN KEY (\`metodo_pago_id\`) REFERENCES \`metodos_pago\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recargas\` ADD CONSTRAINT \`FK_c2179935c6da83d43e48137b1ea\` FOREIGN KEY (\`metodo_pago_ciudadano_id\`) REFERENCES \`metodos_pago_ciudadano\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`recargas\` DROP FOREIGN KEY \`FK_c2179935c6da83d43e48137b1ea\``);
        await queryRunner.query(`ALTER TABLE \`metodos_pago_ciudadano\` DROP FOREIGN KEY \`FK_bbe14de130dc5b277a69019f33f\``);
        await queryRunner.query(`ALTER TABLE \`metodos_pago_ciudadano\` DROP FOREIGN KEY \`FK_6ba1a4e7e5a41ad538ea80f63f6\``);
        await queryRunner.query(`ALTER TABLE \`direcciones\` DROP FOREIGN KEY \`FK_7ac22ce345137644b3064e2eea7\``);
        await queryRunner.query(`ALTER TABLE \`nodos\` DROP FOREIGN KEY \`FK_d0025d67eea6a1b5e32826b9f2c\``);
        await queryRunner.query(`ALTER TABLE \`nodos\` DROP FOREIGN KEY \`FK_1db8f2a7fbf11fb7562736c37df\``);
        await queryRunner.query(`ALTER TABLE \`turnos\` DROP FOREIGN KEY \`FK_0e3c41db75e34985b4702fce8b6\``);
<<<<<<<< HEAD:src/migrations/1778539552771-InitBusesSchema.ts
        await queryRunner.query(`ALTER TABLE \`buses\` DROP COLUMN \`fotoUrl\``);
        await queryRunner.query(`ALTER TABLE \`buses\` ADD \`fotoUrl\` longtext NULL`);
========
        await queryRunner.query(`ALTER TABLE \`buses\` DROP COLUMN \`gpsActivo\``);
        await queryRunner.query(`ALTER TABLE \`buses\` ADD \`gpsActivo\` tinyint NOT NULL DEFAULT 0`);
>>>>>>>> fc2205debe2472b3aa3dce1deae8e27a8d815bda:src/migrations/1778539297195-InitBusesSchema.ts
        await queryRunner.query(`DROP INDEX \`IDX_a01e7172ea361195be58ab5962\` ON \`conductores\``);
        await queryRunner.query(`DROP INDEX \`IDX_f06f081193549254c548f47bed\` ON \`conductores\``);
        await queryRunner.query(`DROP TABLE \`conductores\``);
        await queryRunner.query(`DROP INDEX \`IDX_c1280fce4230c8859f3d713430\` ON \`recargas\``);
        await queryRunner.query(`DROP TABLE \`recargas\``);
        await queryRunner.query(`DROP TABLE \`metodos_pago_ciudadano\``);
        await queryRunner.query(`DROP TABLE \`metodos_pago\``);
        await queryRunner.query(`DROP INDEX \`IDX_168b2c49c946cf96cf66ec73ff\` ON \`ciudadanos\``);
        await queryRunner.query(`DROP TABLE \`ciudadanos\``);
        await queryRunner.query(`DROP TABLE \`direcciones\``);
        await queryRunner.query(`DROP TABLE \`rutas\``);
        await queryRunner.query(`DROP TABLE \`nodos\``);
        await queryRunner.query(`DROP TABLE \`paraderos\``);
        await queryRunner.query(`DROP TABLE \`turnos\``);
        await queryRunner.query(`DROP INDEX \`IDX_44169503e1190c003aa77393f7\` ON \`buses\``);
        await queryRunner.query(`DROP INDEX \`IDX_e78e1b9df21315024e40a67d02\` ON \`buses\``);
        await queryRunner.query(`DROP TABLE \`buses\``);
    }

}
