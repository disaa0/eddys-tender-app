# Eddy's Tender App

## 1. Visión General
**Objetivo**: Optimizar los procesos de pedido y recogida de comida para los clientes, mientras se mejora la gestión de pedidos para el restaurante Eddy's Tender.  
**Valor Clave**:  
- *Clientes*: Pedidos intuitivos, seguimiento en tiempo real, pagos seguros.  
- *Negocio*: Gestión centralizada de pedidos, seguimiento automatizado de ventas, reducción de errores humanos.  

---

## 2. Roles de Usuario
| Rol          | Acciones Clave                                  |
|---------------|----------------------------------------------|
| **Cliente**  | Explorar menú, personalizar pedidos, pagar, rastrear estado, reordenar. |
| **Admin**     | Gestionar menú, actualizar estado de pedidos, ver reportes de ventas. |

---

## 3. Funcionalidades Principales

### 3.1 Módulo de Usuario
#### Autenticación y Perfil
- **RF1**: Inicio de sesión con correo/contraseña y validación.  
- **RF2**: Registro (nombre, correo, teléfono, fecha de nacimiento, contraseña).  
- **RF3**: Validación de datos (formato de correo, fortaleza de contraseña, formato de teléfono mexicano).  
- **RF11-12**: Editar perfil/contraseña con confirmación de contraseña actual.  

#### Interacción con Productos
- **RF4**: Catálogo de productos responsivo (imagen, precio, descripción breve, categoría).  
- **RF5**: Filtrar por nombre/popularidad/categoría.  
- **RF6**: Detalles del producto (ingredientes, descripción completa, precio).  

#### Carrito y Pago
- **RF7-8**: Ajustar/eliminar artículos, actualización automática del total.  
- **RF9-10**: Integración de Stripe para tarjetas de crédito/débito + efectivo al entregar.  

#### Gestión de Pedidos
- **RF13-14**: Historial de pedidos (fecha, estado, total) con detalles específicos.  
- **RF15**: Reordenar con un solo clic.  
- **RF16**: Notificaciones push para cambios de estado del pedido.  

### 3.2 Módulo de Administrador
#### Gestión de Productos
- **RF17-18**: Agregar/editar/deshabilitar productos (nombre, precio, imágenes, ingredientes, categoría).  

#### Gestión de Pedidos
- **RF19**: Ver/actualizar estado de pedidos (Confirmado → En preparación → Completado/Cancelado).  
- **RF20**: Alertas de ventas en tiempo real.  

#### Análisis
- Reportes de ventas con filtros por fecha.  

### 3.3 Integración de Pagos (Stripe)
- Procesamiento de tarjetas compatible con PCI.  
- Webhooks para actualizaciones de estado de pagos.  
- Tokenización para manejo seguro de datos.  

---

## 4. Diagramas de Flujo de Usuario

### 4.1 Flujo del Cliente
```plaintext
Iniciar Sesión/Registrarse → Explorar Menú → Personalizar Artículo → Agregar al Carrito → 
Revisar Carrito → Seleccionar Pago → Confirmar Pedido → Rastrear Estado → Reordenar (Opcional)
```

### 4.2 Flujo del Administrador
```plaintext
Iniciar Sesión → Recibir Nuevo Pedido → Confirmar → Actualizar Estado → Generar Reporte
```

---

## 6. Arquitectura de Seguridad
- **Cifrado de Datos**: AES-256 para datos personales y de pago.  
- **Cumplimiento PCI**: Stripe maneja los datos de tarjetas; no se almacenan localmente.  
- **Autenticación**: Tokens JWT con expiración de 24 horas.  

---
Stack:
Frontend: React Native with JavaScript (no typescript), Expo, Expo
Backend: Next.js, MySQL, Stripe, Prisma
UI Framework: React Native Paper

---

## 8. Maquetas y Prototipos (Por Diseñar)
- **Pantallas Clave**: Inicio de sesión, Menú, Carrito, Seguimiento de pedidos, Panel de administrador.  
- **Kit de UI**: React Native Paper para consistencia en diseño Material.  
