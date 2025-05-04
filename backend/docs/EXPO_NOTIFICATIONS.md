# Notificaciones Push con Expo en Backend

Este documento describe la implementación del sistema de notificaciones push utilizando Expo Server SDK en el backend de la aplicación Eddy's Tender.

## Tabla de Contenidos

- [Arquitectura General](#arquitectura-general)
- [Modelos de Datos](#modelos-de-datos)
- [Servicios y Controladores](#servicios-y-controladores)
- [Flujo de Trabajo de Notificaciones](#flujo-de-trabajo-de-notificaciones)
- [Tipos de Notificaciones](#tipos-de-notificaciones)
- [Seguridad y Autenticación](#seguridad-y-autenticación)
- [Solución de Problemas](#solución-de-problemas)

## Arquitectura General

El sistema de notificaciones push utiliza el Expo Server SDK para enviar notificaciones a dispositivos móviles registrados. La arquitectura se compone de:

1. **Tokens de Dispositivo**: Almacenados en la base de datos y asociados a usuarios específicos
2. **Servicio de Notificaciones**: Gestiona el registro de tokens y envío de notificaciones
3. **Controladores**: Manejan las solicitudes HTTP relacionadas con notificaciones
4. **Rutas API**: Endpoints para registro/deregistro de tokens y envío de notificaciones

## Modelos de Datos

### NotificationToken

Este modelo almacena los tokens de dispositivos para enviar notificaciones push:

- `idNotificationToken`: Identificador único (clave primaria)
- `token`: Token de notificación Expo (único)
- `idUser`: ID del usuario asociado (clave foránea)
- `deviceInfo`: Información del dispositivo (JSON)
- `lastUsed`: Fecha de último uso
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

### Notification

Este modelo almacena un registro histórico de notificaciones enviadas:

- `idNotification`: Identificador único (clave primaria)
- `idOrder`: ID del pedido asociado (opcional)
- `title`: Título de la notificación
- `message`: Mensaje de la notificación
- `status`: Estado de la notificación (true = enviada)
- `createdAt`: Fecha de creación

## Servicios y Controladores

### NotificationService

El servicio `notification.service.js` implementa la lógica principal:

- `registerToken()`: Registra un nuevo token para un usuario
- `unregisterToken()`: Elimina un token de la base de datos
- `sendNotificationsToUsers()`: Envía notificaciones a múltiples usuarios
- `sendNotificationToUser()`: Envía notificación a un solo usuario
- `sendNotifications()`: Envía notificaciones a tokens específicos
- `checkNotificationReceipts()`: Verifica el estado de entrega de las notificaciones
- `sendOrderStatusNotification()`: Envía notificación sobre cambios de estado de pedidos

### NotificationController

El controlador `notification.controller.js` gestiona las solicitudes API:

- `registerToken()`: Maneja el registro de tokens
- `unregisterToken()`: Maneja la eliminación de tokens
- `sendNotification()`: Envía notificación a un usuario (solo admin)
- `sendBulkNotifications()`: Envía notificaciones a múltiples usuarios (solo admin)
- `testNotification()`: Endpoint de prueba para enviar una notificación al usuario autenticado

### AdminOrderNotificationController

El controlador `adminOrderNotification.controller.js` gestiona notificaciones relacionadas con pedidos:

- `updateOrderStatus()`: Actualiza estado del pedido y envía notificación
- `getOrderNotifications()`: Obtiene historial de notificaciones para un pedido
- `sendCustomOrderNotification()`: Envía notificación personalizada sobre un pedido

## Flujo de Trabajo de Notificaciones

### Registro de Token

1. El frontend solicita permiso al usuario para enviar notificaciones
2. Si el usuario acepta, el frontend obtiene un token de notificación de Expo
3. El frontend envía el token al backend a través del endpoint `/notifications/register`
4. El backend guarda el token en la base de datos asociado al usuario

### Envío de Notificación

1. Un evento desencadenante ocurre (ej: cambio de estado de un pedido)
2. El controlador correspondiente llama al servicio de notificaciones
3. El servicio obtiene los tokens registrados para el usuario o usuarios objetivo
4. El servicio formatea el mensaje de notificación
5. El servicio envía el mensaje mediante el Expo SDK
6. El servicio registra el envío en la base de datos
7. Expo entrega la notificación al dispositivo del usuario

## Tipos de Notificaciones

### 1. Actualización de Estado de Pedido

Enviada cuando cambia el estado de un pedido (preparando, enviado, entregado, etc.)

```javascript
// Ejemplo de payload
{
  title: `Pedido #${orderId} ${statusName}`,
  body: `Tu pedido #${orderId} ahora está ${statusName}`,
  data: {
    type: 'ORDER_STATUS',
    orderId,
    status
  }
}
```

### 2. Notificación Personalizada de Pedido

Enviada por administradores para comunicar información específica sobre un pedido.

```javascript
// Ejemplo de payload
{
  title: title, // Definido por el administrador
  body: message, // Definido por el administrador
  data: {
    type: 'ORDER_NOTIFICATION',
    orderId
  }
}
```

### 3. Notificación de Prueba

Utilizada para verificar el funcionamiento del sistema de notificaciones.

```javascript
// Ejemplo de payload
{
  title: 'Test Notification',
  body: 'This is a test notification from Eddy\'s Tender App',
  data: { type: 'TEST_NOTIFICATION' }
}
```

## Seguridad y Autenticación

- Todos los endpoints de notificaciones requieren autenticación mediante JWT
- Solo administradores pueden enviar notificaciones arbitrarias a usuarios
- Los tokens de dispositivo se validan antes de almacenarse utilizando `Expo.isExpoPushToken()`
- Los webhooks de Expo se aseguran mediante firma criptográfica (receipt verification)

## Solución de Problemas

### Notificaciones No Recibidas

Posibles causas:
- Token no registrado correctamente
- Usuario no ha dado permiso para notificaciones
- Problemas con el servicio de Expo
- Token expirado o inválido

Soluciones:
1. Verificar que el token esté almacenado correctamente en la base de datos
2. Comprobar que el usuario haya dado permisos de notificación
3. Revisar logs del servidor para ver errores en la respuesta de Expo
4. Implementar mecanismo de renovación de tokens

### Errores en Servicios

Posibles causas:
- Configuración incorrecta del SDK de Expo
- Problemas de conexión con el servicio de Expo
- Formato incorrecto de datos de notificación

Soluciones:
1. Verificar que la configuración del SDK de Expo sea correcta
2. Revisar conectividad con los servidores de Expo
3. Validar el formato de los datos de notificación según la documentación de Expo

### Consejos Generales de Depuración

1. Utilizar el endpoint de prueba (`/notifications/test`) para verificar el flujo completo
2. Revisar los logs del servidor para identificar errores específicos
3. Verificar que los IDs de usuario sean correctos al enviar notificaciones
4. Consultar la tabla `NotificationToken` para confirmar que los tokens estén registrados
5. Implementar logging más detallado en el servicio de notificaciones si es necesario

## Recursos

- [Documentación de Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Expo Server SDK para Node.js](https://github.com/expo/expo-server-sdk-node)
- [Herramientas de Depuración de Expo](https://docs.expo.dev/push-notifications/debugging/)
