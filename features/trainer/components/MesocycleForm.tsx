import type { MesocycleFormData } from "@/features/trainer/types/trainer";

interface Props {
  formData: MesocycleFormData;
  isGenerating: boolean;
  onFieldChange: <K extends keyof MesocycleFormData>(
    field: K,
    value: MesocycleFormData[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const fieldClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

export default function MesocycleForm({
  formData,
  isGenerating,
  onFieldChange,
  onSubmit,
}: Props) {
  const totalSessions = formData.weekCount * formData.sessionsPerWeek;
  const totalMinutes = totalSessions * formData.sessionDurationMinutes;
  const canSubmit = formData.mainObjective.trim().length > 0 && !isGenerating;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
          Planificación por etapas
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Configurar mesociclo</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Organiza entre tres y ocho semanas con progresión, recuperación y control de carga.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-7 space-y-7">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <TextField label="Deporte" value={formData.sport} onChange={(value) => onFieldChange("sport", value)} />
          <TextField label="Categoría" value={formData.category} onChange={(value) => onFieldChange("category", value)} />
          <label className="text-sm font-bold text-slate-800">
            Nivel
            <select value={formData.level} onChange={(event) => onFieldChange("level", event.target.value as MesocycleFormData["level"])} className={fieldClass}>
              <option value="initiation">Iniciación</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </label>
          <label className="text-sm font-bold text-slate-800">
            Fase del entrenamiento
            <select value={formData.phase} onChange={(event) => onFieldChange("phase", event.target.value as MesocycleFormData["phase"])} className={fieldClass}>
              <option value="general-preparation">Preparación general</option>
              <option value="specific-preparation">Preparación específica</option>
              <option value="pre-competition">Precompetitiva</option>
              <option value="competition">Competitiva</option>
              <option value="recovery">Recuperación</option>
            </select>
          </label>
          <NumberField label="Semanas" value={formData.weekCount} min={3} max={8} onChange={(value) => {
            onFieldChange("weekCount", value);
            if (formData.competitionWeek !== null && formData.competitionWeek > value) onFieldChange("competitionWeek", null);
          }} />
          <NumberField label="Sesiones por semana" value={formData.sessionsPerWeek} min={2} max={7} onChange={(value) => onFieldChange("sessionsPerWeek", value)} />
          <NumberField label="Duración por sesión (min)" value={formData.sessionDurationMinutes} min={30} max={180} onChange={(value) => onFieldChange("sessionDurationMinutes", value)} />
          <NumberField label="Deportistas" value={formData.athleteCount} min={1} max={100} onChange={(value) => onFieldChange("athleteCount", value)} />
          <label className="text-sm font-bold text-slate-800">
            Semana de competencia
            <select value={formData.competitionWeek ?? "none"} onChange={(event) => onFieldChange("competitionWeek", event.target.value === "none" ? null : Number(event.target.value))} className={fieldClass}>
              <option value="none">Sin competencia</option>
              {Array.from({ length: formData.weekCount }, (_, index) => index + 1).map((week) => <option key={week} value={week}>Semana {week}</option>)}
            </select>
          </label>
        </div>

        <label className="block text-sm font-bold text-slate-800">
          Objetivo principal del mesociclo
          <textarea required rows={3} value={formData.mainObjective} onChange={(event) => onFieldChange("mainObjective", event.target.value)} placeholder="Ejemplo: consolidar la precisión del pase y transferirla progresivamente al juego aplicado." className={fieldClass} />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Espacio disponible" value={formData.space} onChange={(value) => onFieldChange("space", value)} />
          <TextField label="Materiales disponibles" value={formData.materials} onChange={(value) => onFieldChange("materials", value)} />
        </div>

        <label className="block text-sm font-bold text-slate-800">
          Indicaciones adicionales
          <textarea rows={3} value={formData.additionalInstructions} onChange={(event) => onFieldChange("additionalInstructions", event.target.value)} className={fieldClass} />
        </label>

        <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-slate-600">
            <strong className="text-slate-900">Resumen:</strong> {formData.weekCount} semanas · {totalSessions} sesiones · {totalMinutes} minutos.
          </p>
          <button type="submit" disabled={!canSubmit} className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
            {isGenerating ? "Diseñando mesociclo…" : "Generar mesociclo"}
          </button>
        </div>
      </form>
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-sm font-bold text-slate-800">{label}<input required value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass} /></label>;
}

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <label className="text-sm font-bold text-slate-800">{label}<input type="number" required min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className={fieldClass} /></label>;
}
