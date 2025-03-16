# Reporte Técnico Integral - Eddy's Tender App

## 1. Resumen Ejecutivo

### 1.1 Descripción General
Sistema integral para Eddy's Tender, una aplicación de gestión de pedidos de comida. Implementa una arquitectura cliente-servidor con autenticación JWT, gestión de usuarios, productos, carrito de compras y sistema de personalización de productos.

### 1.2 Stack Tecnológico Principal

#### Backend
- **Framework**: ExpressJS
- **Base de datos**: MySQL 8.0
- **ORM**: Prisma
- **Autenticación**: JWT
- **Validación**: Zod
- **Rate Limiting**: express-rate-limit (100 peticiones/15min)

#### Frontend
- **Framework**: React Native (Expo)
- **Routing**: Expo Router
- **UI Components**: React Native Paper
- **Gestión de Estado**: Context API
- **Validación**: Zod
- **Estilos**: StyleSheet API

## 2. Arquitectura del Sistema

### 2.1 Estructura de Directorios

```
project-root/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuraciones JWT y crypto
│   │   ├── controllers/     # Controladores de rutas
│   │   ├── middleware/      # Auth y validación
│   │   ├── lib/            # Cliente Prisma
│   │   ├── routes/         # Definición de rutas
│   │   ├── services/       # Lógica de negocio
│   │   └── validators/     # Esquemas Zod
│   ├── prisma/
│   │   ├── schema.prisma   # Modelo de datos
│   │   ├── migrations/     # Historial de cambios DB
│   │   └── seed.js        # Datos iniciales
│   └── docs/              # Documentación API
├── frontend/
│   ├── app/
│   │   ├── (app)/         # Rutas protegidas de usuario
│   │   ├── (appAdmin)/    # Rutas protegidas de admin
│   │   ├── (auth)/        # Rutas públicas de auth
│   │   ├── api/           # Servicios API
│   │   ├── components/    # Componentes reutilizables
│   │   ├── context/       # Contextos globales
│   │   ├── hooks/         # Custom hooks
│   │   └── theme.js       # Configuración de tema
│   ├── assets/            # Imágenes y recursos
│   └── docs/             # Documentación
└── docs/                 # Documentación general
```

### 2.2 Configuración de Seguridad

#### Backend
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

#### Frontend
```javascript
function useProtectedRoute() {
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    }
  }, [isAuthenticated, segments]);
}
```

## 3. Sistema de Autenticación

### 3.1 Gestión de Usuarios

#### Registro
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

#### Validaciones
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

### 3.2 Seguridad

#### JWT y Encriptación
```javascript
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  algorithm: 'HS256'
};

const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;
```

## 4. Modelo de Datos

### 4.1 Entidades Principales

#### Users y Autenticación
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

#### Productos
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

## 5. Interfaces de Usuario

### 5.1 Componentes Principales

#### Registro de Usuario
```javascript
export default function Register() {
  const [name, setName] = useState('');
  const [lastNames, setLastNames] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const handleRegister = async () => {
    // Lógica de registro
  };
}
```

### 5.2 Estilos y Tema

#### Configuración del Tema
```javascript
export const theme = {
  colors: {
    primary: '#2196F3',
    accent: '#03A9F4',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
    error: '#B00020',
  },
  roundness: 4,
  fonts: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: '500',
    },
  },
};
```

## 6. API REST

### 6.1 Endpoints Principales

#### Autenticación
```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile
DELETE /api/auth/profile
PUT /api/auth/password
PUT /api/auth/email
```

#### Productos
```http
GET /api/products
GET /api/products/:id
POST /api/admin/products
PUT /api/admin/products/:id
PATCH /api/admin/products/:id/status
```

## 7. Consideraciones Técnicas

### 7.1 Base de Datos
- Nombres de tablas en camelCase
- MySQL sensible a mayúsculas/minúsculas
- Usar backticks en queries SQL
- Campos de texto en mayúsculas para nombres
- Teléfono: 10 dígitos exactos
- Contraseñas hasheadas

### 7.2 Seguridad
- Rate limiting: 100 peticiones/15min
- JWT con expiración de 24h
- Validación de datos con Zod
- Protección de rutas en frontend y backend
- CORS configurado para origen específico

## 8. Datos Iniciales

### 8.1 Catálogos Base
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

### 8.2 Usuario Administrador
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