# Activación automática del Plan Pro con Hotmart

Esta integración recibe las notificaciones oficiales de Hotmart y activa o
revoca el Plan Pro en la cuenta que utiliza el mismo correo de la compra.

## 1. Ejecutar la migración

1. Abre **Supabase > SQL Editor**.
2. Crea una consulta nueva.
3. Copia todo el contenido de
   `supabase/migrations/20260808_hotmart_access.sql`.
4. Presiona **Run** una sola vez.

La migración conserva las cuentas Pro que fueron activadas manualmente.

## 2. Obtener las claves necesarias

### Supabase

En **Project Settings > API** busca la clave secreta `service_role`. Esta clave
solo se utilizará en el servidor y nunca debe comenzar por `NEXT_PUBLIC_`.

### Hotmart

En **Herramientas > Webhook (API y notificaciones)** crea o abre una
configuración. Hotmart mostrará el valor **HOTTOK** de la cuenta.

Busca también el identificador numérico del producto correspondiente a la
**Suite de 19 miniapps para docentes**.

## 3. Añadir variables en Vercel

Añade estas variables en el proyecto de Vercel y selecciona **Production**:

```text
SUPABASE_SERVICE_ROLE_KEY=CLAVE_SERVICE_ROLE_DE_SUPABASE
HOTMART_HOTTOK=TOKEN_HOTTOK_DE_HOTMART
HOTMART_PRO_PRODUCT_IDS=ID_NUMERICO_DEL_PRODUCTO_DE_LAS_19_MINIAPPS
```

Si en el futuro varios productos conceden acceso Pro, separa sus identificadores
con comas, sin espacios obligatorios:

```text
HOTMART_PRO_PRODUCT_IDS=123456,789012
```

`SUPABASE_SERVICE_ROLE_KEY` y `HOTMART_HOTTOK` deben guardarse como variables
sensibles. Ninguna de las tres debe comenzar por `NEXT_PUBLIC_`.

## 4. Registrar el Webhook en Hotmart

1. Entra a Hotmart.
2. Abre **Herramientas > Mostrar todas > Webhook (API y notificaciones)**.
3. Pulsa **Registrar Webhook**.
4. Selecciona el producto de las 19 miniapps.
5. Utiliza esta URL de entrega:

```text
https://profe-en-movimiento-5.vercel.app/api/hotmart/webhook
```

6. Selecciona estos eventos:
   - Compra aprobada.
   - Compra completada.
   - Compra reembolsada.
   - Contracargo.
   - Compra cancelada.
   - Compra vencida o atrasada.
   - Cancelación de suscripción.
7. Guarda la configuración.

## 5. Volver a desplegar

Después de guardar las variables:

```powershell
npx vercel@latest --prod
```

## 6. Probar la integración

En la configuración del Webhook de Hotmart, utiliza **Ejecutar prueba**. En el
historial, la respuesta debe ser HTTP `200`.

Una prueba de conectividad puede indicar `processed: false` si Hotmart utiliza
un producto ficticio. Para comprobar la activación completa, utiliza el producto
real y un correo que tenga una cuenta registrada en la plataforma.

La compra y la cuenta deben utilizar el mismo correo. Si la compra ocurre antes
del registro, el acceso se conservará pendiente y se aplicará automáticamente
cuando el docente cree su cuenta con ese correo.
