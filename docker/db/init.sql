CREATE DATABASE IF NOT EXISTS camaron
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_spanish2_ci;

USE camaron;

CREATE TABLE empresas (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  tax_id VARCHAR(30) DEFAULT NULL,
  correo VARCHAR(191) DEFAULT NULL,
  telefono VARCHAR(50) DEFAULT NULL,
  direccion VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_empresas_codigo (codigo),
  KEY idx_empresas_activa (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

CREATE TABLE IF NOT EXISTS perfiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT NULL,
  es_sistema TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  menu_config_json LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_perfiles_codigo (codigo),
  KEY idx_perfiles_activo (is_active),
  CHECK (menu_config_json IS NULL OR JSON_VALID(menu_config_json))
) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci;

CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL,
  correo VARCHAR(191) NOT NULL,
  hash_contrasena VARCHAR(191) NOT NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  es_superadmin TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_usuario (usuario),
  UNIQUE KEY uq_usuarios_correo (correo),
  KEY idx_usuarios_activo (is_active)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci;

CREATE TABLE proyectos (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  empresas_id BIGINT(20) UNSIGNED NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  creador_id BIGINT(20) UNSIGNED NOT NULL,
  fecha_inicio DATE DEFAULT NULL,
  fecha_fin DATE DEFAULT NULL,
  is_archivado TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_proyectos_empresa_codigo (empresas_id, codigo),
  KEY idx_proyectos_empresa (empresas_id),
  KEY idx_proyectos_creador (creador_id),
  KEY idx_proyectos_archivo (empresas_id, is_archivado),
  CONSTRAINT fk_proyectos_empresas FOREIGN KEY (empresas_id) REFERENCES empresas (id) ON DELETE CASCADE,
  CONSTRAINT fk_proyectos_usuarios_creador FOREIGN KEY (creador_id) REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

CREATE TABLE proyectos_usuarios (
  proyectos_id BIGINT(20) UNSIGNED NOT NULL,
  usuarios_id BIGINT(20) UNSIGNED NOT NULL,
  es_propietario TINYINT(1) NOT NULL DEFAULT 0,
  puede_editar TINYINT(1) NOT NULL DEFAULT 1,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (proyectos_id, usuarios_id),
  KEY idx_proyectos_usuarios_usuario (usuarios_id),
  CONSTRAINT fk_proyectos_usuarios_proyectos FOREIGN KEY (proyectos_id) REFERENCES proyectos (id) ON DELETE CASCADE,
  CONSTRAINT fk_proyectos_usuarios_usuarios FOREIGN KEY (usuarios_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_spanish2_ci;

CREATE TABLE tareas (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  proyectos_id BIGINT(20) UNSIGNED NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  estado ENUM('pendiente', 'en_progreso', 'completada') NOT NULL DEFAULT 'pendiente',
  prioridad ENUM('baja', 'media', 'alta') NOT NULL DEFAULT 'media',
  asignado_id BIGINT(20) UNSIGNED DEFAULT NULL,
  orden_kanban INT(11) NOT NULL DEFAULT 0,
  fecha_inicio DATE DEFAULT NULL,
  fecha_vencimiento DATE DEFAULT NULL,
  is_archivada TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tareas_proyecto (proyectos_id),
  KEY idx_tareas_estado (estado),
  KEY idx_tareas_prioridad (prioridad),
  KEY idx_tareas_asignado (asignado_id),
  KEY idx_tareas_filtros (proyectos_id, estado, prioridad, asignado_id),
  CONSTRAINT fk_tareas_proyectos FOREIGN KEY (proyectos_id) REFERENCES proyectos (id) ON DELETE CASCADE,
  CONSTRAINT fk_tareas_usuarios_asignado FOREIGN KEY (asignado_id) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_spanish2_ci;

CREATE TABLE IF NOT EXISTS tokens_autenticacion (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuarios_id BIGINT UNSIGNED NOT NULL,
  jti CHAR(36) NOT NULL,
  hash_refresco CHAR(64) NOT NULL,
  agente_usuario VARCHAR(255) NULL,
  ip VARCHAR(100) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tokens_jti (jti),
  KEY idx_token_usuario_activo (usuarios_id, is_active),
  CONSTRAINT fk_tokens_usuarios FOREIGN KEY (usuarios_id) REFERENCES usuarios (id) ON DELETE CASCADE ON UPDATE RESTRICT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci;

CREATE TABLE IF NOT EXISTS usuarios_perfiles (
  usuarios_id BIGINT UNSIGNED NOT NULL,
  perfiles_id BIGINT UNSIGNED NOT NULL,
  es_principal TINYINT(1) NOT NULL DEFAULT 0,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuarios_id, perfiles_id),
  KEY idx_usuario_principal (usuarios_id, es_principal),
  CONSTRAINT fk_usuarios_perfiles_usuarios FOREIGN KEY (usuarios_id) REFERENCES usuarios (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_usuarios_perfiles_perfiles FOREIGN KEY (perfiles_id) REFERENCES perfiles (id) ON DELETE CASCADE ON UPDATE RESTRICT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci;

UPDATE perfiles
SET menu_config_json = '[
    {
        "id": 1,
        "codigo": "ADMIN",
        "nombre": "Administración",
        "icono": "",
        "ruta": "/admin",
        "orden": 100,
        "menu": [
            {
                "id": 9,
                "opcionMenuIdPadre": null,
                "codigo": "ADMIN_PERFILES",
                "etiqueta": "Perfiles",
                "ruta": "/admin/perfiles",
                "icono": "",
                "orden": 8,
                "permisos": {
                    "puedeVer": true,
                    "puedeCrear": true,
                    "puedeActualizar": true,
                    "puedeEliminar": true
                },
                "children": []
            },
            {
                "id": 23,
                "opcionMenuIdPadre": null,
                "codigo": "ADMIN_USUARIOS",
                "etiqueta": "Usuarios",
                "ruta": "/admin/usuarios",
                "icono": "",
                "orden": 10,
                "permisos": {
                    "puedeVer": true,
                    "puedeCrear": true,
                    "puedeActualizar": true,
                    "puedeEliminar": true
                },
                "children": []
            }
        ]
    },
    {
        "id": 2,
        "codigo": "PROYECTOS",
        "nombre": "Proyectos",
        "icono": "",
        "ruta": "/proyectos",
        "orden": 200,
        "menu": [
            {
                "id": 3,
                "opcionMenuIdPadre": null,
                "codigo": "PROYECTOS",
                "etiqueta": "Proyectos",
                "ruta": "/proyectos/proyectos",
                "icono": "",
                "orden": 10,
                "permisos": {
                    "puedeVer": true,
                    "puedeCrear": true,
                    "puedeActualizar": true,
                    "puedeEliminar": true
                },
                "children": []
            },
            {
                "id": 30,
                "opcionMenuIdPadre": null,
                "codigo": "TAREAS",
                "etiqueta": "Tareas",
                "ruta": "/proyectos/tareas",
                "icono": "",
                "orden": 11,
                "permisos": {
                    "puedeVer": true,
                    "puedeCrear": true,
                    "puedeActualizar": true,
                    "puedeEliminar": true
                },
                "children": []
            }
        ]
    }
]'
WHERE id > 1;
