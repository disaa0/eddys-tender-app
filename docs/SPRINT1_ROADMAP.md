## Equipo de trabajo:

- Frontend
  - Dev 1
  - Dev 2
- Backend
  - Dev 3
  - Dev 4
- Database, Integration & Tech Lead
  - Dev 5: @disaa0

---

### **Dev 1 (Frontend - React Native/Expo)**

1. **Inicio App - Usuario (06.02 - 09.02)**:

   - Diseñar pantallas de inicio de sesión y registro.
   - Implementar validación de formularios en tiempo real.
   - Integrar API de autenticación.

2. **Perfil - Usuario (10.02 - 11.02)**:

   - Pantalla de perfil con datos del usuario.
   - Formularios para editar correo, contraseña y borrar cuenta.

3. **Gestionar Menú - Administrador (12.02 - 18.02)**:
   - Dashboard de administrador con lista de productos.
   - Formularios para agregar/editar productos.

---

### **Dev 2 (Frontend - React Native/Expo)**

1. **Inicio App - Usuario (06.02 - 09.02)**:

   - Colaborar en el diseño de pantallas de inicio de sesión y registro.
   - Implementar lógica de navegación entre pantallas.
   - Animaciones de transición en pantalla de inicio.

2. **Perfil - Usuario (10.02 - 11.02)**:

   - Implementar modales de confirmación para "Borrar cuenta" y "Editar contraseña".
   - Diseñar animaciones para transiciones en el perfil.

3. **Gestionar Menú - Administrador (12.02 - 18.02)**:
   - Implementar filtros por nombre y precio en el dashboard.
   - Asegurar responsividad en todas las pantallas.

---

### **Dev 3 (Backend - Next.js)**

1. **Inicio App - Usuario (06.02 - 09.02)**:

   - Desarrollar endpoints para `/auth/login` y `/auth/register`.
   - Validar datos en el servidor (correo, contraseña, teléfono).

2. **Perfil - Usuario (10.02 - 11.02)**:

   - Desarrollar endpoints para `/user/profile` (GET/PUT) y `/user/password` (PUT).
   - Validar contraseña actual para cambios sensibles.

3. **Gestionar Menú - Administrador (12.02 - 18.02)**:
   - Desarrollar endpoints CRUD para `/admin/products`.
   - Implementar lógica de filtrado (nombre, categoría, precio).

---

### **Dev 4 (Backend/Seguridad - Next.js)**

1. **Inicio App - Usuario (06.02 - 09.02)**:

   - Generar tokens JWT con expiración de 24 horas.
   - Implementar middleware de autenticación.

2. **Perfil - Usuario (10.02 - 11.02)**:

   - Verificar tokens JWT en rutas protegidas.
   - Revisar flujos de autenticación en edición de perfil.
   - Añadir rate-limiting para evitar ataques de fuerza bruta en cambios de contraseña.

3. **Gestionar Menú - Administrador (12.02 - 18.02)**:
   - Middleware para restringir acceso a roles de administrador.
   - Asegurar cifrado de datos sensibles (AES-256).

---

### **Dev 5 (Base de Datos - MySQL/Prisma, Tech Lead)**

1. **Inicio App - Usuario (06.02 - 09.02)**:

   - Crear esquema de `Usuario` (nombre, correo, teléfono, contraseña cifrada).
   - Configurar migraciones iniciales con Prisma.
   - Configuración / Inicialización de repositorio.
   - Asistir a equipos de desarrollo.

2. **Perfil - Usuario (10.02 - 11.02)**:

   - Optimizar consultas de actualización de perfil (ej. índices en campos como correo).
   - Datos mock de Usuarios.
   - Asistir a equipos de desarrollo.

3. **Gestionar Menú - Administrador (12.02 - 18.02)**:
   - Crear esquema de `Producto` (nombre, precio, categoría, estado activo).
   - Datos mock de Productos.
   - Configurar migraciones para relaciones (ej. categorías).
   - Asistir a equipos de desarrollo.

---

### **Resumen de Asignación por Dev**

| **Dev** | **Tareas Clave**                                                                      |
| ------- | ------------------------------------------------------------------------------------- |
| Dev 1   | Pantallas de login, registro, perfil y dashboard. Formularios de productos.           |
| Dev 2   | Navegación, filtros de productos, responsividad, animaciones, UI de confirmación.     |
| Dev 3   | Endpoints de autenticación, perfil y gestión de productos. Lógica de filtrado.        |
| Dev 4   | Seguridad (JWT, middlewares, cifrado).                                                |
| Dev 5   | Diseño de esquemas de base de datos, migraciones, control de repositorio, asistencia. |

---

### **Dependencias y Colaboración**

1. **Dev 1 y Dev 3**: Coordinar diseño de pantallas con endpoints de autenticación y perfil.
2. **Dev 2 y Dev 3**: Sincronizar filtros de productos con lógica de backend.
3. **Dev 4 y Dev 5**: Asegurar que los esquemas de base de datos cumplan con requisitos de seguridad.

---

### **Entregables por Dev**

| **Dev** | **Entregables**                                                                                     |
| ------- | --------------------------------------------------------------------------------------------------- |
| Dev 1   | Pantallas de login, registro, perfil y dashboard funcionales.                                       |
| Dev 2   | Navegación fluida, animaciones y filtros de productos implementados.                                |
| Dev 3   | Endpoints de autenticación, perfil y productos listos para integración, breve documentación de API. |
| Dev 4   | Middlewares de seguridad y tokens JWT funcionando.                                                  |
| Dev 5   | Repositorio de codigo, esquemas de base de datos y migraciones configuradas.                        |

---
