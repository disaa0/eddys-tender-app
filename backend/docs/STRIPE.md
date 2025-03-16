# Integración de Pagos con Stripe

## Descripción General

Este documento detalla cómo se integra el procesamiento de pagos de Stripe con la API de EDDYS TENDER. La integración permite el procesamiento seguro de pagos con tarjetas de crédito y débito para los pedidos.

## Configuración del Entorno

Antes de utilizar la integración con Stripe, estas variables de entorno deben configurarse:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Para desarrollo, puedes usar las claves de prueba de Stripe. Para producción, usa claves en vivo.

## Flujo de Pago

### 1. Crear Orden

Cuando un usuario crea una orden con tipo de pago 2 (tarjeta de crédito) o 3 (tarjeta de débito), el sistema:

1. Calcula el monto total de la orden
2. Crea una Intención de Pago en Stripe
3. Devuelve el secreto del cliente al frontend para procesamiento

**Endpoint:** `POST /api/orders`

**Solicitud:**
```
{
  "idPaymentType": 2,
  "idShipmentType": 1,
  "idLocation": 1  // Requerido para envíos a domicilio
}
```

**Respuesta:**
```
{
  "order": {
    "idOrder": 123,
    "totalPrice": 258.00,
    "paid": false,
    "...": "..."
  },
  "paymentDetails": {
    "clientSecret": "pi_3MkVnL2eZvKYlo2C1IFrG8oM_secret_O0FjOJ1VGdEVbqrgmd1ikvPTq",
    "paymentIntentId": "pi_3MkVnL2eZvKYlo2C1IFrG8oM"
  }
}
```

### 2. Procesar Pago en el Frontend

El frontend utiliza el secreto del cliente para procesar el pago con Stripe Elements o el SDK de Stripe:

```
// Ejemplo usando el SDK de Stripe para React Native
const { initPaymentSheet, presentPaymentSheet } = useStripe();
const { clientSecret } = route.params;

// Inicializar la Hoja de Pago
await initPaymentSheet({
  paymentIntentClientSecret: clientSecret,
  merchantDisplayName: 'Eddys Tender',
});

// Presentar la Hoja de Pago
const { error } = await presentPaymentSheet();

if (error) {
  console.error('Pago fallido:', error);
} else {
  // Pago exitoso
  // Navegar a confirmación de orden
}
```

### 3. Procesamiento de Webhook

Después de que se procesa el pago (exitoso o fallido), Stripe envía un webhook a nuestro servidor:

1. El servidor verifica la firma del webhook usando el secreto compartido
2. Para pagos exitosos:
   - Marca la orden como pagada
   - Actualiza el estado de la orden a "Procesando"
   - Crea una notificación para el usuario
3. Para pagos fallidos:
   - Actualiza el estado de pago de la orden a "fallido"
   - Actualiza el estado de la orden a "Cancelado"
   - Crea una notificación sobre el fallo del pago

**Endpoint:** `POST /api/webhook/stripe`

**Configuración en el Panel de Stripe:**

1. Ve a "Desarrolladores" > "Webhooks" en el panel de Stripe
2. Haz clic en "Añadir endpoint"
3. Ingresa la URL completa: `https://tu-dominio.com/api/webhook/stripe`
4. Selecciona los eventos a monitorear:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copia el "Secreto del webhook" generado y añádelo a tu archivo .env como `STRIPE_WEBHOOK_SECRET`

**Para Pruebas Locales:**

Utiliza Stripe CLI para reenviar eventos a tu entorno local:

```bash
stripe listen --forward-to http://localhost:3000/api/webhook/stripe
```

## Flujo de Estados de la Orden

1. **Pendiente** (1): Estado inicial cuando se crea la orden
2. **Procesando** (2): Después de confirmar el pago
3. **Listo para recoger** (3): Orden preparada y lista para que el cliente la recoja
4. **Listo para enviar** (4): Orden preparada y lista para entrega
5. **Enviado** (5): Orden en tránsito hacia el cliente
6. **Entregado** (6): Orden entregada exitosamente
7. **Cancelado** (7): Orden cancelada (pago fallido, solicitud del cliente, etc.)

## Pruebas

Usa las tarjetas de prueba de Stripe para pruebas de desarrollo:

- Éxito: `4242 4242 4242 4242`
- Requiere Autenticación: `4000 0025 0000 3155`
- Rechazada: `4000 0000 0000 0002`

CVC de prueba: Cualquier 3 dígitos
Fecha de prueba: Cualquier fecha futura

## Manejo de Errores

Errores comunes:

1. **Errores de Procesamiento de Pago**:
   - Tarjeta rechazada
   - Fondos insuficientes
   - Autenticación requerida

2. **Errores del Sistema**:
   - Verificación de firma de webhook fallida
   - Orden no encontrada
   - Orden ya pagada

Cada error se registra y se devuelven mensajes apropiados al frontend.

## Consideraciones de Seguridad

1. El procesamiento de pagos ocurre completamente en los servidores seguros de Stripe
2. Los detalles de la tarjeta nunca tocan nuestro backend
3. Todas las llamadas a la API de Stripe usan HTTPS
4. Las firmas de webhook se verifican para prevenir manipulaciones
5. Las intenciones de pago están vinculadas a órdenes específicas
6. El endpoint de webhook no requiere token JWT, pero utiliza la verificación de firma de Stripe 