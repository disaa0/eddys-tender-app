# Reporte Técnico del Backend

## 1. Resumen Ejecutivo

### 1.1 Descripción General
Sistema backend para Eddy's Tender, una aplicación de gestión de pedidos de comida. Implementa autenticación JWT, gestión de usuarios, productos, carrito de compras y sistema de personalización de productos.

### 1.2 Stack Tecnológico Principal
- **Framework**: ExpressJS
- **Base de datos**: MySQL 8.0
- **ORM**: Prisma
- **Autenticación**: JWT
- **Validación**: Zod
- **Rate Limiting**: express-rate-limit (100 peticiones/15min)

## 2. Arquitectura del Sistema

### 2.1 Estructura de Directorios
```
backend/
├── src/
│   ├── config/          # Configuraciones JWT y crypto
│   ├── controllers/     # Controladores de rutas
│   ├── middleware/      # Auth y validación
│   ├── lib/            # Cliente Prisma
│   ├── routes/         # Definición de rutas
│   ├── services/       # Lógica de negocio
│   └── validators/     # Esquemas Zod
├── prisma/
│   ├── schema.prisma   # Modelo de datos
│   ├── migrations/     # Historial de cambios DB
│   └── seed.js        # Datos iniciales
└── docs/              # Documentación API
```

### 2.2 Configuración de Seguridad
```typescript
// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP'
});

// CORS
app.use(cors({
  origin: "http://localhost:8081",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

## 3. Sistema de Autenticación

### 3.1 Gestión de Usuarios
1. **Registro**
   ```typescript
   interface RegisterDto {
     email: string;      // Único
     username: string;   // Único
     password: string;   // Min 6 chars
     name: string;       // Mayúsculas
     lastName: string;   // Mayúsculas
     secondLastName?: string;
     phone: string;      // 10 dígitos
   }
   ```

2. **Login**
   ```typescript
   interface LoginResponse {
     message: string;
     user: {
       idUser: number;
       email: string;
       username: string;
       status: boolean;
       idUserType: number;
     };
     token: string;
   }
   ```

### 3.2 Seguridad
1. **Encriptación**
   ```javascript
   const crypto = require('crypto');
   const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
   const IV_LENGTH = 16;

   function encrypt(text) {
     const iv = crypto.randomBytes(IV_LENGTH);
     const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
     // ...
   }
   ```

2. **JWT**
   ```javascript
   const JWT_CONFIG = {
     secret: process.env.JWT_SECRET,
     expiresIn: '24h',
     algorithm: 'HS256'
   };
   ```

## 4. Modelo de Datos

### 4.1 Entidades Principales
1. **Users y Autenticación**
   ```prisma
   model User {
     idUser        Int      @id @default(autoincrement())
     email         String   @unique
     username      String   @unique
     password      String
     status        Boolean
     idUserType    Int
     createdAt     DateTime @default(now())
     updatedAt     DateTime? @updatedAt
     userType      UserType @relation(fields: [idUserType], references: [idUserType])
     information   UserInformation?
   }
   ```

2. **Productos y Personalización**
   ```prisma
   model Product {
     idProduct     Int      @id @default(autoincrement())
     name          String
     description   String   @db.Text
     price         Float
     status        Boolean
     idProductType Int
     idUserAdded   Int
     productType   ProductType @relation(fields: [idProductType], references: [idProductType])
     userAdded     User    @relation(fields: [idUserAdded], references: [idUser])
   }
   ```

### 4.2 Sistema de Pedidos
1. **Carrito y Items**
   ```prisma
   model Cart {
     idCart    Int      @id @default(autoincrement())
     idUser    Int
     status    Boolean
     createdAt DateTime @default(now())
     user      User     @relation(fields: [idUser], references: [idUser])
     items     ItemCart[]
     orders    Order[]
   }
   ```

2. **Órdenes y Notificaciones**
   ```prisma
   model Order {
     idOrder       Int      @id @default(autoincrement())
     totalPrice    Float
     paid          Boolean
     idOrderStatus Int
     orderStatus   OrderStatus @relation(fields: [idOrderStatus], references: [idOrderStatus])
     notifications Notification[]
   }
   ```

## 5. API REST

### 5.1 Endpoints de Autenticación
```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile
DELETE /api/auth/profile
PUT /api/auth/password
PUT /api/auth/email
```

### 5.2 Endpoints de Productos
```http
GET /api/products
GET /api/products/:id
POST /api/admin/products
PUT /api/admin/products/:id
PATCH /api/admin/products/:id/status
```

### 5.3 Validaciones
```typescript
const userSchema = z.object({
  username: z.string().min(3).max(12),
  email: z.string().email(),
  password: z.string()
    .min(6)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[@$!%*?&]/),
  phone: z.string().length(10).regex(/^\d+$/),
  name: z.string().transform(v => v.toUpperCase()),
  lastName: z.string().regex(/^[A-ZÁÉÍÓÚÑa-záéíóúñ\s]+$/)
});
```

## 6. Datos Iniciales (Seed)

### 6.1 Catálogos Base
1. **Tipos de Usuario**
   - Administrador (id: 1)
   - Cliente (id: 2)

2. **Tipos de Producto**
   - Comida
   - Bebidas
   - Extras
   - Postres

3. **Estados de Orden**
   - Pendiente
   - Procesando
   - Listo para recoger
   - Enviado
   - Entregado
   - Cancelado

### 6.2 Usuario Administrador
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
