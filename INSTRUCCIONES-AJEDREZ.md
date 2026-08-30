# Integración de Ajedrez

1. Copia las carpetas del paquete sobre la raíz del proyecto y confirma el reemplazo.
2. En Supabase abre **SQL Editor**.
3. Ejecuta el contenido de `supabase/migrations/20260829_student_chess_progress.sql`.
4. Ejecuta `npm run build`.
5. Comprueba:
   - `Estudiantes → Juegos interactivos → Ajedrez desde Cero` — gratuito.
   - `App para profes → Ajedrez Educativo` — Plan Pro.

La migración crea únicamente el registro privado de progreso de ajedrez por estudiante. Si no se ejecuta, el juego conserva el progreso local en el dispositivo, pero no podrá recuperarlo en otro equipo.
