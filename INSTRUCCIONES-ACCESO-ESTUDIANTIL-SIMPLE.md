# Acceso estudiantil simple

Esta actualización elimina el registro y el PIN personal para ingresar a los recursos gratuitos.

## Nuevo recorrido

1. El estudiante abre **Estudiantes**.
2. Escribe un nombre o apodo.
3. Selecciona el nivel y escribe el grado o curso.
4. Entra directamente a los recursos gratuitos.
5. El perfil y el progreso se conservan durante 30 días en ese dispositivo.

Los exámenes permanecen separados: dentro de **Realizar examen**, el estudiante escribe el código entregado por el docente y sus datos para el documento de resultados.

## Integración

1. Copia las carpetas `app`, `features` y `supabase` sobre el proyecto, conservando su estructura.
2. En Supabase, abre **SQL Editor**.
3. Ejecuta todo el archivo:
   `supabase/migrations/20260830_student_quick_access.sql`
4. Verifica que el servidor tenga configuradas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` (recomendado para las claves modernas `sb_secret_...`)

   También se conserva compatibilidad con el nombre anterior `SUPABASE_SERVICE_ROLE_KEY`.
5. Reinicia el servidor con `npm run dev` si estaba abierto.
6. Abre `/login?rol=estudiante` y prueba el botón **Entrar y aprender**.

## Nota de seguridad

`SUPABASE_SECRET_KEY` debe existir solamente en las variables privadas del servidor. Nunca debe llevar el prefijo `NEXT_PUBLIC_` ni incluirse en código enviado al navegador.

## Verificación realizada

- TypeScript correcto.
- Compilación de producción correcta.
- 47 rutas generadas.
- Acceso docente conservado.
- Módulo de exámenes conservado.
- Progreso y límites mensuales vinculados al perfil gratuito.
