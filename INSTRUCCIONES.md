# Actualización de identidad visual y Hero del Dashboard

Esta actualización:

- sustituye el logotipo global por la nueva identidad de Profe en Movimiento;
- sustituye el robot por la mascota con gorra institucional;
- incorpora al profesor Armando y al robot en el Hero del Dashboard;
- conserva las rutas, permisos, herramientas y lógica existentes.

## Copia

Con el proyecto cerrado, copia las carpetas `features` y `public` de este paquete en la raíz de `profe-en-movimiento-5` y acepta reemplazar los archivos existentes.

No copies `node_modules`, `.next`, `.vercel` ni `.env.local`.

## Verificación

Ejecuta:

```powershell
npm run lint
npm run build
```

Si ambos terminan correctamente, publica:

```powershell
npx vercel@latest --prod
```

Después abre el Dashboard y verifica el nuevo Hero, el logotipo de la barra lateral y el robot en Profe IA, Entrenador IA y Estudiantes.
