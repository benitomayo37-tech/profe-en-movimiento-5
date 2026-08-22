# Configuración de Supabase - Profe en Movimiento 5.0

## 1. Crear el proyecto

1. Entra en Supabase y crea un proyecto nuevo.
2. Espera hasta que la base de datos indique que está disponible.
3. Abre **SQL Editor**.
4. Copia todo el contenido de `supabase/migrations/20260804_auth_profiles.sql`.
5. Pégalo en una consulta nueva y presiona **Run** una sola vez.

## 2. Configurar las variables locales

En **Project Settings > API** o en el panel **Connect**, localiza:

- Project URL.
- Publishable key.

Añade estas dos líneas a tu archivo `.env.local` existente:

```text
NEXT_PUBLIC_SUPABASE_URL=PEGA_AQUI_PROJECT_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=PEGA_AQUI_PUBLISHABLE_KEY
```

La publishable key está diseñada para utilizarse en el navegador. No añadas una
secret key ni una service role key a ninguna variable que comience por
`NEXT_PUBLIC_`.

## 3. Configurar las direcciones de autenticación

En **Authentication > URL Configuration**:

- Site URL local: `http://localhost:3000`
- Redirect URL local: `http://localhost:3000/auth/confirm`
- Cuando publiques la plataforma, añade también la dirección HTTPS definitiva y
  su ruta `/auth/confirm`.

## 4. Correo y contraseña

En **Authentication > Sign In / Providers > Email**:

- Mantén habilitado Email.
- Para producción, mantén habilitada la confirmación del correo.
- Durante una prueba local puedes desactivarla temporalmente, pero vuelve a
  activarla antes de publicar.

## 5. Activar manualmente un plan Pro

Primero pide al docente que cree su cuenta. Después, desde **SQL Editor**, ejecuta
esta consulta reemplazando el correo de ejemplo:

```sql
update public.profiles
set plan = 'pro'
where id = (
  select id
  from auth.users
  where lower(email) = lower('docente@ejemplo.com')
);
```

Para devolver una cuenta al plan gratuito:

```sql
update public.profiles
set plan = 'free'
where id = (
  select id
  from auth.users
  where lower(email) = lower('docente@ejemplo.com')
);
```

Para convertir tu propia cuenta en administradora:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where lower(email) = lower('TU_CORREO')
);
```

## 6. Comprobar la instalación

```bash
npm install
npm run build
npm run dev
```

Después visita:

- `http://localhost:3000/registro`
- `http://localhost:3000/login`
- `http://localhost:3000/cuenta`
- `http://localhost:3000/apps`

Si las variables de Supabase todavía no están añadidas, el proyecto compilará,
pero mostrará un aviso de configuración pendiente y mantendrá cerrado el
contenido Pro.

## 7. Automatizar el Plan Pro con Hotmart

Cuando termines la autenticación, continúa con
`docs/HOTMART_WEBHOOK_SETUP.md`. Allí se explica cómo ejecutar la segunda
migración, guardar las claves privadas en Vercel y registrar el Webhook que
activa automáticamente las 19 miniapps después de una compra aprobada.
