import type {
  MicrocycleFormData,
  TrainingDay,
} from "@/features/trainer/types/trainer";

interface MicrocycleFormProps {
  formData: MicrocycleFormData;
  isGenerating: boolean;
  onFieldChange: <K extends keyof MicrocycleFormData>(
    field: K,
    value: MicrocycleFormData[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const DAYS: Array<{ value: TrainingDay; label: string }> = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

const fieldClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

export default function MicrocycleForm({
  formData,
  isGenerating,
  onFieldChange,
  onSubmit,
}: MicrocycleFormProps) {
  function toggleDay(day: TrainingDay) {
    const selected = formData.trainingDays.includes(day);
    const nextDays = selected
      ? formData.trainingDays.filter((current) => current !== day)
      : DAYS.map(({ value }) => value).filter(
          (value) =>
            formData.trainingDays.includes(value) || value === day,
        );

    onFieldChange("trainingDays", nextDays);
  }

  const canSubmit =
    formData.weeklyObjective.trim().length > 0 &&
    formData.trainingDays.length >= 2 &&
    !isGenerating;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
          Planificación semanal
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Configurar microciclo
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Selecciona al menos dos días. Entrenador IA distribuirá objetivos, cargas y recuperación de forma progresiva.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-7 space-y-7">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-bold text-slate-800">
            Deporte
            <input
              required
              value={formData.sport}
              onChange={(event) => onFieldChange("sport", event.target.value)}
              className={fieldClassName}
            />
          </label>

          <label className="text-sm font-bold text-slate-800">
            Categoría
            <input
              required
              value={formData.category}
              onChange={(event) => onFieldChange("category", event.target.value)}
              className={fieldClassName}
            />
          </label>

          <label className="text-sm font-bold text-slate-800">
            Nivel
            <select
              value={formData.level}
              onChange={(event) =>
                onFieldChange(
                  "level",
                  event.target.value as MicrocycleFormData["level"],
                )
              }
              className={fieldClassName}
            >
              <option value="initiation">Iniciación</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </label>

          <label className="text-sm font-bold text-slate-800">
            Fase del entrenamiento
            <select
              value={formData.phase}
              onChange={(event) =>
                onFieldChange(
                  "phase",
                  event.target.value as MicrocycleFormData["phase"],
                )
              }
              className={fieldClassName}
            >
              <option value="general-preparation">Preparación general</option>
              <option value="specific-preparation">Preparación específica</option>
              <option value="pre-competition">Precompetitiva</option>
              <option value="competition">Competitiva</option>
              <option value="recovery">Recuperación</option>
            </select>
          </label>

          <label className="text-sm font-bold text-slate-800">
            Duración por sesión
            <input
              type="number"
              min={30}
              max={180}
              required
              value={formData.sessionDurationMinutes}
              onChange={(event) =>
                onFieldChange(
                  "sessionDurationMinutes",
                  Number(event.target.value),
                )
              }
              className={fieldClassName}
            />
          </label>

          <label className="text-sm font-bold text-slate-800">
            Deportistas
            <input
              type="number"
              min={1}
              max={100}
              required
              value={formData.athleteCount}
              onChange={(event) =>
                onFieldChange("athleteCount", Number(event.target.value))
              }
              className={fieldClassName}
            />
          </label>
        </div>

        <fieldset>
          <legend className="text-sm font-black text-slate-900">
            Días de entrenamiento
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            {DAYS.map((day) => {
              const selected = formData.trainingDays.includes(day.value);
              return (
                <label
                  key={day.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    selected
                      ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 text-slate-600 hover:border-emerald-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleDay(day.value)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  {day.label}
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Seleccionados: {formData.trainingDays.length}. Mínimo requerido: 2.
          </p>
        </fieldset>

        <label className="block text-sm font-bold text-slate-800">
          Objetivo principal del microciclo
          <textarea
            required
            rows={3}
            value={formData.weeklyObjective}
            onChange={(event) =>
              onFieldChange("weeklyObjective", event.target.value)
            }
            placeholder="Ejemplo: mejorar la precisión del pase y aplicarla progresivamente en situaciones reducidas."
            className={fieldClassName}
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-bold text-slate-800">
            Día de competencia
            <select
              value={formData.competitionDay}
              onChange={(event) =>
                onFieldChange(
                  "competitionDay",
                  event.target.value as MicrocycleFormData["competitionDay"],
                )
              }
              className={fieldClassName}
            >
              <option value="none">Sin competencia</option>
              {DAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-bold text-slate-800">
            Espacio disponible
            <input
              required
              value={formData.space}
              onChange={(event) => onFieldChange("space", event.target.value)}
              className={fieldClassName}
            />
          </label>
        </div>

        <label className="block text-sm font-bold text-slate-800">
          Materiales disponibles
          <input
            required
            value={formData.materials}
            onChange={(event) => onFieldChange("materials", event.target.value)}
            className={fieldClassName}
          />
        </label>

        <label className="block text-sm font-bold text-slate-800">
          Indicaciones adicionales
          <textarea
            rows={3}
            value={formData.additionalInstructions}
            onChange={(event) =>
              onFieldChange("additionalInstructions", event.target.value)
            }
            placeholder="Opcional: necesidades tácticas, disponibilidad parcial del espacio u observaciones del equipo."
            className={fieldClassName}
          />
        </label>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Duración total prevista: <strong>{formData.trainingDays.length * formData.sessionDurationMinutes} minutos</strong>
          </p>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? "Generando microciclo..." : "Generar microciclo"}
          </button>
        </div>
      </form>
    </section>
  );
}
