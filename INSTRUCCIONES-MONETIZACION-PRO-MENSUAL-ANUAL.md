# Monetización Pro: configuración pendiente en Hotmart y Vercel

## Oferta aprobada

- Plan Free: USD 0.
- Plan Pro mensual: USD 4,99 por mes.
- Plan Pro anual: USD 49,99 por año.
- Ambos planes conceden el mismo acceso `pro`.
- Ebooks, planificaciones y paquetes descargables se venden por separado.

## Productos que debes crear o comprobar en Hotmart

1. Plan Pro mensual: suscripción mensual de USD 4,99.
2. Plan Pro anual: suscripción anual de USD 49,99.

Conserva el identificador numérico de cada producto y el enlace HTTPS de cada checkout.

## Variables de producción en Vercel

```text
HOTMART_CHECKOUT_PLAN_PRO_MONTHLY=https://checkout-hotmart-del-plan-mensual
HOTMART_CHECKOUT_PLAN_PRO_ANNUAL=https://checkout-hotmart-del-plan-anual
HOTMART_PRO_PRODUCT_IDS=ID_MENSUAL,ID_ANUAL
HOTMART_HOTTOK=<CONFIGURAR_EN_VERCEL>
```

`HOTMART_PRO_PRODUCT_IDS` debe contener los dos identificadores reales separados por coma y sin espacios innecesarios. No escribas precios ni enlaces dentro de esta variable.

La variable antigua `HOTMART_CHECKOUT_SUITE_19_MINIAPPS` continúa admitida como respaldo temporal del checkout mensual, pero conviene migrar a `HOTMART_CHECKOUT_PLAN_PRO_MONTHLY`.

## Webhook

La URL de producción continúa siendo:

```text
https://TU-DOMINIO/api/hotmart/webhook
```

El código procesa aprobaciones, compras completadas, cancelaciones, reembolsos, chargebacks, vencimientos y cancelaciones de suscripción. Los dos identificadores incluidos en `HOTMART_PRO_PRODUCT_IDS` activan el mismo Plan Pro.

## Orden recomendado

1. Instalar este paquete y ejecutar `npm run lint` y `npm run build`.
2. Crear o comprobar ambos productos en Hotmart.
3. Configurar las cuatro variables en Vercel para Production.
4. Desplegar la nueva versión.
5. Probar cada checkout con el enlace correspondiente.
6. Enviar una notificación de prueba de Hotmart y verificar la activación en `profiles.plan`.

No se requiere una migración nueva de Supabase para añadir la modalidad anual.
