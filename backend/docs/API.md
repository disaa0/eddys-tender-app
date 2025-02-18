# EDDYS TENDER API

## 1. AUTENTICACIÓN

### 1.1 Registro de Usuario

**POST /api/auth/register**

**Cuerpo de la Petición:**
```json
{
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "password": "Contraseña123!",
    "name": "Juan",
    "lastName": "Pérez",
    "secondLastName": "García",    // Opcional
    "phone": "1234567890"
}
```

**Respuesta Exitosa (201):**
```json
{
    "idUser": 1,
    "email": "usuario@ejemplo.com",
    "username": "usuario123",
    "status": true,
    "idUserType": 1
}
```

**Errores Posibles:**
- 400: Email ya existente
- 400: Nombre de usuario ya existente
- 400: Errores de validación

### 1.2 Inicio de Sesión

**POST /api/auth/login**

**Cuerpo de la Petición:**
```json
{
    "email": "usuario@ejemplo.com",     // O usar username
    "username": "usuario123",           // O usar email
    "password": "Contraseña123!"
}
```

**Respuesta Exitosa (200):**
```json
{
    "message": "Login exitoso",
    "user": {
        "idUser": 1,
        "email": "usuario@ejemplo.com",
        "username": "usuario123",
        "status": true,
        "idUserType": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores Posibles:**
- 400: Usuario no encontrado
- 400: Contraseña incorrecta

### 1.3 Perfil de Usuario

**GET /api/auth/profile**

**Headers Requeridos:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
    "user": {
        "userId": 1,
        "email": "usuario@ejemplo.com",
        "username": "usuario123",
        "userType": 1
    }
}
```

**Errores Posibles:**
- 401: Token no proporcionado
- 403: Token inválido

## 2. VALIDACIONES

### 2.1 Reglas de Validación

**username:**
- Mínimo 3 caracteres
- Máximo 12 caracteres

**email:**
- Formato válido de correo electrónico

**password:**
- Mínimo 6 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 carácter especial (@$!%*?&)

**phone:**
- Exactamente 10 dígitos
- Solo números

**name:**
- No puede estar vacío
- Se convierte automáticamente a mayúsculas

**lastName:**
- No puede estar vacío
- Solo letras (incluyendo acentos y ñ)
- Se convierte automáticamente a mayúsculas

**secondLastName:**
- Opcional
- Solo letras (incluyendo acentos y ñ)
- Se convierte automáticamente a mayúsculas

## 3. SEGURIDAD

### 3.1 Rate Limiting
- Límite: 100 peticiones por IP
- Ventana de tiempo: 15 minutos
- Mensaje al exceder límite: "Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 15 minutos"

### 3.2 JWT (JSON Web Tokens)
- Generado en login exitoso
- Duración: 24 horas
- Debe incluirse en header: Authorization: Bearer <token>
- Contiene: userId, email, username, userType

## 4. CÓDIGOS DE ESTADO
| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Recurso creado |
| 400 | Error en la solicitud |
| 401 | No autorizado |
| 403 | Prohibido |
| 429 | Demasiadas solicitudes |

## 5. NOTAS TÉCNICAS
- Base de datos: MySQL
- ORM: Prisma
- Autenticación: JWT
- Validación: Zod
- Rate Limiting: express-rate-limit

## 6. VARIABLES DE ENTORNO REQUERIDAS
| Variable | Descripción |
|----------|-------------|
| DATABASE_URL | URL de conexión a la base de datos MySQL |
| JWT_SECRET | Clave secreta para firmar tokens JWT |

## 7. CONSIDERACIONES DE DESARROLLO
- Todas las contraseñas deben ser hasheadas antes de almacenarse
- Los nombres y apellidos se almacenan en mayúsculas
- El tipo de usuario por defecto es 1 (usuario normal)
- Se recomienda usar HTTPS en producción
- Configurar un valor seguro para JWT_SECRET en producción 