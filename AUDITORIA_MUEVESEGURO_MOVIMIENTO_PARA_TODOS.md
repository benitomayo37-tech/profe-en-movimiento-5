# Auditoría de MueveSeguro y Movimiento para Todos

Fecha: 26 de agosto de 2026

## Resultado

La versión recibida no compilaba por seis referencias a `isFreeExercise` fuera de alcance. La auditoría corrigió el build y reforzó los controles críticos de acceso, trazabilidad, privacidad y accesibilidad sin modificar el diseño aprobado de los módulos.

## Correcciones aplicadas

### Movimiento para Todos

- Corregidas las seis referencias que impedían compilar.
- Restaurada la codificación UTF-8 de textos, símbolos y emojis del workspace.
- Eliminada la directiva `use client` duplicada.
- Activado el bloqueo real de las tarjetas PRO.
- Añadidas etiquetas visibles Free/Pro.
- Incorporado el diálogo de actualización al seleccionar contenido bloqueado.
- Aplicado el mismo control a las orientaciones para cuidadores.
- Movida la selección de contenidos al componente de servidor.
- Las instrucciones, beneficios, adaptaciones, precauciones y contraindicaciones PRO ya no se envían al navegador de una cuenta Free.
- Añadida la ruta al Proxy para mantener correctamente la sesión.

### MueveSeguro

- Separado el concepto de usuario autenticado del acceso PRO.
- Registro, historial, seguimiento y estadísticas quedan habilitados únicamente con `hasProAccess`.
- Sustituido el guardado en dos pasos por la función transaccional `add_incident_followup`.
- Un seguimiento y su cambio de estado se confirman juntos o se revierten juntos.
- La base de datos rechaza nuevas actuaciones después del cierre.
- La migración revoca la inserción directa de seguimientos y la actualización directa de estados.
- Las políticas RLS exigen propiedad del registro y Plan Pro o rol administrador.
- El estado inicial ya no permite seleccionar `Cerrado`; el cierre se registra mediante una actuación.
- `Ayuda externa` conserva tres posibilidades: Sí, No y No se sabe.
- Fechas y horas nuevas utilizan explícitamente `America/Guayaquil`.
- Eliminada la acción «Editar registro» después de guardar, que podía generar un duplicado y contradecía la inmutabilidad declarada.
- Eliminada una comprobación duplicada de Supabase.

### Privacidad y accesibilidad

- Actualizada la Política de privacidad para explicar el tratamiento de incidentes educativos.
- Aclarada la separación entre MueveSeguro y las herramientas de IA.
- Incluido el principio de minimización de datos de estudiantes.
- El diálogo PRO recibe foco al abrirse, conserva el foco dentro del diálogo, cierra con Escape y devuelve el foco al elemento original.

## Migración obligatoria

Antes de desplegar esta versión se debe ejecutar en Supabase SQL Editor:

`supabase/migrations/20260826_mueve_seguro_audit_hardening.sql`

Después se debe probar con una cuenta Free, una cuenta Pro y una cuenta administradora.

## Verificaciones realizadas

- TypeScript: aprobado sin errores.
- ESLint de los archivos afectados: aprobado sin errores ni advertencias.
- Next.js 16.2.11: build de producción aprobado.
- Generación estática: 34/34 páginas.
- Rutas verificadas: `/mueve-seguro` y `/movimiento-para-todos`.
- Comprobación de codificación dañada: sin coincidencias restantes.
- Comprobación del contenido PRO en los chunks cliente: las instrucciones completas usadas en la prueba no aparecen en el bundle público.

## Mejoras recomendadas para una segunda fase

Estas mejoras no bloquean el despliegue de la corrección crítica:

1. Dividir `MoveSafeWorkspace.tsx` e `MovimientoParaTodosWorkspace.tsx` en componentes especializados.
2. Añadir paginación o consultas agregadas cuando el historial supere varias decenas de incidentes.
3. Incorporar pruebas automatizadas de RLS en un entorno Supabase de pruebas.
4. Definir una política institucional configurable de conservación y anonimización.
5. Implementar un flujo explícito y auditable de reapertura de incidentes cerrados.
6. Añadir filtros accesibles por objetivo, dificultad y tipo de acompañamiento en Movimiento para Todos.
7. Revisar periódicamente el contenido de salud y seguridad y mostrar la fecha de revisión de cada guía.

No se recomienda abordar estas mejoras antes de ejecutar la migración y completar la prueba funcional Free/Pro/Administrador de esta entrega.
