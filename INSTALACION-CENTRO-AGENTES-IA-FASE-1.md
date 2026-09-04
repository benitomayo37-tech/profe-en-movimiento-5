# Centro de Agentes IA — Fase 1

## Incluye

- Ruta privada `/agentes`.
- Coordinador Docente.
- Agentes de Planificación, Evaluación e Inclusión.
- Memoria persistente por conversación en Supabase.
- Resultados guardados únicamente por confirmación del usuario.
- Límites mensuales: 3 Free, 100 Pro y 1000 para administración.
- Acceso desde el Sidebar y el Dashboard.

## 1. Instalar archivos

Descomprime `CENTRO-AGENTES-IA-FASE-1.zip` en:

`C:\Users\Usuario\profe-en-movimiento-5`

Permite reemplazar los archivos existentes.

## 2. Instalar dependencias

```powershell
npm install
```

El paquete incorpora `@openai/agents` y `zod` en `package.json` y `package-lock.json`.

## 3. Migrar Supabase

En **Supabase → SQL Editor**, copia íntegramente y ejecuta:

`supabase/migrations/20260902_ai_agents_phase_1.sql`

Resultado esperado: `Success. No rows returned`.

## 4. Validar

```powershell
npm run lint
npm run build
```

El build debe mostrar:

- `/agentes`
- `/api/agents/run`
- `/api/agents/save`

## 5. Publicar

```powershell
git add app/agentes app/api/agents components/dashboard/QuickActions.tsx components/layout/Sidebar.tsx features/agents package.json package-lock.json supabase/migrations/20260902_ai_agents_phase_1.sql
git commit -m "feat: incorpora Centro de Agentes IA fase 1"
git push origin main
```

No se necesita una clave nueva: utiliza `OPENAI_API_KEY` y `OPENAI_MODEL` ya configuradas. Opcionalmente puede definirse `OPENAI_AGENT_MODEL` para usar otro modelo solo en los agentes.

## 6. Prueba inicial

Inicia sesión y abre:

`https://profe-en-movimiento-5.vercel.app/agentes`

Prueba recomendada:

`Necesito una clase de 45 minutos para 40 estudiantes de 1ro BGU, con 4 balones, sobre pases de baloncesto. Incluye aprendizaje cooperativo, DUA y una rúbrica breve.`
