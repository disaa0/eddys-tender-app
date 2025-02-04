# Eddy's Tender App

Aaplicación full-stack construida con **ExpressJS** (backend), **React Native/Expo** (frontend) y **MySQL** (base de datos), contenerizada con Docker para un desarrollo consistente multiplataforma.

---

## Tecnologías y Herramientas

- **Backend**: ExpressJS, Prisma (ORM)
- **Base de datos**: MySQL
- **Frontend**: React Native, Expo
- **Contenerización**: Docker, Docker Compose
- **Pasarela de pagos**: Stripe
- **Control de versiones**: Git + GitHub
- **Gestión del proyecto**: Jira
- **Diseño**: Figma
- **Testing**: Manual + (por definir)
- **Documentación**: Markdown, Swagger (por definir)

---

## Estructura del Proyecto

```
project-root/
├── .github/                  # Configuraciones de GitHub (workflows, plantillas)
├── backend/
│   ├── src/
│   │   ├── controllers/      # Manejadores de rutas
│   │   ├── middleware/       # Autenticación, logging
│   │   ├── models/           # Esquema de Prisma
│   │   ├── routes/           # Endpoints de la API
│   │   ├── services/         # Lógica de negocio (ej: integración con Stripe)
│   │   ├── utils/            # Helpers, loggers
│   │   └── app.js            # Punto de entrada de Express
│   ├── prisma/               # Migraciones y esquema de Prisma
│   ├── Dockerfile            # Configuración de Docker para el backend
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── assets/               # Imágenes, fuentes
│   ├── components/           # Componentes reutilizables de la UI
│   ├── screens/              # Pantallas de la aplicación
│   ├── services/             # Clientes de la API
│   ├── App.js                # Punto de entrada principal
│   └── package.json
├── docker-compose.yml        # Configuración de múltiples contenedores
├── docs/                     # Diagramas de arquitectura, requisitos
└── README.md                 # Estás aquí :)
```

---

## Requisitos Previos

- **Docker** ([Instalar](https://docs.docker.com/desktop/install/))
- **Node.js v18+** (Recomendado: Usar [nvm](https://github.com/nvm-sh/nvm) o [nvm-windows](https://github.com/coreybutler/nvm-windows))
- **Git**
- (Windows) Habilitar WSL2 para mejor rendimiento con Docker ([Guía](https://learn.microsoft.com/es-es/windows/wsl/install))

---

## Guía de Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/disaa0/eddys-tender-app
cd eddys-tender-app
```

### 2. Configurar Variables de Entorno
- Copia `.env.example` a `.env` en la carpeta `backend/`:
  ```bash
  cp backend/.env.example backend/.env
  ```
- Actualiza `backend/.env` con las credenciales de MySQL:
  ```env
  DATABASE_URL="mysql://user:user_password@mysql:3306/eddys-tender-db"
  ```

### 3. Iniciar Contenedores de Docker
```bash
# Construir e iniciar todos los servicios (backend + MySQL)
docker-compose up --build

# Para ejecutar en segundo plano:
docker-compose up -d
```

### 4. Ejecutar Migraciones de la Base de Datos
```bash
# Ejecutar migraciones de Prisma dentro del contenedor del backend
docker-compose exec backend npx prisma migrate dev
```

### 5. Configuración del Frontend (Expo)
```bash
cd frontend
npm install
npx expo start
```
- Escanea el código QR con la app **Expo Go** (móvil) o usa un emulador.

---

## Comandos Comunes

| Comando | Descripción |
|---------|-------------|
| `docker-compose up --build` | Reconstruir e iniciar todos los contenedores |
| `docker-compose down` | Detener y eliminar contenedores |
| `docker-compose logs -f backend` | Ver logs del backend |
| `docker-compose exec backend npm run test` | Ejecutar pruebas del backend |
| `docker-compose exec mysql mysql -u user -p` | Acceder a la consola de MySQL |
| `npx prisma studio` | Abrir Prisma Studio (ejecutar dentro del contenedor del backend) |

---

## Flujo de Trabajo

### Backend
1. **Crear una rama para una nueva funcionalidad**:
   ```bash
   git checkout -b feature/sistema-de-autenticacion
   ```
2. **Realizar cambios** en el código del backend en `backend/src/`.
3. **Probar localmente** con recarga automática (Docker reiniciará automáticamente).
4. **Guardar cambios**:
   ```bash
   git add .
   git commit -m "feat: añadir middleware de autenticación"
   ```

### Frontend
1. **Iniciar el servidor de desarrollo de Expo**:
   ```bash
   cd frontend && npm start
   ```
2. **Sincronizar con la API del backend** actualizando `frontend/services/api.js`.

### Base de Datos
- Siempre **crear nuevas migraciones** después de cambios en el esquema:
  ```bash
  docker-compose exec backend npx prisma migrate dev --name añadir_tabla_usuarios
  ```
- Usar **Prisma Studio** para inspeccionar datos:
  ```bash
  docker-compose exec backend npx prisma studio
  ```

---

## Solución de Problemas Comunes

| Problema | Solución |
|----------|----------|
| **Conflictos de puertos** | Detener procesos locales de MySQL/Node.js que usen los puertos `3000` o `3306` |
| **MySQL no está listo** | Añadir un [script de espera](https://docs.docker.com/compose/startup-order/) al Dockerfile del backend |
| **Permisos de archivos (Linux)** | Ejecutar `sudo chown -R $USER:$USER .` en la raíz del proyecto |
| **Variables de entorno no cargadas** | Asegurarse de que `.env` exista en `backend/` y coincida con `docker-compose.yml` |
| **Error al construir con Docker** | Limpiar la caché de Docker: `docker-compose build --no-cache` |

---

## Notas

- **Formateo de código**: Usa Prettier/ESLint (configuración en `.vscode/`) (Extensiones de VSCode).
- **Documentación**: Actualizar `docs/` con cambios arquitectónicos.
- **Copias de seguridad**: La base de datos se persiste en el volumen de Docker `mysql_data`.


---
