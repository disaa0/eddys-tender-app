# GUÍA PARA DESARROLLADORES

## ESTADO ACTUAL DEL PROYECTO

El proyecto actual representa un esqueleto de navegación con datos simulados (mock data). La mayoría de las pantallas están implementadas con datos estáticos para proporcionar una base visual y de navegación.

## PRIORIDADES DE DESARROLLO

1. Implementar el diseño UI/UX según las especificaciones
2. Validar la navegación y flujos de usuario
3. Integrar con el backend

## ESTRUCTURA DEL PROYECTO

```
/app
  /(app)     -> Rutas protegidas (requieren autenticación)
  /(auth)    -> Rutas públicas (login, registro)
/assets      -> Recursos estáticos (imágenes, íconos)
/docs        -> Documentación
/components  -> Componentes reutilizables
```

## TECH STACK

- **Framework:** React Native con Expo
- **UI Framework:** React Native Paper (para prototipo, TBD)
- **Navegación:** Expo Router
- **Estilos:** StyleSheet de React Native (para prototipo, TBD)
- **Gestión de Estado:** Por implementar

## AUTENTICACIÓN TEMPORAL

Para desarrollo, la autenticación está simulada. Para modificar:

1. Ubicar `app/_layout.js`
2. En `isAuthenticated = true;`:
   - **Pendiente:** Implementar lógica real de autenticación

## DATOS SIMULADOS

Los datos actuales son estáticos y se encuentran en cada componente.

Ejemplos:

- `PRODUCTS` en `index.js`
- `CART_ITEMS` en `cart.js`
- `ORDERS` en `orders.js`

Estos datos deberán ser reemplazados por llamadas a la API cuando el backend esté listo.

## ASSETS Y RECURSOS

La estructura actual de assets es temporal:

```
/assets
  /products   -> Imágenes de productos
  /icons      -> Íconos de la aplicación
  logo.png    -> Logo principal
```

**Nota:** Esta estructura cambiará significativamente cuando se integre con el backend.

## CONVENCIONES DE CÓDIGO

- **Nombres de componentes:** PascalCase
- **Nombres de archivos:** camelCase
- **Estilos:** Al final del archivo usando `StyleSheet.create()` (se aceptan sugerencias de librerias de estilos)
- **Imágenes:** Usar `require()` y manejar casos de error (temporal, buscar solucón robusta)

## FLUJO DE TRABAJO RECOMENDADO

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Ejecutar en desarrollo: `npx expo start`
4. Implementar diseños según especificaciones
5. Validar navegación y flujos
6. Preparar para integración con backend

## CONTRIBUCIONES

1. Crear branch: `feature/nombre-funcionalidad`
2. Seguir guías de estilo existentes
3. Documentar cambios
4. Crear PR con descripción detallada

## NOTAS IMPORTANTES

- Proyecto actual está en fase inicial de desarrollo
- La estructura actual es temporal, es necesario adaptarla a los requerimientos.
- Las rutas y navegación están definidas pero pueden ajustarse
- La autenticación actual es simulada.
- Los datos son estáticos y deberán conectarse al backend.

## PRÓXIMOS PASOS

1. Implementar diseños finales
2. Configurar gestión de estado
3. Preparar para integración con API
4. Implementar autenticación real
5. Optimizar assets y recursos

Para más detalles técnicos, consultar `./INFO.md`
