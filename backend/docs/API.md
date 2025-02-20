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

### 1.4 Eliminar Perfil

**DELETE /api/auth/profile**

**Headers Requeridos:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
    "message": "Cuenta desactivada exitosamente"
}
```

**Errores Posibles:**
- 401: Token no proporcionado
- 403: Token inválido

### 1.5 Actualizar Contraseña

**PUT /api/auth/password**

**Headers Requeridos:**
```
Authorization: Bearer <token>
```

**Cuerpo de la Petición:**
```json
{
    "oldPassword": "ContraseñaActual123!",
    "newPassword": "NuevaContraseña123!"
}
```

**Respuesta Exitosa (200):**
```json
{
    "message": "Contraseña actualizada exitosamente"
}
```

**Errores Posibles:**
- 400: Contraseña actual incorrecta
- 400: Nueva contraseña no cumple requisitos
- 401: Token no proporcionado
- 403: Token inválido

**Nota de Desarrollo:**
- En ambiente de desarrollo, las contraseñas se almacenan sin encriptar para facilitar testing
- En producción, se utilizará bcrypt + AES-256 para el manejo seguro de contraseñas

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

## 8. ENDPOINTS DE ADMINISTRADOR

### 8.1 Gestión de Productos

**GET /api/admin/products**

Lista todos los productos con paginación.

**Headers Requeridos:**
```
Authorization: Bearer <token>
```

**Parámetros de Query:**
- page: Número de página (default: 1)
- limit: Productos por página (default: 5)

**Respuesta Exitosa (200):**
```json
{
    "message": "Productos obtenidos correctamente",
    "data": {
        "products": [
            {
                "idProduct": 1,
                "name": "Hamburguesa Clásica",
                "description": "Hamburguesa con carne, lechuga, tomate y queso",
                "price": 89.99,
                "status": true,
                "productType": {
                    "type": "Comida"
                }
            }
        ],
        "totalPages": 3,
        "currentPage": 1
    }
}
```

**GET /api/admin/products/:id**

Obtiene un producto específico por ID.

**Parámetros URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | number | ID del producto |

**Respuesta Exitosa (200):**
```json
{
    "message": "Producto obtenido correctamente",
    "data": {
        "product": {
            "idProduct": 1,
            "name": "Hamburguesa Clásica",
            "description": "Hamburguesa con carne, lechuga, tomate y queso",
            "price": 89.99,
            "status": true,
            "idProductType": 1,
            "idUserAdded": 1,
            "createdAt": "2025-02-20T16:06:12.006Z"
        }
    }
}
```

**Errores Posibles:**
- 400: ID de producto inválido
- 404: Producto no encontrado
- 401: Token no proporcionado
- 403: Usuario no es administrador

**POST /api/admin/products**

Crea un nuevo producto.

**Headers Requeridos:**
```
Authorization: Bearer <token>
```

**Cuerpo de la Petición:**
```json
{
    "name": "Nuevo Producto",
    "description": "Descripción del producto",
    "price": 99.99,
    "ingredients": ["ing1", "ing2"],
    "category": "Comida",
    "image": "url_imagen"
}
```

**PUT /api/admin/products/:id**

Modifica los detalles de un producto existente.

**Headers Requeridos:**
```
Authorization: Bearer <token>
```

**Parámetros URL:**
- id: ID del producto a modificar

**Cuerpo de la Petición:**
```json
{
    "name": "Nombre Actualizado",
    "description": "Nueva descripción",
    "price": 109.99
}
```

**PATCH /api/admin/products/:id/status**

Alterna el estado de un producto.

**Headers Requeridos:**
```
Authorization: Bearer <token>
```

**Parámetros URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | number | ID del producto |

**Respuesta Exitosa (200):**
```json
{
    "message": "Producto activado exitosamente",
    "product": {
        "idProduct": 1,
        "name": "Producto Ejemplo",
        "status": true,
        // ... otros campos del producto
    }
}
```

**Errores Posibles:**
- 400: Producto no encontrado
- 401: Token no proporcionado
- 403: Usuario no es administrador
- 500: Error del servidor

### 8.2 Editar Personalización de Producto

**PUT /api/admin/products/{id}/customization**

Actualiza o crea una personalización para un producto específico.

**Headers Requeridos:**
```
Authorization: Bearer <token>
```

**Parámetros URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | number | ID del producto |

**Cuerpo de la Petición:**
```json
{
    "name": "Nombre de la personalización",
    "status": true
}
```

**Validaciones:**
- name: String no vacío
- status: Boolean requerido

**Respuesta Exitosa (200):**
```json
{
    "message": "Personalización actualizada exitosamente",
    "personalization": {
        "idPersonalization": 1,
        "name": "Nombre de la personalización",
        "status": true,
        // ... otros campos
    },
    "productPersonalization": {
        "idProductPersonalization": 1,
        "idProduct": 1,
        "idPersonalization": 1,
        // ... otros campos
    }
}
```

**Errores Posibles:**
- 400: Producto no encontrado
- 400: Datos de personalización inválidos
- 401: Token no proporcionado
- 403: Usuario no es administrador
- 500: Error del servidor

### 8.3 Permisos de Administrador

Para acceder a los endpoints de administrador, el usuario debe:

1. Estar autenticado (token JWT válido)
2. Tener tipo de usuario administrador (idUserType === 1)

**Respuesta de Error de Permisos (403):**
```json
{
    "message": "Acceso denegado. Se requieren permisos de administrador."
}
```

### 8.4 Consideraciones Técnicas

1. **Transacciones:**
   - Las operaciones de personalización utilizan transacciones Prisma
   - Si algo falla, se hace rollback automático

2. **Validaciones:**
   - Se valida la existencia del producto
   - Se validan los datos de personalización
   - Se verifica el estado del producto

3. **Seguridad:**
   - Todos los endpoints requieren autenticación
   - Se verifica el rol de administrador
   - Se registra el usuario que realiza los cambios

4. **Respuestas:**
   - Códigos HTTP estándar
   - Mensajes descriptivos
   - Datos actualizados en la respuesta

5. **Auditoría:**
   - Se registra quién realizó los cambios (idUserAdded)
   - Se mantiene historial de estados
   - Timestamps automáticos 

## 9. ENDPOINTS DE USUARIO

### 9.1 Actualizar Email

**PUT /api/auth/email**

**Headers Requeridos:**
```
Authorization: Bearer <token>
```

**Cuerpo de la Petición:**
```json
{
    "email": "nuevo@email.com"
}
```

**Respuesta Exitosa (200):**
```json
{
    "message": "Correo electrónico actualizado exitosamente"
}
```

**Errores Posibles:**
- 400: Email inválido
- 400: Email ya existe
- 401: Token no proporcionado
- 403: Token inválido

## 10. ENDPOINTS DE PRODUCTOS

### 10.1 Listar Productos (Admin)

**GET /admin/products**

**Headers Requeridos:**
```
Authorization: Bearer <token>
```

**Parámetros de Query:**
- page: Número de página (default: 1)
- limit: Productos por página (fijo: 5)

**Respuesta Exitosa (200):**
```json
{
    "message": "Productos obtenidos correctamente",
    "data": {
        "products": [
            {
                "idProduct": 1,
                "name": "Hamburguesa Clásica",
                "description": "Hamburguesa con carne, lechuga, tomate y queso",
                "price": 89.99,
                "status": true,
                "productType": {
                    "type": "Comida"
                }
            }
        ],
        "totalPages": 3,
        "currentPage": 1
    }
}
```

**Errores Posibles:**
- 401: Token no proporcionado
- 403: Usuario no es administrador
- 500: Error del servidor

### 10.2 Agregar Producto (Admin)

**POST /admin/products**

**Headers Requeridos:**
```
Authorization: Bearer <token>
```

**Cuerpo de la Petición:**
```json
{
    "idProductType": 1,
    "name": "Nuevo Producto",
    "description": "Descripción del producto",
    "price": 99.99,
    "status": true
}
```

**Respuesta Exitosa (201):**
```json
{
    "message": "Producto agregado exitosamente",
    "product": {
        "idProduct": 1,
        "name": "Nuevo Producto",
        "description": "Descripción del producto",
        "price": 99.99,
        "status": true,
        "idUserAdded": 1
    }
}
```

**Errores Posibles:**
- 400: Datos de producto inválidos
- 401: Token no proporcionado
- 403: Usuario no es administrador
- 500: Error del servidor

### 10.3 Modificar Detalles de Producto (Admin)

**PUT /admin/products/{id}**

**Headers Requeridos:**
```
Authorization: Bearer <token>
```

**Parámetros URL:**
- id: ID del producto a modificar

**Cuerpo de la Petición:**
```json
{
    "name": "Nombre Actualizado",
    "description": "Nueva descripción"
}
```

**Respuesta Exitosa (200):**
```json
{
    "message": "Detalles del producto actualizados correctamente",
    "product": {
        "idProduct": 1,
        "name": "Nombre Actualizado",
        "description": "Nueva descripción",
        "price": 99.99,
        "status": true
    }
}
```

**Errores Posibles:**
- 400: ID de producto inválido
- 400: Datos de actualización inválidos
- 401: Token no proporcionado
- 403: Usuario no es administrador
- 404: Producto no encontrado
- 500: Error del servidor

## 11. VALIDACIONES DE PRODUCTOS

### 11.1 Creación de Producto
- **idProductType**: Número entero positivo
- **name**: Mínimo 3 caracteres
- **description**: Mínimo 3 caracteres
- **price**: Número positivo
- **status**: Booleano

### 11.2 Actualización de Detalles
- **name**: (Opcional) Mínimo 3 caracteres
- **description**: (Opcional) Mínimo 3 caracteres
- Al menos uno de los campos debe estar presente

## 12. NOTAS TÉCNICAS ADICIONALES

### 12.1 Paginación
- Implementada en listado de productos
- 5 productos por página
- Incluye total de páginas y página actual

### 12.2 Validaciones
- Uso de Zod para validación de datos
- Manejo de errores específicos por campo
- Transformación automática de tipos

### 12.3 Seguridad
- Verificación de roles para endpoints administrativos
- Validación de propiedad de recursos
- Sanitización de datos de entrada 