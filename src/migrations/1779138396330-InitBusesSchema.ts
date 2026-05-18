import { MigrationInterface, QueryRunner } from "typeorm";

export class InitBusesSchema1779138396330 implements MigrationInterface {
    name = 'InitBusesSchema1779138396330'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`fotos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`urlFoto\` longtext NULL, \`descripcion\` varchar(255) NULL, \`incidente_bus_id\` int NOT NULL, \`fecha_registro\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`incidentes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tipo\` enum ('mecanico', 'accidente', 'retraso', 'otro') NOT NULL, \`gravedad\` enum ('bajo', 'medio', 'alto', 'critico') NOT NULL, \`descripcion\` text NULL, \`conductorId\` int NULL, \`turnoId\` int NULL, \`gpsId\` int NULL, \`latitud\` decimal(10,7) NULL, \`longitud\` decimal(10,7) NULL, \`fechaGps\` timestamp NULL, \`estado\` enum ('pendiente', 'en_revision', 'resuelto') NOT NULL DEFAULT 'pendiente', \`comentario\` text NULL, \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`incidentes_bus\` (\`id\` int NOT NULL AUTO_INCREMENT, \`incidente_id\` int NOT NULL, \`bus_id\` int NOT NULL, \`fecha_registro\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`gps\` (\`id\` int NOT NULL AUTO_INCREMENT, \`codigo\` varchar(255) NOT NULL, \`busId\` int NOT NULL, \`latitud\` decimal(10,7) NULL, \`longitud\` decimal(10,7) NULL, \`velocidad\` decimal(6,2) NULL, \`rumbo\` decimal(6,2) NULL, \`ultimaActualizacion\` timestamp NULL, \`activo\` tinyint NOT NULL DEFAULT 1, \`creadoEn\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`actualizadoEn\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_b653b69faba19abd7fc40cfded\` (\`codigo\`), UNIQUE INDEX \`IDX_3ee73b40fa14ab3a700b131318\` (\`busId\`), UNIQUE INDEX \`REL_3ee73b40fa14ab3a700b131318\` (\`busId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`buses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`placa\` varchar(255) NOT NULL, \`modelo\` varchar(255) NOT NULL, \`anio\` int NOT NULL, \`capacidadMaximaPasajeros\` int NOT NULL, \`capacidadSentados\` int NOT NULL, \`capacidadParados\` int NOT NULL, \`estado\` enum ('operativo', 'mantenimiento', 'fuera_de_servicio') NOT NULL DEFAULT 'operativo', \`fotoUrl\` longtext NULL, \`codigoQr\` varchar(255) NOT NULL, \`gpsActivo\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_e78e1b9df21315024e40a67d02\` (\`placa\`), UNIQUE INDEX \`IDX_44169503e1190c003aa77393f7\` (\`codigoQr\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`conductores\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` varchar(100) NOT NULL, \`licencia\` varchar(20) NOT NULL, \`fechaVencimientoLicencia\` date NULL, \`telefono\` varchar(20) NULL, \`activo\` tinyint NOT NULL DEFAULT 1, \`creadoEn\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_f06f081193549254c548f47bed\` (\`userId\`), UNIQUE INDEX \`IDX_a01e7172ea361195be58ab5962\` (\`licencia\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`turnos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`conductorId\` int NOT NULL, \`busId\` int NOT NULL, \`horaInicio\` timestamp NOT NULL, \`horaFin\` timestamp NOT NULL, \`estadoTurno\` enum ('pendiente', 'en_curso', 'finalizado') NOT NULL DEFAULT 'pendiente', \`estadoBus\` enum ('operativo', 'mantenimiento', 'fuera_de_servicio') NULL, \`observaciones\` text NULL, \`horaRealInicio\` timestamp NULL, \`creadoEn\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`horaRealFin\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`paraderos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`latitud\` decimal(10,7) NOT NULL, \`longitud\` decimal(10,7) NOT NULL, \`clasificacion\` enum ('principal', 'secundario', 'terminal') NOT NULL DEFAULT 'secundario', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`direcciones\` (\`id\` int NOT NULL AUTO_INCREMENT, \`pais\` varchar(255) NOT NULL, \`ciudad\` varchar(255) NOT NULL, \`barrio\` varchar(255) NOT NULL, \`calle\` varchar(255) NOT NULL, \`numero\` varchar(255) NOT NULL, \`referencia\` varchar(255) NULL, \`codigo_postal\` varchar(255) NULL, \`ciudadano_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`metodos_pago\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tipo\` enum ('debito', 'credito', 'recargable', 'app_movil', 'efectivo') NOT NULL DEFAULT 'debito', \`nombre\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`recargas\` (\`id\` int NOT NULL AUTO_INCREMENT, \`metodo_pago_ciudadano_id\` int NOT NULL, \`monto\` decimal(12,2) NOT NULL, \`comision\` decimal(12,2) NOT NULL DEFAULT '0.00', \`total_pagar\` decimal(12,2) NOT NULL DEFAULT '0.00', \`estado\` enum ('pendiente', 'aprobada', 'rechazada', 'fallida', 'reversada') NOT NULL DEFAULT 'pendiente', \`referencia_interna\` varchar(255) NOT NULL, \`referencia_epayco\` varchar(255) NULL, \`transaccion_epayco\` varchar(255) NULL, \`aplicada\` tinyint NOT NULL DEFAULT 0, \`payload_epayco\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_c1280fce4230c8859f3d713430\` (\`referencia_interna\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`metodos_pago_ciudadano\` (\`id\` int NOT NULL AUTO_INCREMENT, \`numero_identificacion\` varchar(255) NOT NULL, \`saldo\` decimal(12,2) NOT NULL DEFAULT '0.00', \`activo\` tinyint NOT NULL DEFAULT 1, \`ciudadano_id\` int NULL, \`metodo_pago_id\` int NULL, UNIQUE INDEX \`IDX_7658bace57c261d48709a4941f\` (\`numero_identificacion\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ciudadanos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`usuario_id\` varchar(255) NOT NULL, \`fechaNacimiento\` date NULL, UNIQUE INDEX \`IDX_168b2c49c946cf96cf66ec73ff\` (\`usuario_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`programaciones_ruta\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rutaId\` int NOT NULL, \`busId\` int NOT NULL, \`fechaSalida\` date NOT NULL, \`horaSalida\` time NOT NULL, \`recurrencia\` enum ('ninguna', 'lunes_viernes', 'fines_semana', 'diaria') NOT NULL DEFAULT 'ninguna', \`toleranciaSalida\` int NOT NULL DEFAULT '5', \`estado\` enum ('programado', 'en_curso', 'finalizado', 'cancelado') NOT NULL DEFAULT 'programado', \`creadoEn\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`boletos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`ciudadanoId\` int NOT NULL, \`programacionRutaId\` int NOT NULL, \`metodoPagoCiudadanoId\` int NOT NULL, \`paraderoAbordajeId\` int NOT NULL, \`paraderoDescensoId\` int NULL, \`montoTarifa\` decimal(10,2) NOT NULL, \`saldoRestante\` decimal(12,2) NULL, \`timestampAbordaje\` timestamp NOT NULL, \`timestampDescenso\` timestamp NULL, \`estado\` enum ('activo', 'completado', 'cancelado') NOT NULL DEFAULT 'activo', \`creadoEn\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`historial\` (\`id\` int NOT NULL AUTO_INCREMENT, \`boleto_id\` int NOT NULL, \`nodo_id\` int NOT NULL, \`tipo\` enum ('abordaje', 'descenso') NOT NULL, \`fecha_validacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`nodos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orden\` int NOT NULL, \`ruta_id\` int NULL, \`paradero_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rutas\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`descripcion\` varchar(255) NOT NULL, \`tarifa\` decimal(10,2) NOT NULL, \`tiempoEstimadoTotal\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`fotos\` ADD CONSTRAINT \`FK_ff62ea628675c35a75cf5c65ea4\` FOREIGN KEY (\`incidente_bus_id\`) REFERENCES \`incidentes_bus\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`incidentes_bus\` ADD CONSTRAINT \`FK_fac3540249f468db91db5f34cc3\` FOREIGN KEY (\`incidente_id\`) REFERENCES \`incidentes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`incidentes_bus\` ADD CONSTRAINT \`FK_0a803fc3333c4201abde7e6b071\` FOREIGN KEY (\`bus_id\`) REFERENCES \`buses\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gps\` ADD CONSTRAINT \`FK_3ee73b40fa14ab3a700b1313189\` FOREIGN KEY (\`busId\`) REFERENCES \`buses\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`turnos\` ADD CONSTRAINT \`FK_e7ad1abc628275405b19e67268b\` FOREIGN KEY (\`conductorId\`) REFERENCES \`conductores\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`turnos\` ADD CONSTRAINT \`FK_0e3c41db75e34985b4702fce8b6\` FOREIGN KEY (\`busId\`) REFERENCES \`buses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`direcciones\` ADD CONSTRAINT \`FK_7ac22ce345137644b3064e2eea7\` FOREIGN KEY (\`ciudadano_id\`) REFERENCES \`ciudadanos\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recargas\` ADD CONSTRAINT \`FK_c2179935c6da83d43e48137b1ea\` FOREIGN KEY (\`metodo_pago_ciudadano_id\`) REFERENCES \`metodos_pago_ciudadano\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`metodos_pago_ciudadano\` ADD CONSTRAINT \`FK_6ba1a4e7e5a41ad538ea80f63f6\` FOREIGN KEY (\`ciudadano_id\`) REFERENCES \`ciudadanos\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`metodos_pago_ciudadano\` ADD CONSTRAINT \`FK_bbe14de130dc5b277a69019f33f\` FOREIGN KEY (\`metodo_pago_id\`) REFERENCES \`metodos_pago\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`programaciones_ruta\` ADD CONSTRAINT \`FK_6576c91d3c5198864f64c9a9556\` FOREIGN KEY (\`rutaId\`) REFERENCES \`rutas\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`programaciones_ruta\` ADD CONSTRAINT \`FK_bdaff234636888e7aa54c2137c5\` FOREIGN KEY (\`busId\`) REFERENCES \`buses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`boletos\` ADD CONSTRAINT \`FK_ab53d73fc2b02e099e23171a09f\` FOREIGN KEY (\`ciudadanoId\`) REFERENCES \`ciudadanos\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`boletos\` ADD CONSTRAINT \`FK_397144d322e00220bc15903f470\` FOREIGN KEY (\`programacionRutaId\`) REFERENCES \`programaciones_ruta\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`boletos\` ADD CONSTRAINT \`FK_9876e17260b5ec3353ff9489e3f\` FOREIGN KEY (\`metodoPagoCiudadanoId\`) REFERENCES \`metodos_pago_ciudadano\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`boletos\` ADD CONSTRAINT \`FK_43d9d1f619ca23fb6b69cbef055\` FOREIGN KEY (\`paraderoAbordajeId\`) REFERENCES \`paraderos\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`boletos\` ADD CONSTRAINT \`FK_d3debf3aa7646799e5a335fc6f7\` FOREIGN KEY (\`paraderoDescensoId\`) REFERENCES \`paraderos\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`historial\` ADD CONSTRAINT \`FK_50bd5f52ae58b1b2efc83d5f834\` FOREIGN KEY (\`boleto_id\`) REFERENCES \`boletos\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`historial\` ADD CONSTRAINT \`FK_8446406529abcce9f6305caf724\` FOREIGN KEY (\`nodo_id\`) REFERENCES \`nodos\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nodos\` ADD CONSTRAINT \`FK_1db8f2a7fbf11fb7562736c37df\` FOREIGN KEY (\`ruta_id\`) REFERENCES \`rutas\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nodos\` ADD CONSTRAINT \`FK_d0025d67eea6a1b5e32826b9f2c\` FOREIGN KEY (\`paradero_id\`) REFERENCES \`paraderos\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`nodos\` DROP FOREIGN KEY \`FK_d0025d67eea6a1b5e32826b9f2c\``);
        await queryRunner.query(`ALTER TABLE \`nodos\` DROP FOREIGN KEY \`FK_1db8f2a7fbf11fb7562736c37df\``);
        await queryRunner.query(`ALTER TABLE \`historial\` DROP FOREIGN KEY \`FK_8446406529abcce9f6305caf724\``);
        await queryRunner.query(`ALTER TABLE \`historial\` DROP FOREIGN KEY \`FK_50bd5f52ae58b1b2efc83d5f834\``);
        await queryRunner.query(`ALTER TABLE \`boletos\` DROP FOREIGN KEY \`FK_d3debf3aa7646799e5a335fc6f7\``);
        await queryRunner.query(`ALTER TABLE \`boletos\` DROP FOREIGN KEY \`FK_43d9d1f619ca23fb6b69cbef055\``);
        await queryRunner.query(`ALTER TABLE \`boletos\` DROP FOREIGN KEY \`FK_9876e17260b5ec3353ff9489e3f\``);
        await queryRunner.query(`ALTER TABLE \`boletos\` DROP FOREIGN KEY \`FK_397144d322e00220bc15903f470\``);
        await queryRunner.query(`ALTER TABLE \`boletos\` DROP FOREIGN KEY \`FK_ab53d73fc2b02e099e23171a09f\``);
        await queryRunner.query(`ALTER TABLE \`programaciones_ruta\` DROP FOREIGN KEY \`FK_bdaff234636888e7aa54c2137c5\``);
        await queryRunner.query(`ALTER TABLE \`programaciones_ruta\` DROP FOREIGN KEY \`FK_6576c91d3c5198864f64c9a9556\``);
        await queryRunner.query(`ALTER TABLE \`metodos_pago_ciudadano\` DROP FOREIGN KEY \`FK_bbe14de130dc5b277a69019f33f\``);
        await queryRunner.query(`ALTER TABLE \`metodos_pago_ciudadano\` DROP FOREIGN KEY \`FK_6ba1a4e7e5a41ad538ea80f63f6\``);
        await queryRunner.query(`ALTER TABLE \`recargas\` DROP FOREIGN KEY \`FK_c2179935c6da83d43e48137b1ea\``);
        await queryRunner.query(`ALTER TABLE \`direcciones\` DROP FOREIGN KEY \`FK_7ac22ce345137644b3064e2eea7\``);
        await queryRunner.query(`ALTER TABLE \`turnos\` DROP FOREIGN KEY \`FK_0e3c41db75e34985b4702fce8b6\``);
        await queryRunner.query(`ALTER TABLE \`turnos\` DROP FOREIGN KEY \`FK_e7ad1abc628275405b19e67268b\``);
        await queryRunner.query(`ALTER TABLE \`gps\` DROP FOREIGN KEY \`FK_3ee73b40fa14ab3a700b1313189\``);
        await queryRunner.query(`ALTER TABLE \`incidentes_bus\` DROP FOREIGN KEY \`FK_0a803fc3333c4201abde7e6b071\``);
        await queryRunner.query(`ALTER TABLE \`incidentes_bus\` DROP FOREIGN KEY \`FK_fac3540249f468db91db5f34cc3\``);
        await queryRunner.query(`ALTER TABLE \`fotos\` DROP FOREIGN KEY \`FK_ff62ea628675c35a75cf5c65ea4\``);
        await queryRunner.query(`DROP TABLE \`rutas\``);
        await queryRunner.query(`DROP TABLE \`nodos\``);
        await queryRunner.query(`DROP TABLE \`historial\``);
        await queryRunner.query(`DROP TABLE \`boletos\``);
        await queryRunner.query(`DROP TABLE \`programaciones_ruta\``);
        await queryRunner.query(`DROP INDEX \`IDX_168b2c49c946cf96cf66ec73ff\` ON \`ciudadanos\``);
        await queryRunner.query(`DROP TABLE \`ciudadanos\``);
        await queryRunner.query(`DROP INDEX \`IDX_7658bace57c261d48709a4941f\` ON \`metodos_pago_ciudadano\``);
        await queryRunner.query(`DROP TABLE \`metodos_pago_ciudadano\``);
        await queryRunner.query(`DROP INDEX \`IDX_c1280fce4230c8859f3d713430\` ON \`recargas\``);
        await queryRunner.query(`DROP TABLE \`recargas\``);
        await queryRunner.query(`DROP TABLE \`metodos_pago\``);
        await queryRunner.query(`DROP TABLE \`direcciones\``);
        await queryRunner.query(`DROP TABLE \`paraderos\``);
        await queryRunner.query(`DROP TABLE \`turnos\``);
        await queryRunner.query(`DROP INDEX \`IDX_a01e7172ea361195be58ab5962\` ON \`conductores\``);
        await queryRunner.query(`DROP INDEX \`IDX_f06f081193549254c548f47bed\` ON \`conductores\``);
        await queryRunner.query(`DROP TABLE \`conductores\``);
        await queryRunner.query(`DROP INDEX \`IDX_44169503e1190c003aa77393f7\` ON \`buses\``);
        await queryRunner.query(`DROP INDEX \`IDX_e78e1b9df21315024e40a67d02\` ON \`buses\``);
        await queryRunner.query(`DROP TABLE \`buses\``);
        await queryRunner.query(`DROP INDEX \`REL_3ee73b40fa14ab3a700b131318\` ON \`gps\``);
        await queryRunner.query(`DROP INDEX \`IDX_3ee73b40fa14ab3a700b131318\` ON \`gps\``);
        await queryRunner.query(`DROP INDEX \`IDX_b653b69faba19abd7fc40cfded\` ON \`gps\``);
        await queryRunner.query(`DROP TABLE \`gps\``);
        await queryRunner.query(`DROP TABLE \`incidentes_bus\``);
        await queryRunner.query(`DROP TABLE \`incidentes\``);
        await queryRunner.query(`DROP TABLE \`fotos\``);
    }

}
