# Modelo de Datos

## Tablas Principales

### Users
| Campo | Tipo | Descripción |
|-------|------|-------------|
| idUser | Int (PK) | Identificador único |
| email | String (unique) | Correo electrónico |
| username | String (unique) | Nombre de usuario |
| password | String | Contraseña (hash pendiente) |
| status | Boolean | Estado de la cuenta |
| idUserType | Int (FK) | Tipo de usuario (1=normal, 2=admin) |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime? | Fecha de última actualización |

### UserInformation
| Campo | Tipo | Descripción |
|-------|------|-------------|
| idUserInformation | Int (PK) | Identificador único |
| idUser | Int (FK) | Referencia a Users (unique) |
| name | String | Nombre (en mayúsculas) |
| lastName | String | Apellido paterno (en mayúsculas) |
| secondLastName | String? | Apellido materno (opcional, en mayúsculas) |
| phone | String(10) | Teléfono (10 dígitos) |
| updatedAt | DateTime? | Fecha de última actualización |

### Location
| Campo | Tipo | Descripción |
|-------|------|-------------|
| idLocation | Int (PK) | Identificador único |
| idUserInformation | Int (FK) | Referencia a UserInformation |
| street | String(100) | Nombre de la calle |
| houseNumber | String(10) | Número exterior |
| postalCode | String(5) | Código postal |
| neighborhood | String(50) | Colonia/Fraccionamiento |
| status | Boolean | Estado de la dirección |

### Product
| Campo | Tipo | Descripción |
|-------|------|-------------|
| idProduct | Int (PK) | Identificador único |
| idProductType | Int (FK) | Tipo de producto |
| idUserAdded | Int (FK) | Usuario que agregó el producto |
| name | String | Nombre del producto |
| description | Text | Descripción detallada |
| price | Float | Precio unitario |
| status | Boolean | Estado del producto |
| createdAt | DateTime | Fecha de creación |

### Cart
| Campo | Tipo | Descripción |
|-------|------|-------------|
| idCart | Int (PK) | Identificador único |
| idUser | Int (FK) | Usuario dueño del carrito |
| status | Boolean | Estado del carrito |
| createdAt | DateTime | Fecha de creación |

### ItemCart
| Campo | Tipo | Descripción |
|-------|------|-------------|
| idItemCart | Int (PK) | Identificador único |
| idCart | Int (FK) | Carrito al que pertenece |
| idProduct | Int (FK) | Producto agregado |
| quantity | Int | Cantidad del producto |
| individualPrice | Int | Precio individual al momento de agregar |
| status | Boolean | Estado del item |

## Relaciones

### One-to-One
- User ↔ UserInformation

### One-to-Many
- UserType → User
- UserInformation → Location
- ProductType → Product
- User → Product (como creador)
- User → Cart
- Cart → ItemCart
- Product → ItemCart

## Consideraciones Técnicas

1. **Nombres de Tablas**:
   - Usar camelCase (ej: `itemCart`, `userType`)
   - MySQL es sensible a mayúsculas/minúsculas
   - Usar backticks en queries SQL

2. **Campos de Texto**:
   - Nombres y apellidos se almacenan en mayúsculas
   - Teléfono: Exactamente 10 dígitos
   - Contraseñas: Se hashearán antes de almacenar

3. **Índices**:
   - Únicos: email, username, idUser en UserInformation
   - Nombres: snake_case (ej: `user_email_key`)

4. **Operaciones**:
   - Usar transacciones Prisma
   - Validar datos antes de insertar/actualizar
   - Soft delete cuando sea posible (usar status)

5. **Timestamps**:
   - createdAt: Automático en nuevos registros
   - updatedAt: Automático en actualizaciones
   - Zona horaria: America/Hermosillo 