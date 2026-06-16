-- ============================================================
-- Migración: Módulo de Grupos
-- Tablas: grupos, membresias_grupo, logs_membresia_grupo
-- ============================================================

CREATE TABLE IF NOT EXISTS `grupos` (
  `id`                    INT          NOT NULL AUTO_INCREMENT,
  `nombre`                VARCHAR(100) NOT NULL,
  `descripcion`           TEXT         NULL,
  `es_publico`            TINYINT(1)   NOT NULL DEFAULT 1,
  `creador_usuario_id`    VARCHAR(255) NOT NULL,
  `activo`                TINYINT(1)   NOT NULL DEFAULT 1,
  `fecha_creacion`        DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `fecha_actualizacion`   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `membresias_grupo` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `grupo_id`    INT          NOT NULL,
  `usuario_id`  VARCHAR(255) NOT NULL,
  `rol`         ENUM('miembro','administrador') NOT NULL DEFAULT 'miembro',
  `estado`      ENUM('activo','bloqueado')      NOT NULL DEFAULT 'activo',
  `fecha_union` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_membresia` (`grupo_id`, `usuario_id`),
  CONSTRAINT `fk_membresia_grupo`
    FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `logs_membresia_grupo` (
  `id`                    INT          NOT NULL AUTO_INCREMENT,
  `grupo_id`              INT          NOT NULL,
  `usuario_afectado_id`   VARCHAR(255) NOT NULL,
  `usuario_actor_id`      VARCHAR(255) NULL,
  `accion`                ENUM('union','salida','promovido','removido','bloqueado') NOT NULL,
  `fecha_accion`          DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
