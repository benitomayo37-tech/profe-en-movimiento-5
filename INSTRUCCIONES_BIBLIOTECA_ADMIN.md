# Biblioteca Profesional — panel administrativo

## 1. Crear las tablas en Supabase

1. Abre **Supabase > SQL Editor**.
2. Copia todo el contenido de `supabase/migrations/20260815_library_admin.sql`.
3. Pégalo en una consulta nueva y pulsa **Run**.
4. El resultado esperado es: `Success. No rows returned`.

## 2. Comprobar el acceso administrativo

El usuario que administrará la biblioteca debe tener `role = 'admin'` en la tabla `profiles`.

## 3. Importar el catálogo actual

1. Inicia sesión en Profe en Movimiento con la cuenta administradora.
2. Abre `/resources`.
3. Pulsa **Administrar** en la cabecera.
4. En `/resources/admin`, pulsa **Importar los recursos actuales** una sola vez.

La biblioteca conservará el catálogo actual como respaldo hasta que esta importación se complete.

## 4. Operaciones disponibles

- Crear un recurso nuevo.
- Editar sus datos y URL de descarga.
- Publicar u ocultar un recurso.
- Destacar o quitar el destaque.
- Marcar contenido gratuito, Premium, verificado, DUA, NEE o preparado para Profe IA.

Los recursos ocultos dejan de aparecer en la biblioteca pública. Los cambios publicados también se reflejan en la ficha del recurso y en la integración con Profe IA.

## 5. Activar archivos y descargas protegidas

1. Abre **Supabase > SQL Editor**.
2. Ejecuta todo el contenido de `supabase/migrations/20260820_resource_files.sql`.
3. El resultado esperado es `Success. No rows returned`.
4. Regresa a `/resources/admin` y edita o crea un recurso.
5. En **Archivo descargable**, selecciona `Gratuito` o `Premium` antes de subir el archivo.
6. Sube un PDF, DOCX, XLSX, PPTX o ZIP de hasta 20 MB y espera el mensaje de confirmación.
7. Pulsa **Guardar cambios**.

Los archivos gratuitos se almacenan en `recursos-publicos`. Los Premium se guardan en el bucket privado `recursos-premium`; la aplicación verifica el plan y genera una dirección temporal de 120 segundos únicamente para usuarios Pro o administradores.

No es necesario crear manualmente los buckets: la migración los crea y configura sus políticas de seguridad.
