# Academia — MVP

Primera versión funcional de Academia para Profe en Movimiento 5.0.

## Curso piloto

**Metodologías Activas en Educación Física**

- Acceso FREE con cuenta docente.
- Cuatro módulos y ocho lecciones.
- Duración académica estimada: 4 horas.
- Aplicaciones prácticas y preguntas de reflexión.
- Evaluación final de ocho preguntas con retroalimentación.
- Aprobación mínima: 80 %.
- Certificado interno de finalización imprimible o guardable como PDF.
- Certificado siempre blanco, independiente del tema global, firmado por MSc. Armando Mayo García.

## Funciones

- Catálogo de Academia.
- Continuar desde la primera lección pendiente.
- Progreso sincronizado por cuenta.
- Evaluación corregida y registrada en servidor.
- Reintentos permitidos.
- Certificado habilitado únicamente al completar las ocho lecciones y aprobar.
- Acceso desde el menú lateral y el Dashboard.
- Compatibilidad con Sistema, Claro, Oscuro y Sepia.
- Diseño adaptable a escritorio y móvil.

## Integración obligatoria

### 1. Supabase

Abre **Supabase → SQL Editor**, copia todo el contenido de:

`supabase/migrations/20260830_academy_mvp.sql`

y pulsa **Run**. Debe aparecer `Success. No rows returned`.

La migración crea `academy_progress` con RLS. Cada docente solo puede consultar y modificar su propio progreso.

### 2. Archivos

Copia las carpetas `app`, `components`, `features` y `supabase` sobre la raíz del proyecto, conservando las rutas y aceptando el reemplazo de archivos existentes.

### 3. Compilación

```powershell
npm run build
```

## Prueba recomendada

1. Inicia sesión con una cuenta docente.
2. Abre **Academia** desde el menú.
3. Comienza el curso piloto.
4. Marca una lección como completada y recarga la página.
5. Confirma que el progreso permanece.
6. Completa las ocho lecciones.
7. Presenta la evaluación final.
8. Con 80 % o más, abre el certificado.
9. Comprueba la impresión en A4 horizontal.
10. Revisa escritorio, móvil y los cuatro temas.
11. Confirma que la firma manuscrita se muestre sobre `MSc. Armando Mayo García` tanto en pantalla como al imprimir o guardar en PDF.
12. Comprueba que el sello institucional aparezca nítido en la esquina inferior derecha del certificado.
13. Usa `Guardar como imagen` y comprueba que se descargue un PNG horizontal completo y en alta resolución.

## Privacidad y alcance

- No se registran respuestas individuales de la evaluación; solo la calificación final.
- El certificado es una constancia interna de finalización y no equivale a titulación ni acreditación oficial.
- No requiere nuevas variables de entorno ni dependencias.

## Verificación técnica

- TypeScript correcto.
- ESLint correcto.
- Compilación de producción correcta.
- Rutas nuevas: `/academia`, `/academia/[slug]` y `/academia/[slug]/certificado`.
