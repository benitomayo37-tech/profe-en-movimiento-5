# Centro de Agentes IA

## Incluye

- Ruta privada `/agentes`.
- Coordinador Docente.
- Agentes de Planificación, Evaluación, Inclusión y Entrenamiento Deportivo.
- Memoria persistente por conversación en Supabase.
- Resultados guardados únicamente por confirmación del usuario.
- Límites mensuales: 3 Free, 100 Pro y 1000 para administración.
- Un microciclo mensual de prueba para cuentas Free.
- Mesociclos y macrociclos disponibles para cuentas Pro.
- Las aclaraciones no consumen ejecuciones y el Plan Free permite una corrección por resultado terminado.
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

Ejecuta, en orden, las migraciones que todavía no estén aplicadas:

1. `supabase/migrations/20260902_ai_agents_phase_1.sql`
2. `supabase/migrations/20260903_ai_agents_training_phase_2.sql`
3. `supabase/migrations/20260904_ai_agent_feature_usage.sql`
4. `supabase/migrations/20260908_agent_response_kind.sql`
5. `supabase/migrations/20260912_ai_agent_security_and_consistency.sql`

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
git add app/agentes app/api/agents features/agents INSTALACION-CENTRO-AGENTES-IA-FASE-1.md supabase/migrations/20260912_ai_agent_security_and_consistency.sql
git commit -m "fix: refuerza límites y consistencia de Agentes IA"
git push origin main
```

No se necesita una clave nueva: utiliza `OPENAI_API_KEY` y `OPENAI_MODEL` ya configuradas. Opcionalmente puede definirse `OPENAI_AGENT_MODEL` para usar otro modelo solo en los agentes.

## 6. Prueba inicial

Inicia sesión y abre:

`https://profe-en-movimiento-5.vercel.app/agentes`

Prueba recomendada:

`Necesito una clase de 45 minutos para 40 estudiantes de 1ro BGU, con 4 balones, sobre pases de baloncesto. Incluye aprendizaje cooperativo, DUA y una rúbrica breve.`
