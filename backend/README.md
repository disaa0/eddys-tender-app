# Backend - Eddy's Tender App

## Stack Tecnológico

- **Framework**: ExpressJS
- **ORM**: Prisma
- **Base de datos**: MySQL 8.0
- **Autenticación**: JWT
- **Validación**: Zod
- **Rate Limiting**: express-rate-limit

## Estructura

```
backend/
├── docs/                # Documentación detallada
│   ├── API.md          # Especificación de la API
│   └── database.md     # Modelo de datos
├── src/
│   ├── controllers/    # Manejadores de rutas
│   ├── middleware/     # Autenticación, validación
│   ├── models/         # Esquema Prisma
│   ├── routes/         # Endpoints
│   ├── services/       # Lógica de negocio
│   └── app.js         # Punto de entrada
└── prisma/            # Migraciones y esquema
```

## Configuración

### Con Docker (Recomendado)

1. **Variables de entorno**:
```bash
cp .env.example .env
```

2. **Configurar DATABASE_URL en .env**:
```env
# Usar 'mysql' como host (nombre del servicio en Docker)
DATABASE_URL="mysql://user:user_password@mysql:3306/eddys-tender-db"
```

3. **Iniciar servicios**:
```bash
# Primera vez
docker-compose up --build

# Verificar que MySQL esté listo
docker-compose logs -f mysql
```

4. **Ejecutar migraciones**:
```bash
# MySQL estará listo cuando el healthcheck pase
docker-compose exec backend npx prisma migrate dev
```

### Local (Sin Docker)

1. **Variables de entorno**:
```bash
cp .env.example .env
# Actualizar DATABASE_URL con tu configuración local
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar base de datos**:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. **Iniciar servidor**:
```bash
npm run dev
```

## Gestión de Base de Datos

### Acceso a MySQL
```bash
# Con Docker
docker-compose exec mysql mysql -u user -p
# Password: user_password

# Local
mysql -u user -p eddys-tender-db
```

### Prisma Studio (GUI)
```bash
# Con Docker
docker-compose exec backend npx prisma studio
# Acceder en http://localhost:5555

# Local
npm run prisma:studio
```

### Migraciones
```bash
# Crear nueva migración
docker-compose exec backend npx prisma migrate dev --name <nombre>

# Ver estado
docker-compose exec backend npx prisma migrate status
```

## Datos de Prueba (Seed)

### Datos Iniciales
El sistema genera automáticamente:

1. **Tipos de Usuario**:
   - Administrador (id: 1)
   - Cliente (id: 2)

2. **Usuario Administrador**:
   ```json
   {
     "email": "admin@admin.com",
     "username": "admin",
     "password": "admin",
     "name": "ADMINISTRADOR",
     "lastName": "ADMINISTRADOR",
     "phone": "6622757172"
   }
   ```

3. **Catálogos Base**:
   - Tipos de Producto (Comida, Bebidas, Extras, Postres)
   - Estados de Orden (Pendiente, Procesando, etc.)
   - Tipos de Envío (Domicilio, Recoger)
   - Tipos de Pago (Efectivo, Tarjeta)

### Ejecutar Seed en Docker

1. **Primera vez** (al construir contenedores):
   ```bash
   docker-compose up --build
   # El seed se ejecuta automáticamente
   ```

2. **Regenerar datos** (borrar y recrear):
   ```bash
   # Detener contenedores
   docker-compose down

   # Eliminar volumen de base de datos
   docker volume rm eddys-tender-app_mysql_data

   # Reconstruir
   docker-compose up --build
   ```

3. **Ejecutar seed manualmente**:
   ```bash
   # Con contenedores corriendo
   docker-compose exec backend npm run prisma:reset
   # O específicamente el seed
   docker-compose exec backend npm run prisma:seed
   ```

### Verificar Datos

1. **Usando Prisma Studio**:
   ```bash
   docker-compose exec backend npm run prisma:studio
   # Acceder en http://localhost:5555
   ```

2. **Usando MySQL**:
   ```bash
   docker-compose exec mysql mysql -u user -p
   # Password: user_password
   
   USE eddys-tender-db;
   SELECT * FROM userType;
   SELECT * FROM user;
   ```

### Consideraciones

1. **Orden de Ejecución**:
   - Primero se crean los catálogos (userType, productType, etc.)
   - Luego el usuario administrador
   - Finalmente la información asociada (userInformation, location)

2. **Ambiente de Desarrollo**:
   - El seed solo se ejecuta en desarrollo
   - En producción, usar migración manual de datos

3. **Datos Sensibles**:
   - Las contraseñas en seed son para desarrollo
   - Cambiar credenciales en producción
   - No incluir datos sensibles en el seed

4. **Troubleshooting**:
   ```bash
   # Ver logs de seed
   docker-compose logs backend | grep "prisma"
   
   # Reiniciar proceso
   docker-compose exec backend npm run prisma:reset -- --force
   ```

## Consideraciones Importantes

### Mayúsculas y Minúsculas en MySQL

1. **Nombres de Tablas**:
- MySQL en Linux es sensible a mayúsculas/minúsculas
- Usar exactamente el mismo caso que en el schema de Prisma
- Ejemplo: `itemCart` debe ser siempre `itemCart`, no `itemcart`

2. **Convención de Nombres**:
- Tablas: camelCase (ej: `itemCart`, `userType`)
- Columnas: camelCase (ej: `createdAt`, `individualPrice`)
- Índices: snake_case (ej: `user_email_key`)

3. **Migraciones**:
- Verificar nombres de tablas en migraciones
- Mantener consistencia con el schema de Prisma
- Usar backticks (\`) para nombres de tablas y columnas

### Troubleshooting

1. **Error de conexión a MySQL**:
- El contenedor de MySQL tiene healthcheck configurado
- Backend esperará a que MySQL esté listo
- Verificar logs: `docker-compose logs mysql`

2. **Error P3014 (Shadow Database)**:
```bash
# Reiniciar contenedores con nuevos permisos
docker-compose down -v
docker-compose up -d --build

# Verificar permisos
docker-compose exec mysql mysql -u user -p
# Password: user_password
# Ejecutar: SHOW GRANTS;
```

3. **Problemas de permisos en volúmenes**:
```bash
# En Linux/macOS
sudo chown -R $USER:$USER mysql/
```

4. **Problemas de plataforma**:
- MySQL está configurado para linux/amd64
- Docker se encargará de la emulación en ARM (M1/M2)

5. **Errores de Nombre de Tabla**:
```bash
# Si una tabla no se encuentra
docker-compose down -v
docker-compose up -d --build
docker-compose exec backend npx prisma migrate reset --force
```

6. **Verificar Nombres de Tablas**:
```bash
# Conectar a MySQL
docker-compose exec mysql mysql -u user -p
# Password: user_password

# Ver todas las tablas
USE eddys-tender-db;
SHOW TABLES;
```

Para más detalles:
- [API y Endpoints](docs/API.md)
- [Modelo de Datos](docs/database.md)

Para más información, consultar la documentación específica en `docs/`. 