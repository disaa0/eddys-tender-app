# Eddy's Tender App

Aplicación full-stack construida con **ExpressJS** (backend), **React Native/Expo** (frontend) y **MySQL** (base de datos), contenerizada con Docker para un desarrollo consistente multiplataforma.

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
- **Documentación**: Markdown

## Estructura del Proyecto

```
project-root/
├── .github/                  # Configuraciones de GitHub (workflows, plantillas)
├── backend/                  # Servidor Express + Prisma
│   ├── docs/                # Documentación específica del backend
│   ├── src/                 # Código fuente
│   └── README.md            # Guía del backend
├── frontend/                # App React Native + Expo
│   ├── docs/                # Documentación específica del frontend
│   ├── src/                 # Código fuente
│   └── README.md            # Guía del frontend
├── docker-compose.yml       # Configuración de contenedores
└── docs/                    # Documentación general del proyecto
```

## Requisitos Previos

- **Docker** ([Instalar](https://docs.docker.com/desktop))
- **Node.js v18+** (Recomendado: [nvm](https://github.com/nvm-sh/nvm))
- **Git**
- (Windows) WSL2 ([Guía](https://learn.microsoft.com/es-es/windows/wsl/install))

## Inicio Rápido

1. **Clonar el repositorio**:
```bash
git clone https://github.com/disaa0/eddys-tender-app
cd eddys-tender-app
```

2. **Configurar variables de entorno**:
```bash
cp backend/.env.example backend/.env
```

3. **Crear directorios necesarios**:
```bash
mkdir -p mysql/init mysql/conf
```

4. **Iniciar contenedores**:
```bash
# Primera vez o después de cambios
docker-compose up --build

# Ejecuciones posteriores
docker-compose up -d
```

5. **Verificar estado de los servicios**:
```bash
docker-compose ps
```

4. **Iniciar frontend**:
```bash
cd frontend
npm install
npx expo start
```

Para más detalles:
- [Documentación del Backend](backend/README.md)
- [Documentación del Frontend](frontend/docs/sprint1/DEVELOPER_GUIDE.md)

## Comandos Comunes

| Comando | Descripción |
|---------|-------------|
| `docker-compose up -d` | Iniciar contenedores |
| `docker-compose down` | Detener contenedores |
| `docker-compose down -v` | Detener y eliminar volúmenes |
| `docker-compose logs -f backend` | Ver logs del backend |
| `docker-compose logs -f mysql` | Ver logs de MySQL |
| `npx expo start` | Iniciar frontend |

## Notas

- **Formateo**: Usar Prettier (configurado en cada proyecto)
- **Documentación**: Mantener actualizada la carpeta `docs/`
- **Base de datos**: 
  - Persistida en volumen Docker `eddys-tender-app_mysql_data`
  - Configuración personalizable en `mysql/conf/`
  - Scripts de inicialización en `mysql/init/`
- **Timezone**: Configurado para América/Hermosillo
- **Compatibilidad**: Funciona en Windows (WSL2), macOS y Linux

Para más información, consultar la documentación específica en las carpetas `backend/docs/` y `frontend/docs/`.
