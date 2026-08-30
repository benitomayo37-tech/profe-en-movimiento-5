# Corrección de temas — Página de inicio

Esta actualización corrige el contraste de las tarjetas claras de la portada al utilizar los temas globales.

## Ajustes

- Acompañamiento utiliza una superficie azul marino legible en modo Oscuro.
- MueveSeguro adapta correctamente su degradado claro al modo Oscuro.
- El recuadro interior de Acompañamiento conserva contraste suficiente.
- Las tarjetas de Apps docentes y Paquetes educativos de la Tienda se adaptan al modo Oscuro.
- En Sepia se conservan fondos cálidos, textos oscuros y bordes definidos.
- El bloque “Herramientas listas para tu clase” conserva su diseño azul marino, encabezado azul y resplandor.
- La cabecera pública incorpora el selector Sistema, Claro, Oscuro y Sepia en escritorio y móvil.

## Integración

Reemplaza:

- `app/globals.css`
- `components/home/PublicLandingPage.tsx`

Después ejecuta `npm run build`.

No requiere dependencias, variables de entorno ni cambios en Supabase.
