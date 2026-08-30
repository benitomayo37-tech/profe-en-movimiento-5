# Selector global de apariencia

Esta actualización añade un selector general para toda la plataforma **Profe en Movimiento 5.0**.

## Opciones disponibles

- Sistema: utiliza la preferencia clara u oscura del dispositivo.
- Claro.
- Oscuro.
- Sepia.

## Comportamiento

- El selector aparece junto al avatar en escritorio.
- En móvil aparece dentro del menú principal.
- La selección se conserva en el dispositivo mediante almacenamiento local.
- El tema se aplica antes de mostrar el contenido para evitar destellos visuales.
- Los colores de marca y las identidades visuales de las herramientas se conservan.
- El logo principal del panel lateral mantiene una superficie blanca propia en todos los temas.
- Los encabezados del menú lateral conservan el azul institucional.
- Las tarjetas seleccionadas de Profe IA mantienen contraste correcto en Oscuro y Sepia.
- Alimentación en Movimiento queda aislada del tema global porque dispone de su propio selector visual.
- Respeta la preferencia de reducción de movimiento del dispositivo.

## Integración

1. Copia `app/layout.tsx` y `app/globals.css` respetando sus rutas.
2. Copia `components/theme/ThemeSwitcher.tsx`.
3. Copia los cuatro componentes actualizados dentro de `components/layout`.
4. Copia los dos componentes actualizados dentro de `features/ai/components`.
5. Ejecuta `npm run build`.

No requiere variables de entorno, migraciones de Supabase ni dependencias adicionales.

## Verificación realizada

- TypeScript correcto.
- ESLint correcto en los archivos TypeScript modificados.
- Compilación de producción correcta.
- 47 rutas generadas.
