# Prueba Técnica - Fullstack Developer (Node.js + React)

¡Bienvenido(a) a la prueba técnica para el puesto de **Desarrollador Fullstack**!

Esta prueba evaluará tus habilidades en el desarrollo de aplicaciones full-stack modernas utilizando **Node.js**, **Express**, **React**, y bases de datos. Tendrás **48 horas** para completar el desafío.

---

## 📋 Descripción del Proyecto

Desarrollarás una **plataforma de gestión de proyectos y tareas colaborativa** donde los usuarios pueden:

-   Registrarse e iniciar sesión de forma segura
-   Crear y gestionar proyectos
-   Asignar tareas a diferentes proyectos
-   Colaborar con otros usuarios en proyectos compartidos
-   Filtrar, buscar y ordenar tareas por diferentes criterios
-   Ver estadísticas básicas de sus proyectos

---

## 🛠️ Stack Tecnológico Requerido

### Backend

-   **Runtime**: Node.js (v18 o superior)
-   **Framework**: Express.js
-   **Lenguaje**: TypeScript
-   **Base de Datos**: MySQL **o** MongoDB (elige una)
-   **Autenticación**: JWT (JSON Web Tokens)
-   **Documentación API**: Swagger/OpenAPI

### Frontend

-   **Framework**: React (v18 o superior)
-   **Lenguaje**: TypeScript
-   **Routing**: React Router v6
-   **Estilos**: TailwindCSS (preferencia)

### DevOps (Opcional)

-   **Containerización**: Docker + Docker Compose

**Nota**: Puedes usar cualquier otra librería o herramienta que consideres necesaria. Documenta tus decisiones técnicas en el archivo `TECHNICAL_DECISIONS.md`.

---

## 📦 Funcionalidades Requeridas

### 1. Autenticación y Usuarios

**Backend:**

-   Registro de usuarios con validación
-   Login con generación de JWT
-   Middleware de autenticación para proteger rutas
-   Hash de contraseñas
-   Endpoint para obtener perfil del usuario autenticado

**Frontend:**

-   Formularios de registro y login con validaciones
-   Almacenamiento del token de autenticación
-   Rutas protegidas que requieren autenticación
-   Redirección automática según estado de autenticación

---

### 2. Gestión de Proyectos

**Backend:**

-   CRUD completo de proyectos
-   Solo el creador del proyecto puede editarlo o eliminarlo
-   Sistema de colaboradores: añadir usuarios a proyectos
-   Paginación en listado de proyectos

**Frontend:**

-   Lista de proyectos con diseño responsive
-   Crear, editar y eliminar proyectos
-   Búsqueda y filtrado de proyectos
-   Gestión de colaboradores

---

### 3. Gestión de Tareas

**Backend:**

-   CRUD completo de tareas
-   Las tareas pertenecen a un proyecto
-   Estados: "pendiente", "en progreso", "completada"
-   Prioridades: "baja", "media", "alta"
-   Asignar tareas a colaboradores del proyecto
-   Filtros por estado, prioridad, proyecto, usuario asignado
-   Ordenamiento flexible

**Frontend:**

-   Visualización de tareas (lista, kanban, o tu propuesta)
-   Crear, editar y eliminar tareas
-   Cambiar estado de tareas
-   Filtros interactivos
-   Asignación de tareas a usuarios

---

### 4. Dashboard y Estadísticas

**Backend:**

-   Endpoint con estadísticas del usuario:
    -   Total de proyectos
    -   Total de tareas
    -   Tareas por estado
    -   Otras métricas relevantes

**Frontend:**

-   Dashboard con visualización de estadísticas
-   Resumen de actividad del usuario

---

## 📊 Criterios de Evaluación

Tu proyecto será evaluado en base a:

| Criterio                  | Peso |
| ------------------------- | ---- |
| **Funcionalidad**         | 30%  |
| **Calidad del Código**    | 25%  |
| **Arquitectura y Diseño** | 15%  |
| **Seguridad**             | 10%  |
| **UI/UX**                 | 10%  |
| **Documentación**         | 5%   |
| **Testing**               | 5%   |

### Puntos Extra (hasta +30%)

-   Docker implementation completa (+10%)
-   Tests exhaustivos (+5%)
-   Funcionalidades adicionales (+5%)
-   CI/CD pipeline (+5%)
-   Deploy en producción (+5%)

---

## 📝 Instrucciones de Entrega

1. **Fork del repositorio**: Crea un fork de este repositorio

2. **Rama de trabajo**:

    ```
    test/tu-nombre-completo
    ```

3. **Estructura del proyecto**:

    ```
    /
    ├── backend/
    ├── frontend/
    ├── TECHNICAL_DECISIONS.md    # Documenta tus decisiones aquí
    ├── docker-compose.yml         # (opcional)
    └── README.md                  # Actualiza con instrucciones de ejecución
    ```

4. **Documentación requerida**:

    - Actualiza este README con instrucciones de instalación y ejecución
    - Completa el archivo `TECHNICAL_DECISIONS.md` explicando tus elecciones
    - Documenta tu API con Swagger
    - Incluye al menos 5 tests

5. **Pull Request**: Una vez completado, crea un PR hacia el repositorio original

---

## ⏱️ Tiempo

Tienes **48 horas** desde que recibes esta prueba. Gestiona tu tiempo según tus prioridades.

---

## ❓ Preguntas Frecuentes

**¿Puedo usar librerías adicionales?**
Sí, documenta tus elecciones en `TECHNICAL_DECISIONS.md`.

**¿Qué base de datos uso?**
La que prefieras (MySQL o MongoDB). No afecta la evaluación.

**¿Es obligatorio Docker?**
No, pero suma puntos extra.

**¿Puedo usar librerías de UI?**
Sí. Recomendamos TailwindCSS para estilos, pero también puedes usar otras librerías de componentes (Material-UI, Ant Design, etc.).

---

## 🎉 ¡Buena suerte!

Recuerda: evaluamos no solo que funcione, sino **cómo está construido**. Demuestra tu criterio técnico y mejores prácticas.

Si tienes dudas sobre los requisitos, no dudes en contactarnos.

---

# 📖 Instrucciones de Ejecución

## 1. Prerrequisitos

Puedes ejecutar el proyecto de dos formas: con **Docker** o de forma **local**.

### Opción A – Usando Docker (recomendada)

-   Docker
-   Docker Compose

### Opción B – Entorno local

-   Node.js 22.x
-   npm 10.x
-   Servidor MariaDB/MariaDB 10.4+ accesible
-   Una base de datos llamada `camaron`
-   Ejecutar el script de inicialización `docker/db/init.sql` sobre la base de datos

---

## 2. Ejecución con Docker

Desde la raíz del proyecto (donde está `docker-compose.yml`):

```bash
docker compose up --build
```

Esto levanta:

-   `db` en el puerto **3306**
-   `backend` en el puerto **3000**
-   `frontend` en el puerto **5173**

Cuando los contenedores estén arriba, podrás entrar a la aplicación en:

-   Frontend: http://localhost:5173
-   Backend: http://localhost:3000

La base de datos se inicializa automáticamente con el script `docker/db/init.sql`.

---

## 3. Ejecución en local (sin Docker)

### 3.1. Backend

Desde la raíz del repo:

```bash
cd backend
npm install
cp .env.example .env
```

Ajusta el `.env` para que apunte a tu base de datos local, por ejemplo:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=camaron

JWT_SECRET=super-secret-jwt
CORS_ORIGIN=http://localhost:5173
```

Luego levanta el servidor de desarrollo:

```bash
npm run dev
```

El backend quedará escuchando en `http://localhost:3000`.

### 3.2. Frontend

En otra terminal, desde la raíz del repo:

```bash
cd frontend
npm install
```

Después levanta el frontend:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

La aplicación quedará disponible en `http://localhost:5173`.

---

## 4. Documentación de la API (OpenAPI/Swagger)

Cuando el backend está en marcha, la documentación interactiva de la API se expone en:

-   http://localhost:3000/docs

Desde ahí se pueden explorar los endpoints, ver los modelos y probar peticiones.

---

## 5. Usuarios iniciales y creación rápida de usuarios de prueba

La base de datos se inicializa con:

-   Un usuario administrador por defecto definido en `docker/db/init.sql` (puedes revisar/ajustar sus credenciales ahí).

Además, para crear usuarios de prueba rápidamente puedes usar los endpoints de desarrollo expuestos en `devRoutes.ts`.

Con el backend levantado en `http://localhost:3000`, ejecuta en una terminal:

```bash
curl -X POST http://localhost:3000/dev/createUser  -H "Content-Type: application/json"  -d '{
"usuario": "programador1",
"correo": "programador1@mail.com",
"nombreCompleto": "programador1",
"contrasena": "secret123",
"esSuperadmin": true
}'
```

Y para un segundo usuario:

```bash
curl -X POST http://localhost:3000/dev/createUser  -H "Content-Type: application/json"  -d '{
"usuario": "programador2",
"correo": "programador2@mail.com",
"nombreCompleto": "programador2",
"contrasena": "secret123",
"esSuperadmin": true
}'
```

Con eso tendrás dos usuarios programador1 y programador2 disponibles para iniciar sesión y probar el flujo completo de la aplicación.
