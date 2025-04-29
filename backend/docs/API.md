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
  "secondLastName": "García", // Opcional
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
  "idUserType": 2
}
```

**Errores Posibles:**

- 400: Email ya existente
- 400: Nombre de usuario ya existente
- 400: Errores de validación

### 1.2 Registro de Adminitrador

Permite a los aministradores, registrar nuevos usuarios adminstradores o clientes,

**POST /api/admin/register**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Cuerpo de la Petición:**

```json
{
  "email": "admin2@example.com",
  "password": "Contraseña123!",
  "username": "admin2",
  "name": "Admin2",
  "lastName": "Ejemplo",
  "secondLastName": "Apellido",
  "phone": "1234567890",
  "idUserType": 1
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
- 403: Acceso denegado.

**Nota:**

- Un **aministrador** puede definir `"idUserType"` :
  - 1: Para registrar a un nuevo administrador
  - 2: Para registrar a un nuevo cliente

### 1.3 Inicio de Sesión

**POST /api/auth/login**

**Cuerpo de la Petición:**

```json
{
  "email": "usuario@ejemplo.com", // O usar username
  "username": "usuario123", // O usar email
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

### 1.4 Perfil de Usuario

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

### 1.5 Eliminar Perfil

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

### 1.6 Actualizar Contraseña

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
- Al menos 1 carácter especial (@$!%\*?&)

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

| Código | Descripción            |
| ------ | ---------------------- |
| 200    | Operación exitosa      |
| 201    | Recurso creado         |
| 400    | Error en la solicitud  |
| 401    | No autorizado          |
| 403    | Prohibido              |
| 429    | Demasiadas solicitudes |

## 5. NOTAS TÉCNICAS

- Base de datos: MySQL
- ORM: Prisma
- Autenticación: JWT
- Validación: Zod
- Rate Limiting: express-rate-limit

## 6. VARIABLES DE ENTORNO REQUERIDAS

| Variable     | Descripción                              |
| ------------ | ---------------------------------------- |
| DATABASE_URL | URL de conexión a la base de datos MySQL |
| JWT_SECRET   | Clave secreta para firmar tokens JWT     |

## 7. CONSIDERACIONES DE DESARROLLO

- Todas las contraseñas deben ser hasheadas antes de almacenarse
- Los nombres y apellidos se almacenan en mayúsculas
- El tipo de usuario por defecto es 1 (usuario normal)
- Se recomienda usar HTTPS en producción
- Configurar un valor seguro para JWT_SECRET en producción

## 8. ENDPOINTS DE ADMINISTRADOR

### 8.1 Gestión de Órdenes

**GET /api/admin/orders**

Obtiene órdenes dentro de un rango de fechas específico.

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros de Query:**
| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| date_from | string | Fecha de inicio (formato YYYY-MM-DD) | Sí |
| date_to | string | Fecha de fin (formato YYYY-MM-DD) | Sí |

**Ejemplo de uso:**

```
/api/admin/orders?date_from=2024-07-22&date_to=2024-07-24
```

**Respuesta Exitosa (200):**

```json
{
  "message": "Órdenes obtenidas correctamente",
  "data": {
    "orders": [
      {
        "idOrder": 42,
        "idCart": 23,
        "idPaymentType": 2,
        "idShipmentType": 1,
        "idOrderStatus": 2,
        "totalPrice": 258.0,
        "paid": true,
        "paidAt": "2024-07-23T14:35:12Z",
        "createdAt": "2024-07-23T14:30:45Z",
        "cart": {
          "idCart": 23,
          "user": {
            "email": "usuario@ejemplo.com",
            "username": "usuario123",
            "userInformation": {
              "name": "JUAN",
              "lastName": "PÉREZ",
              "phone": "1234567890"
            }
          },
          "itemsCart": [
            {
              "quantity": 2,
              "individualPrice": 129,
              "product": {
                "idProduct": 12,
                "name": "Tender Box",
                "description": "Exquisito paquete..."
              }
            }
          ]
        },
        "orderStatus": {
          "idOrderStatus": 2,
          "status": "Procesando"
        },
        "paymentType": {
          "idPaymentType": 2,
          "type": "Tarjeta de crédito"
        },
        "shipmentType": {
          "idShipmentType": 1,
          "type": "Envío a domicilio"
        },
        "location": {
          "street": "Av. Luis Encinas",
          "houseNumber": "10",
          "postalCode": "83000",
          "neighborhood": "Centro"
        }
      }
    ],
    "count": 1
  }
}
```

**Errores Posibles:**

- 400: Parámetros de fecha faltantes o inválidos
- 401: Token no proporcionado
- 403: Usuario no es administrador
- 500: Error del servidor

**Notas:**

- Este endpoint es exclusivo para administradores
- La fecha final (date_to) se considera hasta el final del día (23:59:59)
- Las órdenes se ordenan por fecha de creación (más recientes primero)
- Se incluyen detalles completos: productos, usuario, estado, información de envío

### 8.2 Obtener detalle de una orden específica

**GET /api/admin/orders/:id**

Obtiene información detallada de una orden específica por su ID.

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros URL:**
| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| id | number | ID de la orden | Sí |

**Respuesta Exitosa (200):**

```json
{
  "message": "Orden obtenida correctamente",
  "data": {
    "idOrder": 42,
    "idCart": 23,
    "idPaymentType": 2,
    "idShipmentType": 1,
    "idOrderStatus": 2,
    "totalPrice": 258.0,
    "paid": true,
    "paidAt": "2023-07-15T14:35:12Z",
    "createdAt": "2023-07-15T14:30:45Z",
    "deliveryAt": null,
    "stripePaymentIntentId": "pi_3MkVnL2eZvKYlo2C1IFrG8oM",
    "stripePaymentStatus": "succeeded",
    "cart": {
      "idCart": 23,
      "user": {
        "email": "usuario@ejemplo.com",
        "username": "usuario123",
        "userInformation": {
          "name": "JUAN",
          "lastName": "PÉREZ",
          "secondLastName": null,
          "phone": "1234567890"
        }
      },
      "itemsCart": [
        {
          "quantity": 2,
          "individualPrice": 129,
          "product": {
            "idProduct": 12,
            "name": "Tender Box",
            "description": "Exquisito paquete..."
          }
        }
      ]
    },
    "orderStatus": {
      "idOrderStatus": 2,
      "status": "Procesando"
    },
    "paymentType": {
      "idPaymentType": 2,
      "type": "Tarjeta de crédito"
    },
    "shipmentType": {
      "idShipmentType": 1,
      "type": "Envío a domicilio"
    },
    "location": {
      "street": "Av. Luis Encinas",
      "houseNumber": "10",
      "postalCode": "83000",
      "neighborhood": "Centro"
    }
  }
}
```

**Errores Posibles:**

- 400: ID de orden inválido
- 401: Token no proporcionado
- 403: Usuario no es administrador
- 404: Orden no encontrada
- 500: Error del servidor

**Notas:**

- Este endpoint es exclusivo para administradores
- Incluye detalles completos de la orden: información del cliente, productos, estado, pago y envío

### 8.3 Actualizar Estado de Orden

**PATCH /api/admin/order/:id**

Permite a los administradores cambiar el estado de una orden específica.

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros URL:**
| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| id | number | ID de la orden a actualizar | Sí |

**Cuerpo de la Petición:**

```json
{
  "idOrderStatus": 3
}
```

**Validaciones:**

- idOrderStatus: Debe ser un número entero válido que corresponda a un estado de orden existente

**Respuesta Exitosa (200):**

```json
{
  "message": "Estado de orden actualizado correctamente",
  "data": {
    "idOrder": 42,
    "idCart": 23,
    "idPaymentType": 2,
    "idShipmentType": 1,
    "idOrderStatus": 3,
    "totalPrice": 258.0,
    "paid": true,
    "paidAt": "2024-07-23T14:35:12Z",
    "createdAt": "2024-07-23T14:30:45Z",
    "orderStatus": {
      "idOrderStatus": 3,
      "status": "En camino"
    },
    "paymentType": {
      "idPaymentType": 2,
      "type": "Tarjeta de crédito"
    },
    "shipmentType": {
      "idShipmentType": 1,
      "type": "Envío a domicilio"
    }
  }
}
```

**Errores Posibles:**

- 400: ID de orden inválido
- 400: Se requiere un ID de estado de orden válido
- 401: Token no proporcionado
- 403: Usuario no es administrador
- 404: Orden no encontrada
- 404: Estado de orden no encontrado
- 500: Error del servidor

**Notas:**

- Este endpoint es exclusivo para administradores
- Si se actualiza a estado "Entregado" (idOrderStatus 5), automáticamente se actualizará el campo deliveryAt con la fecha actual
- Los estados de orden posibles se definen en la tabla orderStatus

### 8.2 Gestión de Productos

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
    "status": true
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

**PUT /api/admin/products/{id}/personalization**

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
    "status": true
    // ... otros campos
  },
  "productPersonalization": {
    "idProductPersonalization": 1,
    "idProduct": 1,
    "idPersonalization": 1
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

### 8.3 Obtner Personalizaciónes de Producto

**GET /api/admin/products/{id}/personalizations**

Obtiene los detalles las personalizaciónes para un producto específico.

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
  "message": "Personalizaciones obtenidas correctamente",
  "data": {
    "personalizations": [
      {
        "idProductPersonalization": 1,
        "idUserAdded": 1,
        "idProduct": 1,
        "idPersonalization": 1,
        "status": true,
        "personalization": {
          "idPersonalization": 1,
          "idUserAdded": 1,
          "name": "Sin Cebolla",
          "status": true,
          "createdAt": "2025-03-12T18:20:06.681Z"
        }
      },
      {
        "idProductPersonalization": 2,
        "idUserAdded": 1,
        "idProduct": 1,
        "idPersonalization": 2,
        "status": true,
        "personalization": {
          "idPersonalization": 2,
          "idUserAdded": 1,
          "name": "Extra Queso",
          "status": true,
          "createdAt": "2025-03-12T18:20:06.681Z"
        }
      },
      {
        "idProductPersonalization": 3,
        "idUserAdded": 1,
        "idProduct": 1,
        "idPersonalization": 3,
        "status": true,
        "personalization": {
          "idPersonalization": 3,
          "idUserAdded": 1,
          "name": "Sin Gluten",
          "status": true,
          "createdAt": "2025-03-12T18:20:06.681Z"
        }
      }
    ]
  }
}
```

**Errores Posibles:**

- 400: Producto no encontrado
- 401: Token no proporcionado
- 403: Usuario no es administrador
- 500: Error del servidor

### 8.4 Cambiar status activo o inactivo de la Personalización de Producto

**PUT /api/admin/products/{idProduct}/personalization/{idProductPersonalization}**

Cambia el estado de activo o inactivo de personalización para un producto específico.

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| idProduct | number | ID del producto |
| idProductPersonalization | number | ID de la personalizacion del producto |

**Cuerpo de la Petición:**

```json
{
  "status": true
}
```

**Validaciones:**

- status: Boolean requerido

**Respuesta Exitosa (200):**

```json
{
  "message": "Estado de personalización actualizado correctamente",
  "data": {
    "personalization": {
      "idProductPersonalization": 1,
      "idUserAdded": 1,
      "idProduct": 1,
      "idPersonalization": 1,
      "status": false,
      "personalization": {
        "idPersonalization": 1,
        "idUserAdded": 1,
        "name": "Sin Cebolla",
        "status": true,
        "createdAt": "2025-03-12T18:20:06.681Z"
      }
    }
  }
}
```

**Errores Posibles:**

- 400: Producto no encontrado
- 400: Datos de personalización inválidos
- 401: Token no proporcionado
- 403: Usuario no es administrador
- 500: Error del servidor

### 8.5 Obtner ordenes activas con paginacion

**GET /api/admin/orders/current**

Permite a administradores obtener pedidos activos de todos los usuarios con paginación.

**Encabezados Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros de Consulta:**

```
page: Número de página (default: 1)
limit: Resultados por página (default: 10)
```

**Respuesta (200 OK):**

```json
{
  "message": "Órdenes en curso obtenidas correctamente",
  "data": {
    "orders": [
      {
        "idOrder": 4,
        "idCart": 4,
        "idPaymentType": 1,
        "idShipmentType": 1,
        "idOrderStatus": 1,
        "idLocation": 1,
        "createdAt": "2025-04-07T18:39:42.015Z",
        "deliveryAt": null,
        "totalPrice": 447,
        "paid": false,
        "paidAt": null,
        "stripePaymentIntentId": null,
        "stripePaymentStatus": null,
        "orderStatus": {
          "idOrderStatus": 1,
          "status": "Pendiente"
        },
        "paymentType": {
          "idPaymentType": 1,
          "type": "Efectivo"
        },
        "shipmentType": {
          "idShipmentType": 1,
          "type": "Envío a domicilio"
        },
        "location": {
          "street": "Av. Luis Encinas",
          "houseNumber": "10",
          "postalCode": "83000",
          "neighborhood": "Centro"
        },
        "locationFormatted": "Av. Luis Encinas, 10\nCentro\n83000"
      },
      {
        "idOrder": 3,
        "idCart": 3,
        "idPaymentType": 1,
        "idShipmentType": 1,
        "idOrderStatus": 1,
        "idLocation": 1,
        "createdAt": "2025-04-07T18:39:32.319Z",
        "deliveryAt": null,
        "totalPrice": 447,
        "paid": false,
        "paidAt": null,
        "stripePaymentIntentId": null,
        "stripePaymentStatus": null,
        "orderStatus": {
          "idOrderStatus": 1,
          "status": "Pendiente"
        },
        "paymentType": {
          "idPaymentType": 1,
          "type": "Efectivo"
        },
        "shipmentType": {
          "idShipmentType": 1,
          "type": "Envío a domicilio"
        },
        "location": {
          "street": "Av. Luis Encinas",
          "houseNumber": "10",
          "postalCode": "83000",
          "neighborhood": "Centro"
        },
        "locationFormatted": "Av. Luis Encinas, 10\nCentro\n83000"
      }
    ],
    "pagination": {
      "totalItems": 4,
      "totalPages": 2,
      "currentPage": 1,
      "itemsPerPage": 2
    }
  }
}
```

**Notas:**

- Los pedidos se ordenan por fecha de creación (más recientes primero)
- Se consideran como ordenes activas, todas aquellas donde su "status" se diferente de "Entregado" o "Cancelado".

**Errores Posibles:**

- 401: Token no proporcionado
- 500: Error del servidor

### 8.6 Obtner historico de ordenes con paginacion

**GET /api/admin/orders**

Permite a administradores obtener pedidos historicos de todos los usuarios con paginación.

**Encabezados Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros de Consulta:**

```
page: Número de página (default: 1)
limit: Resultados por página (default: 10)
```

**Respuesta (200 OK):**

```json
{
  "message": "Historial de órdenes obtenido correctamente",
  "data": {
    "orders": [
      {
        "idOrder": 5,
        "idCart": 5,
        "idPaymentType": 1,
        "idShipmentType": 1,
        "idOrderStatus": 7,
        "idLocation": 1,
        "createdAt": "2025-04-07T18:39:49.656Z",
        "deliveryAt": null,
        "totalPrice": 447,
        "paid": false,
        "paidAt": null,
        "stripePaymentIntentId": null,
        "stripePaymentStatus": null,
        "orderStatus": {
          "idOrderStatus": 7,
          "status": "Cancelado"
        },
        "paymentType": {
          "idPaymentType": 1,
          "type": "Efectivo"
        },
        "shipmentType": {
          "idShipmentType": 1,
          "type": "Envío a domicilio"
        },
        "location": {
          "street": "Av. Luis Encinas",
          "houseNumber": "10",
          "postalCode": "83000",
          "neighborhood": "Centro"
        },
        "locationFormatted": "Av. Luis Encinas, 10\nCentro\n83000"
      }
    ],
    "pagination": {
      "totalItems": 1,
      "totalPages": 1,
      "currentPage": 1,
      "itemsPerPage": 5
    }
  }
}
```

**Notas:**

- Los pedidos se ordenan por fecha de creación (más recientes primero)
- Se consideran como ordenes historicas, todas aquellas donde su "status" sea "Entregado" o "Cancelado".

**Errores Posibles:**

- 401: Token no proporcionado
- 500: Error del servidor

### 8.7 Obtner orodenes filtradas por productos

** GET /api/admin/orders/by-products **

Permite a administradores obtener pedidos de todos los usuarios filtrando por productos, con orden descendente.

**Encabezados Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros de Consulta:**

```
product_id: ID de los productos
```

**Respuesta (200 OK):**
[
    {
        "idOrder": 1,
        "idCart": 1,
        "idPaymentType": 1,
        "idShipmentType": 1,
        "idOrderStatus": 1,
        "idLocation": 1,
        "createdAt": "2025-04-29T20:18:58.341Z",
        "deliveryAt": null,
        "totalPrice": 719.94,
        "shipmentValue": 0,
        "paid": false,
        "paidAt": null,
        "stripePaymentIntentId": null,
        "stripeClientSecret": null,
        "stripePaymentStatus": null,
        "cart": {
            "idCart": 1,
            "idUser": 2,
            "status": false,
            "createdAt": "2025-04-29T20:18:38.253Z",
            "itemsCart": [
                {
                    "idItemCart": 1,
                    "idCart": 1,
                    "idProduct": 1,
                    "quantity": 3,
                    "individualPrice": 89.99,
                    "status": true,
                    "product": {
                        "idProduct": 1,
                        "idProductType": 1,
                        "idUserAdded": 1,
                        "name": "Hamburguesa Clásica",
                        "description": "Hamburguesa con carne, lechuga, tomate y queso",
                        "price": 89.99,
                        "status": true,
                        "createdAt": "2025-04-29T20:17:37.039Z"
                    }
                },
                {
                    "idItemCart": 2,
                    "idCart": 1,
                    "idProduct": 2,
                    "quantity": 3,
                    "individualPrice": 149.99,
                    "status": true,
                    "product": {
                        "idProduct": 2,
                        "idProductType": 1,
                        "idUserAdded": 1,
                        "name": "Pizza Pepperoni",
                        "description": "Pizza con pepperoni, queso y salsa de tomate",
                        "price": 149.99,
                        "status": true,
                        "createdAt": "2025-04-29T20:17:37.039Z"
                    }
                }
            ]
        },
        "paymentType": {
            "idPaymentType": 1,
            "type": "Efectivo"
        },
        "shipmentType": {
            "idShipmentType": 1,
            "type": "Envío a domicilio"
        },
        "orderStatus": {
            "idOrderStatus": 1,
            "status": "Pendiente"
        },
        "location": {
            "idLocation": 1,
            "idUserInformation": 1,
            "street": "Nouvel",
            "houseNumber": "18",
            "postalCode": "83288",
            "neighborhood": "Jardines de Mónaco",
            "status": true
        },
        "locationFormatted": "Nouvel, 18\nJardines de Mónaco\n83288"
    }
] 

**Errores Posibles:**
- 401: Token no proporcionado
- 500: Error del servidor

### 8.8 Permisos de Administrador

Para acceder a los endpoints de administrador, el usuario debe:

1. Estar autenticado (token JWT válido)
2. Tener tipo de usuario administrador (idUserType === 1)

**Respuesta de Error de Permisos (403):**

```json
{
  "message": "Acceso denegado. Se requieren permisos de administrador."
}
```

### 8.9 Consideraciones Técnicas

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
  "description": "Nueva descripción",
  "price": 109.99
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
    "price": 109.99,
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

### 10.4 Listar de productos sin paginacion ( Administrador y Cliente )

**GET /products**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
**_Adminstrador_**

```json
{
  "message": "Productos obtenidos correctamente",
  "data": {
    "products": [
      {
        "idProduct": 1,
        "idProductType": 1,
        "idUserAdded": 1,
        "name": "Hamburguesa Clásica",
        "description": "Hamburguesa con carne, lechuga, tomate y queso",
        "price": 89.99,
        "status": true,
        "createdAt": "2025-03-08T02:01:04.163Z"
      }
    ]
  }
}
```

**Respuesta Exitosa (200):**
**_Cliente_**

```json
{
  "message": "Productos obtenidos correctamente",
  "data": {
    "products": [
      {
        "idProduct": 1,
        "idProductType": 1,
        "name": "Hamburguesa Clásica",
        "description": "Hamburguesa con carne, lechuga, tomate y queso",
        "price": 89.99,
        "status": true,
        "createdAt": "2025-03-08T02:01:04.163Z"
      }
    ]
  }
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 404: No se encontraron productos
- 500: Error del servidor

### 10.5 Agregar productos directamente al carrito

**PUT /cart/items/{id}**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros URL:**

- id: ID del producto a agregar al carrito

**Cuerpo de la Petición:**

```json
{
  "quantity": 3
}
```

**Respuesta Exitosa (201):**

```json
{
  "message": "Producto agregado al carrito",
  "cartId": 1,
  "item": {
    "idItemCart": 2,
    "idCart": 1,
    "idProduct": 3,
    "quantity": 2,
    "individualPrice": 25,
    "status": true
  }
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: Error de solicitud
- 404: Producto no encontrado
- 406: El carrito no puede contener mas de 30 productos
- 500: Error del servidor

### 10.6 Agregar un solo un producto directamente al carrito

**PUT /cart/items/addOneItem/{id}**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta Exitosa (201):**

```json
{
  "message": "Cantidad del producto actualizada en el carrito",
  "cartId": 1,
  "item": {
    "idItemCart": 1,
    "idCart": 1,
    "idProduct": 1,
    "quantity": 1,
    "individualPrice": 89,
    "status": true
  }
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: Error de solicitud
- 403: El producto esta inactivo y no se puede agregar al carrito
- 404: Producto no encontrado
- 406: El carrito no puede contener mas de 30 productos
- 500: Error del servidor

### 10.7 Agregar producto al carrito de compras con perosnzonalizaciones 

**PUT /api/cart/items/new/{id}**

Permite agregar productos al carrito de compras con o sin personalizaciones. 
- Si el producto ya existe en el carrito con las mismas personalizaciones, se actualiza la cantidad.

**Headers Requeridos:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parámetros URL:**

| Parámetro | Tipo   | Descripción        |
|-----------|--------|--------------------|
| id        | number | ID del producto    |

**Cuerpo de la solicitud (JSON):**
```json
{
  "quantity": 2,
  "personalizations": [1, 2, 3]
}
```

- `quantity`: (obligatorio) número entero mayor a 0.
- `personalizations`: (opcional) arreglo de IDs de personalizaciones : `idProductPersonalization`  (enteros). Puede estar vacío.

**Respuesta Exitosa (201):**
```json
{
  "cartId": 1,
  "item": {
    "idItemCart": 1,
    "idCart": 1,
    "idProduct": 1,
    "quantity": 2,
    "individualPrice": 89.99,
    "status": true
  },
  "updated": false
}
```

**Errores Posibles:**

- 400: Error en los datos enviados (IDs no válidos, campos incorrectos)
- 401: Token no proporcionado
- 403: El producto está inactivo y no se puede agregar al carrito
- 404: Producto no encontrado
- 406: El carrito no puede contener más de 30 productos
- 500: Error del servidor

### 10.8 Modificar cantidad de un producto en el carrito

**PUT /cart/items/{id}**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros URL:**

- id: ID del producto a modificar la cantidad en el carrito

**Respuesta Exitosa (201):**

```json
{
  "message": "Cantidad del producto actualizada en el carrito",
  "cartId": 2,
  "item": {
    "idItemCart": 4,
    "idCart": 2,
    "idProduct": 1,
    "quantity": 3,
    "individualPrice": 89,
    "status": true
  }
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: Error de solicitud
- 404: Producto no encontrado
- 406: El carrito no puede contener mas de 30 productos
- 500: Error del servidor

### 10.9 Eliminar un producto en el carrito

**DELETE /cart/items/{id}**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros URL:**

- id: ID del producto a eliminar en el carrito

**Respuesta Exitosa (200):**

```json
{
  "message": "Producto eliminado del carrito",
  "cartId": 1,
  "item": {
    "idItemCart": 1,
    "idCart": 1,
    "idProduct": 1,
    "quantity": 3,
    "individualPrice": 89,
    "status": false
  }
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: Error de peticion
- 403: Esta producto ya ha sido desactivado en el carrito o este no existe en carrito.
- 500: Error del servidor

**Notas\***

- El campo `quantity` es fijado en 0 despues de la eliminacion logica.

### 10.10 Ver productos en el carrito

**GET /cart/**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**

```json
{
  "items": {
    "cartId": 1,
    "items": [
      {
        "idItemCart": 1,
        "idCart": 1,
        "idProduct": 1,
        "quantity": 3,
        "individualPrice": 89,
        "status": true,
        "product": {
          "idProduct": 1,
          "idProductType": 1,
          "idUserAdded": 1,
          "name": "Hamburguesa Clásica",
          "description": "Hamburguesa con carne, lechuga, tomate y queso",
          "price": 89.99,
          "status": true,
          "createdAt": "2025-03-10T04:58:13.074Z"
        }
      }
    ]
  }
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: Error de peticion
- 500: Error del servidor

### 10.11 Obenter ultima instancia `itemCart` generada  en el carrito de compras, para un producto especifico.

Obtiene el último `itemCart` (registro más reciente) para un producto específico dentro del carrito activo del usuario. Incluye personalizaciones activas si existen.

**GET /api/cart/items/last/{id}**

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
  "cartId": 1,
  "item": {
    "idItemCart": 1,
    "idCart": 1,
    "idProduct": 1,
    "quantity": 2,
    "individualPrice": 89.99,
    "status": true,
    "name": "Hamburguesa Clásica",
    "userProductPersonalize": [
      {
        "idUserProductPersonalize": 1,
        "idItemCart": 1,
        "idProductPersonalization": 1,
        "status": true,
        "personalization": {
          "idPersonalization": 1,
          "name": "Sin cebolla"
        }
      },
      {
        "idUserProductPersonalize": 2,
        "idItemCart": 1,
        "idProductPersonalization": 2,
        "status": true,
        "personalization": {
          "idPersonalization": 2,
          "name": "Extra queso"
        }
      }
    ]
  }
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: Error de peticion
- 500: Error del servidor



### 10.12 Ver monto total de productos en el carrito

**GET /cart/total**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**

```json
{
  "totalAmount": {
    "cartId": 1,
    "totalAmount": 416.00
  }
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: Error de peticion
- 500: Error del servidor

### 10.13 Ver cantidad total de productos en el carrito

**GET /cart/quantity**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**

```json
{
  "totalQuantity": {
    "cartId": 1,
    "totalQuantity": 5
  }
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: Error de peticion
- 500: Error del servidor

### 10.14 Desactivar un carrito activo

**PUT /api/cart/disable**

Desactiva el carrito activo del usuario autenticado, cambiando su estado a inactivo (status = false).

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**

```json
{
  "message": "Carrito desactivado exitosamente",
  "cartId": 1,
  "status": false
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 404: No se encontró un carrito activo para el usuario
- 400: Error en la peticion
- 500: Error del servidor

**Notas:**

- Este endpoint permite desactivar un carrito completo, lo que puede ser útil cuando se completa una compra o se quiere iniciar un carrito nuevo
- El carrito desactivado se mantiene en la base de datos pero no aparecerá en las consultas de carritos activos

### 10.15 Obtener productos del carrito por ID

**GET /cart/{id}**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros URL:**

- id: ID del producto a eliminar en el carrito

**Respuesta Exitosa (200):**

```json
{
  "message": "Carrito obtenido correctamente",
  "data": {
    "idCart": 1,
    "idUser": 1,
    "status": true,
    "items": [
      {
        "idItemCart": 1,
        "idCart": 1,
        "idProduct": 2,
        "quantity": 2,
        "individualPrice": 149,
        "status": true,
        "product": {
          "idProduct": 2,
          "idProductType": 1,
          "idUserAdded": 1,
          "name": "Pizza Pepperoni",
          "description": "Pizza con pepperoni, queso y salsa de tomate",
          "price": 149.99,
          "status": true,
          "createdAt": "2025-04-11T05:12:42.992Z"
        }
      }
    ]
  }
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: Error de peticion
- 403: No tienes permiso para ver este carrito
- 500: Error del servidor

**Notas:**

- Los usuario administradores pueden consultar cualquier carrito por ID
- Los usuario cliente puende consultar cualquier carrito por ID miestra les pernesca

### 10.16 Obtener carritos de un usuario por ID

- Permite obtener todos lo carrito existentes que pertenescan a un usuario especifico
- Para usarios administradores

**GET /api/admin/cart/user/{id}**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros URL:**

- id: ID del usuario del cual se busca obtener sus carritos

**Respuesta Exitosa (200):**

```json
{
  "message": "Carritos del usuario 2 obtenidos correctamente",
  "data": [
    {
      "idCart": 2,
      "idUser": 2,
      "status": true,
      "createdAt": "2025-04-11T17:24:39.685Z",
      "itemsCart": [
        {
          "idItemCart": 3,
          "idCart": 2,
          "idProduct": 1,
          "quantity": 1,
          "individualPrice": 89,
          "status": true,
          "product": {
            "idProduct": 1,
            "idProductType": 1,
            "idUserAdded": 1,
            "name": "Hamburguesa Clásica",
            "description": "Hamburguesa con carne, lechuga, tomate y queso",
            "price": 89.99,
            "status": true,
            "createdAt": "2025-04-11T17:24:17.404Z"
          }
        }
      ]
    }
  ]
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: Error de peticion
- 403: Usuario no es adminstrador
- 500: Error del servidor

**Notas:**

- Los usuario administradores pueden consultar cualquier listado de carritos por ID

### 10.17 Obtener carritos pertenecientes a un usuario autenticado

- Permite obtener todos lo carrito existentes que pertenescan a un usuario especifico
- Para usarios administradores

**GET /api/cart/user**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**

```json
{
  "message": "Carritos del usuario autenticado obtenidos correctamente",
  "data": [
    {
      "idCart": 2,
      "idUser": 2,
      "status": true,
      "createdAt": "2025-04-11T17:24:39.685Z",
      "itemsCart": [
        {
          "idItemCart": 3,
          "idCart": 2,
          "idProduct": 1,
          "quantity": 1,
          "individualPrice": 89,
          "status": true,
          "product": {
            "idProduct": 1,
            "idProductType": 1,
            "idUserAdded": 1,
            "name": "Hamburguesa Clásica",
            "description": "Hamburguesa con carne, lechuga, tomate y queso",
            "price": 89.99,
            "status": true,
            "createdAt": "2025-04-11T17:24:17.404Z"
          }
        }
      ]
    }
  ]
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: Error de peticion
- 500: Error del servidor

**Notas:**

- Los usuario administradores pueden consultar cualquier listado de carritos por ID

### 10.18 Obtener imagen de un producto

**GET /api/products/:id/image**

Obtiene la imagen de un producto específico.

**Parámetros URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | number | ID del producto |

**Respuesta Exitosa:**

- Devuelve directamente el archivo de imagen

**Errores Posibles:**

- 400: ID de producto inválido
- 404: Producto no encontrado
- 404: Este producto no tiene una imagen
- 404: Imagen no encontrada en el servidor
- 500: Error al obtener la imagen del producto

### 10.19 Subir imagen de un producto (Admin)

**POST /api/admin/products/:id/image**

Sube una imagen para un producto específico.

**Headers Requeridos:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Parámetros URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | number | ID del producto |

**Cuerpo de la Petición:**

- `productImage`: Archivo de imagen (jpeg, jpg, png, webp)

**Ejemplo de uso con Postman:**

1. Seleccionar método POST
2. Ingresar la URL: `http://localhost:3000/api/admin/products/:id/image`
3. En la pestaña "Headers":
   - Authorization: Bearer <your_token>
4. En la pestaña "Body":
   - Seleccionar "form-data"
   - Agregar un campo con Key: "productImage"
   - Cambiar el tipo de "Text" a "File"
   - Seleccionar el archivo de imagen

**Respuesta Exitosa (200):**

```json
{
  "message": "Imagen subida correctamente",
  "product": {
    "idProduct": 1,
    "name": "Nombre del Producto",
    "imageUrl": "/uploads/products/product-1.jpg"
  }
}
```

**Errores Posibles:**

- 400: ID de producto inválido
- 400: No se ha subido ninguna imagen
- 400: Campo de imagen incorrecto (debe ser 'productImage')
- 400: Solo se permiten archivos de imagen (jpeg, jpg, png, webp)
- 400: Tamaño de archivo excede el límite (5MB)
- 404: Producto no encontrado
- 401: Token no proporcionado
- 403: Usuario no es administrador
- 500: Error al subir la imagen del producto

### 10.20 Buscar productos

**GET /api/products/search**

Busca productos con filtros y paginación.

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros de Query:**
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| name | string | Nombre del producto (búsqueda parcial) | ?name=hamburguesa |
| type | string | Tipo de producto | ?type=Comida |
| minPrice | number | Precio mínimo | ?minPrice=50 |
| maxPrice | number | Precio máximo | ?maxPrice=200 |
| status | boolean | Estado del producto (solo admin) | ?status=true |
| page | number | Número de página (default: 1) | ?page=1 |
| limit | number | Productos por página (default: 10) | ?limit=20 |

**Ejemplos de uso:**

```
/api/products/search?name=hamburguesa&type=Comida&minPrice=50&maxPrice=200
/api/products/search?page=2&limit=20
/api/products/search?type=Bebida&status=true
```

**Respuesta Exitosa (200):**

```json
{
  "message": "Productos encontrados",
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
    "pagination": {
      "totalItems": 50,
      "totalPages": 5,
      "currentPage": 1,
      "itemsPerPage": 10
    }
  }
}
```

**Notas:**

- Los usuarios no administradores solo verán productos activos (status = true)
- Los administradores pueden ver todos los productos y filtrar por status
- La búsqueda por nombre es insensible a mayúsculas/minúsculas
- La búsqueda por nombre es parcial (contiene)
- Los precios deben ser números positivos
- El orden es alfabético por nombre

**Errores Posibles:**

- 400: Parámetros de filtro inválidos
- 401: Token no proporcionado
- 500: Error del servidor

### 10.21 Obtener Productos Populares

**GET /api/products/popular**

Obtiene una lista de los productos más populares basados en la cantidad de veces que han sido agregados a carritos.

**Parámetros de Query:**

```
limit: Número de productos a retornar (default: 5)
```

**Respuesta Exitosa (200):**

```json
{
  "message": "Productos populares obtenidos correctamente",
  "data": {
    "products": [
      {
        "idProduct": 1,
        "name": "Hamburguesa Clásica",
        "description": "Hamburguesa con carne, lechuga y tomate",
        "price": 120.0,
        "status": true,
        "productType": {
          "type": "Comida"
        },
        "popularity": 25
      }
      // ... más productos
    ]
  }
}
```

**Notas:**

- Solo retorna productos activos (status = true)
- El campo "popularity" indica cuántas veces el producto ha sido agregado a carritos
- Los productos están ordenados por popularidad de mayor a menor
- Se requiere autenticación

**Errores Posibles:**

- 401: Token no proporcionado
- 500: Error del servidor

### 10.22 Obetner detalles del producto por ID

**GET /products/{id}**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros URL:**

- id: ID del producto a consultar

**Respuesta Exitosa (200):**
**_Adminstrador_**

```json
{
    "message": "Producto obtenido correctamente",
    "data": {
        {
            "idProduct": 1,
            "idProductType": 1,
            "idUserAdded": 1,
            "name": "Hamburguesa Clásica",
            "description": "Hamburguesa con carne, lechuga, tomate y queso",
            "price": 89.99,
            "status": true,
            "createdAt": "2025-03-08T02:01:04.163Z"
        }
    }
}

```

**Respuesta Exitosa (200):**
**_Cliente_**

```json
{
    "message": "Producto obtenido correctamente",
    "data": {
        {
            "idProduct": 1,
            "idProductType": 1,
            "name": "Hamburguesa Clásica",
            "description": "Hamburguesa con carne, lechuga, tomate y queso",
            "price": 89.99,
            "status": true,
            "createdAt": "2025-03-08T02:01:04.163Z"
        }
    }
}

```

**Errores Posibles:**

- 401: Token no proporcionado
- 404: No se encontro el producto
- 500: Error del servidor

### 10.23 Asginar Personalización a un Producto en el Carrito de compras.

**PUT /api/products/cart/items/personalizations**

Asigna personalizaciones disponibles del catalogo de cuztomizaciones para un producto especifico a un articulo añadido al carrito de compras.

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Cuerpo de la Petición:**

```json
{
    "idItemCart":2, 
    "idProductPersonalization":5
}
```

**Validaciones:**

- idItemCart": valor numerico requerido 
- idProductPersonalization:valor numerico requerido

**Respuesta Exitosa (200):**

```json
{
    "message": "Personalización asignada correctamente al producto del carrito",
    "data": {
        "idUserProductPersonalize": 1,
        "idItemCart": 1,
        "idProductPersonalization": 1,
        "status": true,
        "productPersonalization": {
            "idProductPersonalization": 1,
            "idUserAdded": 1,
            "idProduct": 1,
            "idPersonalization": 1,
            "status": true
        },
        "itemCart": {
            "idItemCart": 1,
            "idCart": 1,
            "idProduct": 1,
            "quantity": 1,
            "individualPrice": 89,
            "status": true
        }
    }
}

```

**Errores Posibles:**

- 400: ID inválido
- 400: Datos de personalización inválidos
- 401: Token no proporcionado
- 403: No puedes modificar este producto del carrito
- 403: La personalización no corresponde al producto del carrito
- 404: La personalización no fue encontrada
- 500: Error del servidor

**NOTAS** 

- Se valida que el producto en el carrito pertenesca al usuario.
- Las personalizaciones a asignar, deben estan disponibles para el producto.

### 10.24 Obtner Personalizaciónes disponibles para un Producto.

**GET /api/products/{id}/user/personalizations**

Obtiene los detalles de las personalizaciónes que se ecuentran disponibles a asginar para un producto específico.

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
  "message": "Personalizaciones obtenidas correctamente",
  "data": {
    "personalizations": [
      {
        "idProductPersonalization": 1,
        "idProduct": 1,
        "status": true,
        "personalization": {
          "idPersonalization": 1,
          "name": "Sin Cebolla",
          "createdAt": "2025-03-20T23:40:57.273Z"
        }
      },
      {
        "idProductPersonalization": 2,
        "idProduct": 1,
        "status": true,
        "personalization": {
          "idPersonalization": 2,
          "name": "Extra Queso",
          "createdAt": "2025-03-20T23:40:57.273Z"
        }
      },
      {
        "idProductPersonalization": 3,
        "idProduct": 1,
        "status": true,
        "personalization": {
          "idPersonalization": 3,
          "name": "Sin Gluten",
          "createdAt": "2025-03-20T23:40:57.273Z"
        }
      }
    ]
  }
}
```

**Errores Posibles:**

- 400: Producto no encontrado
- 401: Token no proporcionado
- 500: Error del servidor

### 10.25 Obtner Personalizaciónes de Producto especifico en el Carrito de compras.

**GET api/cart/items/personalizations/{:idItemCart}**

Obtiene la lista de las personalizaciónes asignadas para un producto en el carrito.

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| idItemCart | number | ID del producto en el carrito |

**Respuesta Exitosa (200):**

```json
{
    "message": "Personalizaciones recuperadas correctamente",
    "data": [
        {
            "idUserProductPersonalize": 1,
            "idItemCart": 1,
            "idProductPersonalization": 5,
            "status": true,
            "productPersonalization": {
                "idProductPersonalization": 5,
                "idUserAdded": 1,
                "idProduct": 2,
                "idPersonalization": 2,
                "status": true,
                "personalization": {
                    "idPersonalization": 2,
                    "name": "Extra Queso",
                    "status": true
                }
            },
            "itemCart": {
                "idItemCart": 1,
                "idCart": 1,
                "idProduct": 2,
                "quantity": 1,
                "individualPrice": 149,
                "status": true
            }
        }
    ]
}
```

**Errores Posibles:**

- 400: ID inválido
- 401: Token no proporcionado
- 404: Producto del carrito no encontrado
- 500: Error del servidor

### 10.26 Cambiar status activo o inactivo de la Personalización asignada a un Producto en el carrito de compras

**PACTH api/cart/items/personalizations/:idUserProductPersonalize/status**

Cambia el estado de activo o inactivo de personalización asiginada para un producto específico en el carrito.

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| idProduct | number | ID del producto |
| idUserProductPersonalize | number | ID de la personalizacion del producto en el carrito de compras |

**Cuerpo de la Petición:**

```json
{
  "status": true
}
```

**Validaciones:**

- status: Boolean requerido

**Respuesta Exitosa (200):**

```json
{
    "message": "Personalización desactivada correctamente",
    "data": {
        "idUserProductPersonalize": 2,
        "idItemCart": 2,
        "idProductPersonalization": 5,
        "status": true
    }
}
```

**Errores Posibles:**

- 400: Producto no encontrado
- 400: Datos de personalización inválidos
- 401: Token no proporcionado
- 403: No puedes modificar esta personalización
- 500: Error del servidor

**NOTAS**
- Se valida que la personalizacion pertesca al usuario

## 11. ENDPOINTS DE DIRECCIONES

### 11.1 Agrega una nueva dirección

**POST /api/shipping-address**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Cuerpo de la Petición:**

```json
{
  "street": "Av. Luis Encinas Jhonson",
  "houseNumber": "10",
  "postalCode": "83000",
  "neighborhood": "Centro"
}
```

**Respuesta Exitosa (201):**

```json
{
  "message": "Dirección añadida correctamente",
  "data": {
    "idLocation": 2,
    "idUserInformation": 2,
    "street": "Av. Luis Encinas Jhonson",
    "houseNumber": "10",
    "postalCode": "83000",
    "neighborhood": "Centro",
    "status": true
  }
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: Error de solicitud
- 500: Error del servidor

### 11.2 Obtener todas las direcciones activas del usuario

**GET /api/shipping-address**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**

```json
{
  "message": "Direcciones obtenidas correctamente",
  "data": [
    {
      "idLocation": 2,
      "idUserInformation": 2,
      "street": "Av. Luis Encinas Jhonson",
      "houseNumber": "10",
      "postalCode": "83000",
      "neighborhood": "Centro",
      "status": true
    },
    {
      "idLocation": 3,
      "idUserInformation": 2,
      "street": "Calle Principal",
      "houseNumber": "22",
      "postalCode": "83100",
      "neighborhood": "Valle Verde",
      "status": true
    }
  ]
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: Usuario no autorizado o inactivo
- 500: Error del servidor

### 11.3 Obtener todas las direcciones registradas del usuario

**GET /api/shipping-address/all**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**

```json
{
    "message": "Direcciones obtenidas correctamente",
    "data": [
        {
            "idLocation": 2,
            "idUserInformation": 2,
            "street": "Av. Luis Encinas Jhonson",
            "houseNumber": "10",
            "postalCode": "83000",
            "neighborhood": "Centro",
            "status": true
        },
        {
            "idLocation": 3,
            "idUserInformation": 2,
            "street": "Av. Luis Encinas Jhonson",
            "houseNumber": "11",
            "postalCode": "83000",
            "neighborhood": "Centro",
            "status": false
        }
    ]
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: Usuario no autorizado o inactivo
- 500: Error del servidor

### 11.4 Obtener una dirección por ID

**GET /api/shipping-address/:id**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros URL:**

- id: ID de la dirección a consultar

**Respuesta Exitosa (200):**

```json
{
  "message": "Dirección obtenida correctamente",
  "data": {
    "idLocation": 2,
    "idUserInformation": 2,
    "street": "Av. Luis Encinas Jhonson",
    "houseNumber": "10",
    "postalCode": "83000",
    "neighborhood": "Centro",
    "status": true
  }
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: Dirección no encontrada o no autorizada
- 500: Error del servidor

### 11.5 Obtener una dirección específica (compatibilidad)

**GET /api/shipping-address/single**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**

```json
{
  "message": "Dirección obtenida correctamente",
  "data": {
    "idLocation": 2,
    "idUserInformation": 2,
    "street": "Av. Luis Encinas Jhonson",
    "houseNumber": "10",
    "postalCode": "83000",
    "neighborhood": "Centro",
    "status": true
  }
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: No se encontró dirección activa para este usuario
- 500: Error del servidor

### 11.6 Obtener la ultima direccion dirección registrada del usuario

**GET /api/shipping-address/last**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**

```json
{
    "message": "Dirección obtenida correctamente",
    "data": {
        "idLocation": 2,
        "idUserInformation": 2,
        "street": "Av. Luis Encinas Jhonson",
        "houseNumber": "10",
        "postalCode": "83000",
        "neighborhood": "Centro",
        "status": true
    }
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: No se encontró dirección registrada para este usuario
- 500: Error del servidor

### 11.7 Actualizar una dirección

**PUT /api/shipping-address/:id**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros URL:**

- id: ID de la dirección a actualizar

**Cuerpo de la Petición:**

```json
{
  "street": "Calle Reforma",
  "houseNumber": "42A",
  "postalCode": "83200",
  "neighborhood": "Villa California"
}
```

**Respuesta Exitosa (200):**

```json
{
  "message": "Dirección actualizada correctamente",
  "data": {
    "idLocation": 2,
    "idUserInformation": 2,
    "street": "Calle Reforma",
    "houseNumber": "42A",
    "postalCode": "83200",
    "neighborhood": "Villa California",
    "status": true
  }
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: Error de validación de datos
- 403: Dirección no encontrada o sin permiso para modificar
- 500: Error del servidor

### 11.8 Eliminar una dirección

**DELETE /api/shipping-address/:id**

**Headers Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros URL:**

- id: ID de la dirección a eliminar

**Respuesta Exitosa (200):**

```json
{
  "message": "Dirección eliminada correctamente"
}
```

**Errores Posibles:**

- 401: Token no proporcionado
- 400: ID inválido
- 403: Dirección no encontrada o sin permiso para eliminar
- 500: Error del servidor

## 12. VALIDACIONES DE PRODUCTOS

### 12.1 Creación de Producto

- **idProductType**: Número entero positivo
- **name**: Mínimo 3 caracteres
- **description**: Mínimo 3 caracteres
- **price**: Número positivo
- **status**: Booleano

### 12.2 Actualización de Detalles

- **name**: (Opcional) Mínimo 3 caracteres
- **description**: (Opcional) Mínimo 3 caracteres
- Al menos uno de los campos debe estar presente

## 13. VALIDACIONES DE CARRITO

### 13.1 Añadir producto directamente al carrito

- **idProduct**: Número entero positivo
- **quantity**: Número entero positivo no superior a 100
- Ambos campos son obligatorios

### 13.2 Actualización de Cantidad

- **idProduct**: Número entero positivo
- **quantity**: Número entero positivo no superior a 100
- Ambos campos son obligatorios

## 14. ÓRDENES Y PAGOS

Para la documentación detallada sobre órdenes y pagos con Stripe, consulte:

- [Integración con Stripe](STRIPE.md)

## Endpoints de Pedidos

### 14.1 Crear Nuevo Pedido

**POST /api/orders**

Crea un nuevo pedido a partir del carrito activo del usuario.

**Encabezados Requeridos:**

```
Authorization: Bearer <token>
```

**Cuerpo de la Solicitud:**

```json
{
  "idPaymentType": 2, // 1=Efectivo, 2=Crédito, 3=Débito
  "idShipmentType": 1, // 1=Envío, 2=Recogida
  "idLocation": 3, // Opcional, requerido para envío
  "shipmentValue": 50 // Valor del envío que se sumará al total
}
```

**Respuesta (201 Creado):**

Para pagos con tarjeta (tipos 2, 3):

```json
{
  "order": {
    "idOrder": 42,
    "idCart": 23,
    "idPaymentType": 2,
    "idShipmentType": 1,
    "idOrderStatus": 1,
    "totalPrice": 308.0, // Incluye el valor de los productos (258) + envío (50)
    "shipmentValue": 50.0, // Valor del envío
    "paid": false,
    "createdAt": "2023-07-15T14:30:45Z",
    "stripePaymentIntentId": "pi_3MkVnL2eZvKYlo2C1IFrG8oM",
    "stripePaymentStatus": "requires_payment_method"
  },
  "paymentDetails": {
    "clientSecret": "pi_3MkVnL2eZvKYlo2C1IFrG8oM_secret_O0FjOJ1VGdEVbqrgmd1ikvPTq",
    "paymentIntentId": "pi_3MkVnL2eZvKYlo2C1IFrG8oM"
  }
}
```

Para pagos en efectivo (tipo 1):

```json
{
  "order": {
    "idOrder": 43,
    "idCart": 24,
    "idPaymentType": 1,
    "idShipmentType": 2,
    "idOrderStatus": 1,
    "totalPrice": 129.0, // No incluye valor de envío cuando es recogida
    "shipmentValue": 0.0, // Para recogida, el valor de envío es 0
    "paid": false,
    "createdAt": "2023-07-15T15:12:23Z"
  }
}
```

**Respuestas de Error:**

- 400: No hay productos en el carrito
- 400: Se requieren tipo de pago y tipo de envío
- 400: Valor de envío inválido
- 401: Token no proporcionado
- 500: Error del servidor

### 14.2 Obtener Pedidos del Usuario

**GET /api/orders**

Recupera todos los pedidos para el usuario autenticado.

**Encabezados Requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta (200 OK):**

```
[
  {
    "idOrder": 42,
    "totalPrice": 258.00,
    "paid": true,
    "paidAt": "2023-07-15T14:35:12Z",
    "createdAt": "2023-07-15T14:30:45Z",
    "deliveryAt": null,
    "orderStatus": {
      "idOrderStatus": 2,
      "status": "Procesando"
    },
    "paymentType": {
      "idPaymentType": 2,
      "type": "Tarjeta de crédito"
    },
    "shipmentType": {
      "idShipmentType": 1,
      "type": "Envío a domicilio"
    }
  },
  {
    "idOrder": 38,
    "totalPrice": 475.50,
    "paid": true,
    "paidAt": "2023-07-12T11:24:18Z",
    "createdAt": "2023-07-12T11:20:33Z",
    "deliveryAt": "2023-07-12T13:45:00Z",
    "orderStatus": {
      "idOrderStatus": 6,
      "status": "Entregado"
    },
    "paymentType": {
      "idPaymentType": 1,
      "type": "Efectivo"
    },
    "shipmentType": {
      "idShipmentType": 1,
      "type": "Envío a domicilio"
    }
  }
]
```

**Respuestas de Error:**

- 401: Token no proporcionado
- 500: Error del servidor

### 14.3 Obtener Detalles del Pedido

**GET /api/orders/:id**

Recupera información detallada sobre un pedido específico.

**Encabezados Requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta (200 OK):**

```
{
  "idOrder": 42,
  "idCart": 23,
  "totalPrice": 258.00,
  "paid": true,
  "paidAt": "2023-07-15T14:35:12Z",
  "createdAt": "2023-07-15T14:30:45Z",
  "deliveryAt": null,
  "stripePaymentIntentId": "pi_3MkVnL2eZvKYlo2C1IFrG8oM",
  "stripePaymentStatus": "succeeded",
  "orderStatus": {
    "idOrderStatus": 2,
    "status": "Procesando"
  },
  "paymentType": {
    "idPaymentType": 2,
    "type": "Tarjeta de crédito"
  },
  "shipmentType": {
    "idShipmentType": 1,
    "type": "Envío a domicilio"
  },
  "cart": {
    "idCart": 23,
    "idUser": 5,
    "createdAt": "2023-07-15T13:45:22Z",
    "itemsCart": [
      {
        "idItemCart": 57,
        "quantity": 2,
        "individualPrice": 129,
        "product": {
          "idProduct": 12,
          "name": "Tender Box",
          "description": "Exquisito paquete...",
          "price": 129
        }
      }
    ]
  }
}
```

**Respuestas de Error:**

- 400: Orden no encontrada
- 401: Token no proporcionado
- 500: Error del servidor

### 14.4 Buscar Pedidos con Filtros

**GET /api/orders/search**

Permite buscar y filtrar pedidos del usuario actualmente autenticado.

**Encabezados Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros de Consulta:**

```
startDate: Fecha inicial (formato ISO, ej: 2023-10-01)
endDate: Fecha final (formato ISO, ej: 2023-10-31)
orderStatus: ID del estado de la orden (1: Pendiente, 2: Procesando, etc.)
paid: Estado de pago (true/false)
paymentType: ID del tipo de pago (1: Efectivo, 2: Tarjeta de crédito, etc.)
shipmentType: ID del tipo de envío (1: Envío a domicilio, 2: Recoger en tienda, etc.)
minPrice: Precio mínimo
maxPrice: Precio máximo
page: Número de página (default: 1)
limit: Resultados por página (default: 10)
```

**Respuesta (200 OK):**

```json
{
  "message": "Pedidos encontrados",
  "data": {
    "orders": [
      {
        "idOrder": 42,
        "totalPrice": 258.0,
        "paid": true,
        "paidAt": "2023-07-15T14:35:12Z",
        "createdAt": "2023-07-15T14:30:45Z",
        "orderStatus": {
          "idOrderStatus": 2,
          "status": "Procesando"
        },
        "paymentType": {
          "idPaymentType": 2,
          "type": "Tarjeta de crédito"
        },
        "shipmentType": {
          "idShipmentType": 1,
          "type": "Envío a domicilio"
        }
      }
    ],
    "pagination": {
      "totalItems": 15,
      "totalPages": 2,
      "currentPage": 1,
      "itemsPerPage": 10
    }
  }
}
```

**Notas:**

- Los filtros son opcionales y se pueden combinar
- El rango de fechas filtra por la fecha de creación del pedido
- Los precios deben ser números positivos
- Los pedidos se ordenan por fecha de creación (más recientes primero)

**Errores Posibles:**

- 400: Parámetros de filtro inválidos (formato de fecha, valores numéricos, etc.)
- 401: Token no proporcionado
- 500: Error del servidor

## 14.5 Reodernar pedido

**PUT /api/orders/:idOrder**

Permite agregar productos de una orden ya existente al carrito de compras.

**Encabezados Requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros URL:**

- idOrder: ID de pedido existente a reodenar

**Respuesta Exitosa (200):**

```json
{
  "message": "Pedido reordenado correctamente, productos agregados al carrito",
  "data": {
    "cartId": 2,
    "items": [
      {
        "idProduct": 2,
        "quantity": 3,
        "individualPrice": 149.99,
        "status": true,
        "idCart": 2
      }
    ]
  }
}
```

**Notas:**

- Los productos existentes en el carrito de compras activo, son reemplados por los de los del pedido a reordenar.
- Se valida que si lo productos a reordenar son los mismos a los ya existentes el carrito de compras, no se efectuen cambios.

**Errores Posibles:**

- 401: Token no proporcionado
- 400: ID inválido
- 403: Orden no encontrada o sin permiso para eliminar
- 409: El carrito ya contiene los mismos productos
- 500: Error del servidor

### 14.6 Obtener Detalles de Pedidos perteneciantes a un usaurio.

**GET /api/orders/datails**

Recupera información detallada sobre pedidos correspondientes a un usuario autenticado.

**Encabezados Requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta (200 OK):**

```
[
    {
        "idOrder": 1,
        "idCart": 1,
        "idPaymentType": 1,
        "idShipmentType": 1,
        "idOrderStatus": 1,
        "idLocation": 1,
        "createdAt": "2025-04-13T22:09:19.812Z",
        "deliveryAt": null,
        "totalPrice": 149,
        "shipmentValue": 0,
        "paid": false,
        "paidAt": null,
        "stripePaymentIntentId": null,
        "stripeClientSecret": null,
        "stripePaymentStatus": null,
        "cart": {
            "idCart": 1,
            "idUser": 2,
            "status": false,
            "createdAt": "2025-04-13T22:09:09.499Z",
            "itemsCart": [
                {
                    "idItemCart": 1,
                    "idCart": 1,
                    "idProduct": 2,
                    "quantity": 1,
                    "individualPrice": 149,
                    "status": true,
                    "product": {
                        "idProduct": 2,
                        "idProductType": 1,
                        "idUserAdded": 1,
                        "name": "Pizza Pepperoni",
                        "description": "Pizza con pepperoni, queso y salsa de tomate",
                        "price": 149.99,
                        "status": true,
                        "createdAt": "2025-04-13T22:08:08.840Z"
                    }
                }
            ]
        },
        "paymentType": {
            "idPaymentType": 1,
            "type": "Efectivo"
        },
        "shipmentType": {
            "idShipmentType": 1,
            "type": "Envío a domicilio"
        },
        "orderStatus": {
            "idOrderStatus": 1,
            "status": "Pendiente"
        },
        "location": {
            "street": "Av. Luis Encinas",
            "houseNumber": "10",
            "postalCode": "83000",
            "neighborhood": "Centro"
        },
        "locationFormatted": "Av. Luis Encinas, 10\nCentro\n83000"
    }
]
```

**Respuestas de Error:**

- 400: Ordenes no encontradas
- 401: Token no proporcionado
- 500: Error del servidor


### 14.7 Webhook de Stripe

**POST /api/webhooks/stripe**

Recibe y procesa eventos de webhook de Stripe relacionados con intenciones de pago.

**Encabezados Requeridos:**

```
Content-Type: application/json
Stripe-Signature: <firma-generada-por-stripe>
```

**Cuerpo de la Solicitud:**
El cuerpo es un objeto de evento generado por Stripe. Aquí hay un ejemplo simplificado:

```json
{
  "id": "evt_1234567890",
  "object": "event",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "object": "payment_intent",
      "amount": 25800,
      "status": "succeeded"
    }
  }
}
```

**Respuesta (200 OK):**

```json
{
  "received": true,
  "type": "payment_intent.succeeded",
  "result": {
    "success": true,
    "order": {
      "idOrder": 42,
      "paid": true,
      "paidAt": "2023-07-15T16:45:22Z",
      "idOrderStatus": 2,
      "stripePaymentStatus": "succeeded"
    }
  }
}
```

**Eventos Procesados:**

| Tipo de Evento                  | Acción                                           |
| ------------------------------- | ------------------------------------------------ |
| `payment_intent.succeeded`      | Marca la orden como pagada y actualiza su estado |
| `payment_intent.payment_failed` | Marca la orden como fallida y crea notificación  |

**Errores Posibles:**

- 400: Firma de webhook inválida
- 400: Formato de evento inválido
- 500: Error al procesar el evento

**Notas:**

1. No se requiere autenticación con token para este endpoint ya que Stripe envia su propia firma.
2. El cuerpo de la petición debe estar en formato raw (no JSON parseado) para verificar la firma.
3. Requiere una clave secreta de webhook configurada en el .env para mayor seguridad.

```

## 15. NOTAS TÉCNICAS ADICIONALES

### 15.1 Paginación

- Implementada en listado de productos
- 5 productos por página
- Incluye total de páginas y página actual

### 15.2 Validaciones

- Uso de Zod para validación de datos
- Manejo de errores específicos por campo
- Transformación automática de tipos

### 15.3 Seguridad

- Verificación de roles para endpoints administrativos
- Validación de propiedad de recursos
- Sanitización de datos de entrada
```
