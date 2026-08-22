# Acceso Free y Pro

Esta actualización aplica el modelo comercial acordado:

- **Profe IA Free:** Crear planificación, hasta 3 generaciones por mes.
- **Profe IA Pro:** todas las herramientas, sin el límite mensual Free.
- **Entrenador IA Free:** Sesión de entrenamiento, hasta 3 generaciones por mes.
- **Entrenador IA Pro:** Sesión, Microciclo, Mesociclo y Macrociclo, sin el límite mensual Free.

## Instalación

1. Conserva tu archivo `.env.local` y la carpeta `.vercel` actuales.
2. Copia el contenido de esta actualización sobre la carpeta del proyecto.
3. Abre Supabase → SQL Editor → New query.
4. Copia y ejecuta todo el contenido de:
   `supabase/migrations/20260811_freemium_generation_limits.sql`
5. Confirma que Supabase muestre `Success. No rows returned`.
6. En PowerShell, dentro del proyecto, ejecuta:

   ```powershell
   npm run lint
   npm run build
   npx vercel@latest --prod
   ```

No se requieren variables de entorno nuevas. La devolución automática de intentos fallidos utiliza la variable `SUPABASE_SERVICE_ROLE_KEY` que ya está configurada en el proyecto.

## Comportamiento del contador

- El contador se reinicia automáticamente al comenzar cada mes, usando UTC.
- Solo se reserva un uso después de validar los datos enviados.
- Si OpenAI o la validación final fallan, el uso reservado se devuelve.
- El contador se controla mediante una función atómica en Supabase, por lo que dos solicitudes simultáneas no pueden superar el límite.
- La seguridad también se aplica en las rutas API; ocultar o modificar botones en el navegador no permite utilizar herramientas Pro.
