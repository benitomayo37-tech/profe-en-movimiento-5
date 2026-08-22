# Actualización: Historia estudiantil · Fase 2

Esta actualización se copia **encima de la carpeta actual** `profe-en-movimiento-5`.

No reemplaces ni borres:

- `.env.local`
- `.vercel`
- `node_modules`

Después de copiar los archivos:

1. Abre Supabase → **SQL Editor** → **New query**.
2. Copia todo el contenido de `supabase/migrations/20260813_student_history_phase_2.sql`.
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

La lista completa de comprobación está en `docs/PORTAL_ESTUDIANTIL_HISTORIA_FASE_2.md`.
