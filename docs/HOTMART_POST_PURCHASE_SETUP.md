# Página posterior a la compra de Hotmart

La ruta pública `/compra-confirmada` orienta al comprador después del checkout
de la Suite de 19 miniapps.

## Comportamiento

- Sin sesión: solicita crear una cuenta o iniciar sesión.
- Con una cuenta Free: informa que la confirmación de Hotmart está en proceso.
- Con una cuenta Pro: confirma la activación y ofrece acceso directo a las
  miniapps.

El comprador debe utilizar en Profe en Movimiento exactamente el mismo correo
electrónico que utilizó en Hotmart. El webhook asocia la suscripción mediante
esa dirección.

## URL de producción

```text
https://profe-en-movimiento-5.vercel.app/compra-confirmada
```

Después de desplegar esta versión, configura esa dirección como página externa
de agradecimiento o página posterior a la compra del producto **Suite de 19
miniapps para docentes** en Hotmart.

La página no confirma por sí sola un pago. El estado Pro se obtiene siempre del
perfil de Supabase, actualizado por el webhook de Hotmart.
