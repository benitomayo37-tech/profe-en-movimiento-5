# Portal estudiantil · Fase 1

Esta actualización incorpora la base segura de **Recursos para estudiantes**.

## Qué incluye

- Selector Docente/Estudiante en `/login` y `/registro`.
- Registro estudiantil sin correo: nombre completo, Unidad Educativa, nivel, grado/curso/paralelo y PIN de 4 dígitos.
- PIN cifrado con `pgcrypto`; nunca se almacena ni se devuelve en texto visible.
- Sesión estudiantil en cookie `HttpOnly`, firmada y con duración de 30 días.
- Portal `/estudiantes` con seis herramientas planificadas.
- Límite base de 10 investigaciones mensuales compartidas entre Historia, Juegos tradicionales y Deportes.
- Juegos interactivos y Videos identificados como uso libre.
- Exámenes identificados como acceso exclusivo mediante código docente.
- Redirección de una sesión estudiantil fuera de las áreas docentes.
- Las cuentas docentes pueden abrir `/estudiantes` desde su barra lateral.
- Los usuarios docentes existentes conservan su plan y pasan al rol `teacher`.

## Instalación

1. Copia las carpetas de esta actualización sobre el proyecto.
2. En Supabase abre **SQL Editor**.
3. Copia y ejecuta todo el archivo:
   `supabase/migrations/20260812_student_portal_phase_1.sql`
4. Confirma el mensaje `Success. No rows returned`.
5. Ejecuta:

   ```powershell
   npm run lint
   npm run build
   ```

6. Despliega:

   ```powershell
   npx vercel@latest --prod
   ```

## Verificación manual

1. Abre `/login` y confirma las opciones **Soy docente** y **Soy estudiante**.
2. Abre `/registro?rol=estudiante` y registra un estudiante de prueba.
3. Comprueba que entra en `/estudiantes`.
4. Intenta abrir `/ai`: debe volver automáticamente a `/estudiantes`.
5. Cierra la sesión estudiantil e inicia sesión como docente.
6. Abre **Recursos para estudiantes** desde la barra lateral: el docente debe poder ver el portal y regresar al Dashboard.

## Siguiente fase

Construir los generadores de Historia, Juegos tradicionales y Deportes; después Juegos, Videos y el sistema docente de exámenes con código, versiones aleatorias, calificación y PDF.
