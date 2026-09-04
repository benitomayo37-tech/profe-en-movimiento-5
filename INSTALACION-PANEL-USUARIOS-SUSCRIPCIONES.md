# Panel de usuarios y suscripciones

## 1. Instalar los archivos

Descomprime `PANEL-USUARIOS-Y-SUSCRIPCIONES.zip` en la raíz de:

`C:\Users\Usuario\profe-en-movimiento-5`

Permite reemplazar los archivos existentes.

## 2. Ejecutar la migración en Supabase

En Supabase abre **SQL Editor**, crea una consulta nueva y copia íntegramente el contenido de:

`supabase/migrations/20260901_admin_access_metrics.sql`

Pulsa **Run**. El resultado esperado es `Success. No rows returned`.

Esta migración añade el código de oferta de Hotmart a los eventos y accesos. Desde ese momento el panel podrá distinguir:

- Mensual: `argy2ka2`
- Anual: `1wmoonn5`

Los accesos anteriores que no guardaron el código aparecerán como **Sin modalidad histórica**.

## 3. Validar localmente

```powershell
npm run lint
npm run build
```

## 4. Publicar

```powershell
git add app features supabase
git commit -m "feat: agrega panel de usuarios y suscripciones"
git push origin main
```

Vercel desplegará automáticamente. No se necesitan variables de entorno nuevas.

## 5. Abrir el panel

Inicia sesión con la cuenta administradora, abre **Mi cuenta** y pulsa **Abrir panel** en la tarjeta **Usuarios y suscripciones**.

Ruta directa:

`https://profe-en-movimiento-5.vercel.app/admin/usuarios`

La ruta rechaza cuentas no administradoras y no publica nombres ni correos.
