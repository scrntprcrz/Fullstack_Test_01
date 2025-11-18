# Decisiones Técnicas

## Oscar Antepara Cerezo

## 📋 Información General

-   **Nombre del Candidato**: Oscar Antepara Cerezo
-   **Fecha de Inicio**: 15-11-2025
-   **Fecha de Entrega**: 18-11-2025
-   **Tiempo Dedicado**: 50

## 🛠️ Stack Tecnológico Elegido

### Backend

| Tecnología                     | Versión aprox. | Uso principal                                                      |
| ------------------------------ | -------------- | ------------------------------------------------------------------ |
| Node.js                        | 22.14.x        | Runtime para la API REST.                                          |
| TypeScript                     | 5.9.x          | Tipado estático y mejor DX.                                        |
| Express                        | 5.1.x          | Framework minimalista para montar middlewares y routers modulares. |
| MariaDB                        | 10.4.x         | Base de datos relacional principal, compatible con MySQL.          |
| Driver mysql                   | 2.18.x         | Conexión y ejecución de queries SQL desde Node.                    |
| dotenv                         | 17.x           | Gestión de variables de entorno.                                   |
| cors                           | 2.8.x          | Configuración de CORS entre backend y frontend.                    |
| express-rate-limit             | 8.2.x          | Protección básica frente a abuso en endpoints sensibles.           |
| morgan                         | 1.10.x         | Logging HTTP de peticiones.                                        |
| bcryptjs                       | 3.0.x          | Hash y verificación de contraseñas.                                |
| jose                           | 6.1.x          | Firma y verificación de tokens JWT.                                |
| @hapi/boom                     | 10.0.x         | Construcción de errores HTTP coherentes.                           |
| zod                            | 4.1.x          | Validación de inputs y definición de esquemas.                     |
| @asteasolutions/zod-to-openapi | 8.1.x          | Generación de esquemas OpenAPI a partir de los esquemas Zod.       |
| swagger-ui-express             | 5.0.x          | Exposición interactiva de la documentación OpenAPI en el servidor. |

### Frontend

En el frontend utilicé:

-   React 18 + TypeScript para construir una SPA tipada.
-   Vite como bundler y dev server por su rapidez y simplicidad de configuración.
-   React Router DOM para el enrutado entre páginas (Login, Dashboard, Proyectos, Tareas, Usuarios, Perfiles, UserProfile).
-   SCSS modular en la carpeta styles/ para los estilos de componentes, tokens y utilidades.
-   Custom hooks (por ejemplo useAuth) para encapsular lógica de autenticación y sesión.
-   Estado global ligero en state/ (authAtoms.ts) para información como el usuario autenticado.

## 🏗️ Arquitectura

### Backend

Estructura principal:

```txt
backend/
├── src/
│   ├── auth/
│   │   ├── authRoutes.ts
│   │   ├── config.ts
│   │   ├── middleware.ts
│   │   └── tokens.ts
│   ├── core/
│   │   └── openapi.ts
│   ├── helpers/
│   │   ├── db.ts
│   │   ├── httpLogger.ts
│   │   └── routeHelper.ts
│   ├── modules/
│   │   ├── dashboard/
│   │   ├── empresas/
│   │   ├── perfiles/
│   │   ├── proyectos/
│   │   │   ├── proyectos.docs.ts
│   │   │   ├── proyectos.routes.ts
│   │   │   ├── proyectos.schemas.ts
│   │   │   └── proyectos.service.ts
│   │   ├── tareas/
│   │   └── usuarios/
│   ├── types/
│   │   └── express.d.ts
│   ├── apiRouter.ts
│   ├── devRoutes.ts
│   └── index.ts
```

Decisiones clave:

-   Organización por módulos de dominio (dashboard, empresas, perfiles, proyectos, tareas, usuarios). Cada módulo agrupa sus rutas, servicios y esquemas de validación.
-   La carpeta auth/ concentra autenticación y JWT como preocupación transversal.
-   core/openapi.ts centraliza la configuración de OpenAPI/Swagger a partir de los esquemas Zod de los módulos.
-   En el módulo de proyectos, proyectos.docs.ts define la documentación OpenAPI del recurso a partir de los esquemas zod de proyectos.schemas.ts.
-   helpers/ reúne utilidades reutilizables:
    -   db.ts: conexión y ejecución de queries.
    -   httpLogger.ts: integración de morgan.
    -   routeHelper.ts: helpers para estandarizar respuestas y manejo de errores.
-   apiRouter.ts registra todos los routers de los módulos en un solo sitio.
-   index.ts es el punto de entrada del servidor: inicializa Express, middlewares globales, CORS, logger, documentación OpenAPI y arranque del servidor.

### Frontend

Estructura principal:

```txt
frontend/
├── src/
│   ├── api/
│   │   └── http.ts
│   ├── assets/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── perfiles/
│   │   ├── proyectos/
│   │   │   ├── DeleteProyectoDialog.tsx
│   │   │   ├── ProyectoColaboradoresModal.tsx
│   │   │   ├── ProyectoFormModal.tsx
│   │   │   └── ProyectosTable.tsx
│   │   ├── tareas/
│   │   ├── user/
│   │   └── usuarios/
│   │       ├── ListFilterBar.tsx
│   │       └── ProtectedRoute.tsx
│   ├── domain/
│   │   ├── dashboard.ts
│   │   ├── perfiles.ts
│   │   ├── proyectos.ts
│   │   ├── tareas.ts
│   │   └── usuarios.ts
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── layout/
│   │   └── AppLayout.tsx
│   ├── lib/
│   │   └── kanbanDnd.ts
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── PerfilesPage.tsx
│   │   ├── ProyectosPage.tsx
│   │   ├── TareasPage.tsx
│   │   ├── UserProfilePage.tsx
│   │   └── UsuariosPage.tsx
│   ├── state/
│   │   └── authAtoms.ts
│   ├── styles/
│   │   ├── _components.scss
│   │   ├── _tokens.scss
│   │   ├── _utilities.scss
│   │   └── index.scss
│   ├── App.tsx
│   └── main.tsx
```

Decisiones clave:

-   pages/ contiene las vistas conectadas al router.
-   components/ almacena componentes UI reutilizables por dominio (dashboard, perfiles, proyectos, tareas, usuarios).
-   api/http.ts encapsula la configuración del cliente HTTP (baseURL, interceptores, headers de autenticación, etc.).
-   domain/ modela entidades de negocio reutilizadas en varias partes (por ejemplo, tipos de tareas, proyectos, usuarios).
-   hooks/ guarda lógica reutilizable; useAuth encapsula login, logout, almacenamiento de tokens y usuario actual.
-   layout/AppLayout.tsx define el layout principal con sidebar, cabecera y contenido.
-   lib/kanbanDnd.ts concentra la lógica de drag & drop de tareas del tablero kanban.
-   state/authAtoms.ts centraliza el estado global de autenticación.
-   styles/ contiene SCSS modular para componentes, tokens de diseño y utilidades.

## 🗄️ Diseño de Base de Datos

### Elección

-   Base de datos relacional MariaDB con el esquema camaron.
-   Charset y collation: utf8mb4 / utf8mb4_spanish2_ci para soportar caracteres y ordenación en español.

### Tablas principales

-   empresas
-   perfiles
-   usuarios
-   proyectos
-   proyectos_usuarios
-   tareas
-   tokens_autenticacion
-   usuarios_perfiles

Descripción breve de cada tabla:

-   empresas: datos de la organización (código, nombre, tax_id, contacto, activa/no activa).
-   perfiles: roles y configuración de permisos y menú (incluye menu_config_json).
-   usuarios: credenciales y datos básicos de usuario, flags de superadmin y activo.
-   proyectos: proyectos por empresa, con creador, fechas, archivado, etc.
-   proyectos_usuarios: relación N:M entre proyectos y usuarios, con flags de propietario/puede_editar.
-   tareas: tareas ligadas a proyectos con estado, prioridad, asignado, orden_kanban, fechas y archivado.
-   tokens_autenticacion: gestión de tokens de refresco, expiraciones, IP, agente de usuario y revocaciones.
-   usuarios_perfiles: relación N:M entre usuarios y perfiles, con perfil principal opcional.

## 🔐 Seguridad

### Backend

-   Hash de contraseñas con bcryptjs antes de almacenarlas y comparación en login.
-   JWT con jose para firmar y verificar tokens de acceso.
-   Gestión de refresh tokens en la tabla tokens_autenticacion con campos de expiración, estado activo y revocación.
-   Validación de inputs con zod en los esquemas de los módulos (por ejemplo usuarios.schemas.ts y proyectos.schemas.ts).
-   Manejo de errores coherente con @hapi/boom.
-   Configuración de CORS con cors permitiendo el origen del frontend en producción.
-   Rate limiting con express-rate-limit en endpoints sensibles como login.
-   Logging HTTP con morgan a través de httpLogger.ts.

### Consideraciones adicionales

-   Se limita la información en mensajes de error de autenticación.
-   Se registran timestamps relevantes para auditoría.
-   Mejora futura: añadir helmet y revisar CSRF si se migrara a cookies en lugar de tokens en headers.

## 📘 OpenAPI y documentación de la API

-   Uso @asteasolutions/zod-to-openapi para generar automáticamente componentes y schemas OpenAPI a partir de los esquemas zod ya definidos en los módulos.
-   core/openapi.ts construye el documento OpenAPI combinando la información de cada módulo (por ejemplo proyectos.docs.ts) y registra la ruta de la documentación.
-   swagger-ui-express monta una interfaz web que permite explorar la API, ver los modelos y probar peticiones directamente desde el navegador.
-   En el módulo de proyectos, proyectos.docs.ts describe las operaciones (listar, crear, actualizar, archivar proyectos, etc.) reutilizando los tipos ya definidos en proyectos.schemas.ts. La idea es que cada módulo pueda exponer su documentación sin duplicar lógica.

## 🎨 Decisiones de UI/UX

-   SCSS modular en styles/ para diseño responsive con layout de sidebar + contenido principal.
-   El login redirige al Dashboard cuando el usuario se autentica.
-   El Dashboard muestra una vista de alto nivel de información de proyectos y tareas.
-   Páginas de Proyectos, Tareas, Usuarios y Perfiles con patrón consistente de listados y acciones CRUD (diálogos modales para crear/editar y componentes de tabla).
-   Vista de Tareas con tablero tipo kanban usando la lógica de lib/kanbanDnd.ts para drag & drop.
-   useAuth centraliza la lógica de autenticación y la sesión del usuario.
-   ProtectedRoute.tsx protege rutas que requieren sesión, redirigiendo a login cuando no hay token válido.
-   Estados de carga y error gestionados en las páginas y componentes con mensajes y elementos visuales.

## 🧪 Testing

En esta versión no hay testing automatizado implementado.

## 🐳 Docker

-   Servicio db con imagen mariadb:10.4.28, puerto 3306, volumen persistente db_data y carga automática de ./docker/db/init.sql.
-   Servicio backend con imagen node:22.14.0, montaje de ./backend, uso de .env, conexión a la base de datos db y comando npm install && npm run dev en puerto 3000.
-   Servicio frontend con imagen node:22.14.0, montaje de ./frontend y comando npm install && npm run dev -- --host 0.0.0.0 --port 5173 en puerto 5173.
-   docker-compose.yml define dependencias entre servicios y el volumen db_data para la base de datos.

## ⚡ Optimizaciones

### Backend

-   Índices en campos clave para filtros frecuentes (activos, relaciones, filtros de kanban).
-   Helper de DB para centralizar la conexión y ejecución de queries.
-   Uso de express.Router y apiRouter.ts para mantener el enrutado por módulos de dominio.
-   Reutilización de esquemas zod entre validación y documentación (vía zod-to-openapi).

### Frontend

-   Vite reduce tiempos de recarga y build.
-   Lógica de drag & drop aislada en lib/kanbanDnd.ts.
-   Reutilización de layout y componentes entre páginas.
-   Estado global mínimo con authAtoms.ts y hooks personalizados para lógica compartida.

## 🚧 Desafíos y Soluciones

-   Modelado del dominio sin ORM: se resolvió con un buen diseño SQL y un helper de DB para queries.
-   Sincronización entre backend y frontend: tipos de dominio compartidos y validación con zod.
-   Implementación del tablero Kanban: encapsular lógica de DnD en lib/kanbanDnd.ts para mantener componentes limpios.
-   Documentación de la API sin duplicar lógica: reutilizar los mismos esquemas zod para validación y para generar OpenAPI con zod-to-openapi.

## 🎯 Trade-offs

-   ORM vs SQL manual: se eligió SQL manual para tener más control y menos dependencias, a costa de más trabajo en queries y migraciones.
-   Features vs testing automatizado: se priorizaron funcionalidades visibles (auth, CRUDs, kanban, dashboard, documentación OpenAPI) y se dejó el testing automatizado para una siguiente fase.

## 🔮 Mejoras Futuras

1. Añadir Jest para backend y Vitest + React Testing Library para frontend.
2. Integrar helmet y revisar CSRF si se usaran cookies.
3. Afinar expiraciones y rotación de tokens de refresco.
4. Añadir una capa de migraciones versionadas para la base de datos.
5. Pulir accesibilidad y transiciones en la UI.
6. Añadir pruebas automatizadas que verifiquen también la consistencia entre OpenAPI y las respuestas reales de la API.

## 📚 Recursos Consultados

-   Documentación oficial de Node.js, Express y MariaDB/MySQL.
-   Documentación de zod, @asteasolutions/zod-to-openapi, swagger-ui-express, bcryptjs, jose, cors, express-rate-limit, morgan.
-   Documentación de React, React Router y Vite.
-   Artículos y foros técnicos para detalles de configuración.

## 🤔 Reflexión Final

-   El diseño de la base de datos y la separación por módulos en el backend ayudan a mantener el proyecto ordenado.
-   La estructura del frontend basada en páginas, layout y hooks facilita la lectura y el mantenimiento.
-   El tablero kanban aporta una vista clara del estado del trabajo.
-   La integración de OpenAPI a partir de los esquemas zod evita duplicar contratos y mejora la DX.
-   Como mejoras futuras, es clave incorporar testing automatizado, reforzar la seguridad y añadir migraciones para la base de datos.

**Fecha de última actualización**: 18-11-2025
