# Botón general de regreso — App para profes

Esta actualización incorpora un botón visible **“← Volver a App para profes”** en todas las herramientas disponibles bajo `/apps/[slug]`.

## Comportamiento

- Aparece en la parte superior, junto a las migas de navegación.
- En móvil ocupa una línea propia para facilitar su pulsación.
- Regresa al catálogo general `/apps`.
- Se conserva un segundo botón al final de la columna de recomendaciones.
- Funciona automáticamente en todas las herramientas actuales y futuras que utilicen `MiniAppShell`.

## Integración

Reemplaza `features/apps/components/MiniAppShell.tsx` y ejecuta:

```powershell
npm run build
```

No requiere variables de entorno, migraciones ni dependencias adicionales.
