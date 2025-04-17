# Eddy's Tender App

Aplicación full-stack construida con **ExpressJS** (backend), **React Native/Expo** (frontend) y **MySQL** (base de datos), contenerizada con Docker para un desarrollo consistente multiplataforma.

## Tecnologías y Herramientas

- **Backend**: ExpressJS, Prisma (ORM)
- **Base de datos**: MySQL
- **Frontend**: React Native, Expo
- **Contenerización**: Docker, Docker Compose
- **Pasarela de pagos**: Stripe
- **Control de versiones**: Git + GitHub **Gestión del proyecto**: Jira
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

6. **Iniciar frontend**:
```bash
cd frontend
npm install
npx expo start
```
Para más detalles:
- [Documentación del Backend](backend/README.md)
- [Documentación del Frontend](frontend/docs/sprint1/DEVELOPER_GUIDE.md)

## Integración con Stripe para Procesamiento de Pagos

La aplicación utiliza Stripe como pasarela de pagos para procesar transacciones con tarjetas de crédito y débito. Para desarrollo y pruebas, se debe usar el entorno sandbox de Stripe.

### Configuración de Claves API de Stripe

1. **Crear una cuenta en Stripe**:
   - Regístrate en [Stripe Dashboard](https://dashboard.stripe.com/register)
   - Una vez registrado, tendrás acceso a tu panel de control

2. **Obtener claves API de prueba**:
   - En el dashboard, ve a "Desarrolladores" > "Claves API"
   - Copia la "Clave secreta de prueba" que comienza con `sk_test_`
   - También necesitarás la "Clave publicable de prueba" que comienza con `pk_test_`

3. **Configurar en el proyecto**:
   - Añade la clave secreta a tu archivo `backend/.env`:
     ~~~
     STRIPE_SECRET_KEY=sk_test_your_test_key_here
     ~~~
   - Para el frontend, copia el archivo `frontend/env.example` a `frontend/.env` y añade tu clave publicable:
     ~~~
     EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
     ~~~

4. **Configurar Webhook de Stripe**:
   - El webhook se configura automáticamente mediante el CLI de Stripe:
     1. El contenedor stripe-cli ejecuta el comando `stripe listen` automáticamente al iniciar
     2. Supervisa los logs del backend para ver el enlace de autenticación:
        ```bash
        docker-compose logs -f backend
        ```
     3. Verás un mensaje con un enlace para autenticarte con Stripe
     4. Abre este enlace en tu navegador e inicia sesión en tu cuenta de Stripe
     5. Una vez autorizado, el CLI generará y mostrará un webhook signing secret en los logs
     6. Copia este signing secret que comienza con `whsec_`
     7. Añade esta clave a tu archivo `backend/.env`:
        ```
        STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
        ```

5. **Reiniciar el backend después de configurar el webhook**:
   - Una vez que hayas añadido el webhook signing secret a tu archivo `.env`, reinicia el contenedor del backend:
     ```bash
     docker-compose restart backend
     ```
   - Esto permitirá que el backend cargue la nueva variable de entorno

6. **Verificación del Webhook**:
   - Para confirmar que el webhook está funcionando correctamente, supervisa los logs del contenedor stripe-cli:
     ```bash
     docker-compose logs -f stripe-cli
     ```
   - Deberías ver mensajes indicando que el webhook está escuchando y reenviando eventos al backend
   - Para probar el webhook, puedes ejecutar:
     ```bash
     docker-compose exec stripe-cli stripe trigger payment_intent.succeeded
     ```
   - Esto simulará un evento de pago exitoso y deberías ver en los logs que fue reenviado a tu aplicación

### Pruebas de Pagos

- Usa tarjetas de prueba proporcionadas por Stripe:
  - **Éxito**: `4242 4242 4242 4242`
  - **Requiere autenticación**: `4000 0025 0000 3155`
  - **Rechazada**: `4000 0000 0000 0002`
  - CVC: Cualquier 3 dígitos
  - Fecha: Cualquier fecha futura

- Para probar el flujo completo:
  1. Crea un carrito con productos
  2. Procede al checkout
  3. Selecciona pago con tarjeta
  4. Usa una tarjeta de prueba de Stripe
  5. Verifica que la orden se procese correctamente

### Documentación Detallada

Para más información sobre la implementación de Stripe en el proyecto:
- [Documentación completa de Stripe](backend/docs/STRIPE.md)

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

## Configuración de API

Para conectar el frontend con el backend, debes configurar correctamente la URL de la API:

### Cómo encontrar tu dirección IP local

Para probar en dispositivos físicos, necesitas usar la dirección IP local de tu computadora en lugar de localhost, ya que localhost se refiere al propio dispositivo.

**Windows:**
1. Abre la Línea de Comandos
2. Escribe 'ipconfig' y presiona Enter
3. Busca 'Dirección IPv4' en tu adaptador de red activo

**macOS:**
1. Abre Preferencias del Sistema > Red
2. Selecciona tu conexión activa y verifica la dirección IP

**Linux:**
1. Abre Terminal
2. Escribe 'ip addr show' o 'hostname -I' y presiona Enter
3. Busca el valor inet de tu interfaz de red activa

### Configuración del frontend

En el archivo `frontend/.env`, configura las URLs de API según corresponda:

```
# URL de API para desarrollo (usa tu dirección IP local)
EXPO_PUBLIC_DEV_API_URL=http://192.168.0.138:3000/api

# URL de API para producción
EXPO_PUBLIC_PROD_API_URL=http://192.168.0.138:3000/api
```

La configuración se carga automáticamente en `frontend/app/config/index.js` a través de las variables de entorno.

Para más información, consultar la documentación específica en las carpetas `backend/docs/` y `frontend/docs/`.
