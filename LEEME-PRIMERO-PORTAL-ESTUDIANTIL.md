# Actualización: Portal estudiantil · Fase 1

Esta actualización debe copiarse **encima de la carpeta actual** `profe-en-movimiento-5`.

No reemplaces ni borres:

- `.env.local`
- `.vercel`
- `node_modules`

Después de copiar los archivos:

1. Abre Supabase → **SQL Editor** → **New query**.
2. Copia todo el contenido de:
   `supabase/migrations/20260812_student_portal_phase_1.sql`
3. Pulsa **Run** y confirma `Success. No rows returned`.
4. En PowerShell, dentro del proyecto, ejecuta:

   ```powershell
   npm run lint
   npm run build
   ```

5. Si ambos finalizan correctamente, despliega:

   ```powershell
   npx vercel@latest --prod
   ```

La explicación completa y la lista de comprobación están en:
`docs/PORTAL_ESTUDIANTIL_FASE_1.md`.
