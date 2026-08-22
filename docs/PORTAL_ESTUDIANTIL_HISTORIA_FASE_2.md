# Portal estudiantil · Fase 2 · Historia

## Qué incorpora

- Ruta funcional `/estudiantes/historia`.
- Generación de investigaciones históricas sobre deportes, eventos o competencias.
- Contenido adaptado automáticamente al nivel educativo y grado del estudiante.
- Documento organizado entre 2 y 4 páginas A4.
- Impresión o guardado en PDF desde el navegador.
- Consumo compartido del límite mensual: 1 investigación únicamente después de generar y validar correctamente el contenido.
- Vista docente sin consumo de investigaciones.
- Registro privado del historial generado en Supabase.

## Instalación

1. Copia el contenido de esta actualización encima de la carpeta actual del proyecto.
2. Conserva `.env.local`, `.vercel` y `node_modules`.
3. Ejecuta en Supabase SQL Editor la migración `supabase/migrations/20260813_student_history_phase_2.sql`.
4. Ejecuta `npm run lint` y `npm run build`.
5. Despliega con `npx vercel@latest --prod`.

## Prueba recomendada

1. Ingresa como estudiante.
2. Abre **Historia**.
3. Genera `Historia de los Juegos Olímpicos`.
4. Confirma que el contador baja de 10 a 9 solo después de recibir el contenido.
5. Pulsa **Imprimir o guardar en PDF** y verifica que el documento tenga como máximo cuatro páginas.
