# Tienda · Fase 4 · Creador de Certificados

## Resultado

- Creador de Certificados integrado como miniapp protegida del Plan Pro.
- Ruta: `/apps/creador-certificados`.
- Ficha: `/store/creador-certificados`.
- Generación individual y por lote en PNG.
- Diseño horizontal y cuadrado disponibles en la herramienta.
- Todo el procesamiento de los datos y las imágenes se realiza en el dispositivo.

## Correcciones de auditoría

- Idioma y título del documento actualizados.
- Eliminados los nombres personales de ejemplo.
- El botón `Limpiar` borra realmente estudiante, curso, mensaje, firma y vista previa.
- Validación obligatoria de estudiante y responsable de firma.
- Lote limitado a 50 estudiantes.
- Confirmación adicional para lotes superiores a 25 certificados.
- Nombres de descarga saneados para evitar caracteres problemáticos.
- Manejo de errores en generación y descarga por lote.
- Política de seguridad ajustada para compartir imágenes `data:` sin permitir conexiones remotas generales.

## Verificación técnica

- Sintaxis del JavaScript compilado: aprobada.
- ESLint: aprobado.
- TypeScript: aprobado.
- Next.js 16.2.11: 47/47 páginas generadas.

## Prueba recomendada

1. Con cuenta Free, abrir `/apps` y confirmar `Plan Pro requerido`.
2. Con cuenta Pro, abrir `/apps/creador-certificados`.
3. Intentar generar sin nombre ni firma y comprobar el aviso.
4. Completar un estudiante, curso, motivo, mensaje, fecha y firma.
5. Probar los diseños y orientaciones disponibles.
6. Generar, revisar y descargar el PNG individual.
7. Escribir tres nombres separados por comas y probar `GENERAR TODOS`.
8. Pulsar `Limpiar` y confirmar que no queden datos anteriores.
9. Revisar la ficha `/store/creador-certificados`; debe aparecer como `Incluido`.

