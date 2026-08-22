import type { MacrocycleFormData } from "@/features/trainer/types/trainer";

interface Props {
  formData: MacrocycleFormData;
  isGenerating: boolean;
  onFieldChange: <K extends keyof MacrocycleFormData>(
    field: K,
    value: MacrocycleFormData[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const fieldClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

export default function MacrocycleForm({
  formData,
  isGenerating,
  onFieldChange,
  onSubmit,
}: Props) {
  const totalWeeks =
    formData.preparatoryWeeks +
    formData.competitiveWeeks +
    formData.transitionWeeks;
  const totalSessions = totalWeeks * formData.sessionsPerWeek;
  const totalMinutes = totalSessions * formData.sessionDurationMinutes;
  const canSubmit =
    formData.seasonObjective.trim().length > 0 &&
    totalWeeks >= 8 &&
    totalWeeks <= 52 &&
    !isGenerating;

  function updatePeriodWeeks(
    field: "preparatoryWeeks" | "competitiveWeeks" | "transitionWeeks",
    value: number,
  ) {
    const nextPreparatory =
      field === "preparatoryWeeks" ? value : formData.preparatoryWeeks;
    const nextCompetitive =
      field === "competitiveWeeks" ? value : formData.competitiveWeeks;
    onFieldChange(field, value);

    if (
      formData.mainCompetitionWeek !== null &&
      (formData.mainCompetitionWeek < nextPreparatory + 1 ||
        formData.mainCompetitionWeek > nextPreparatory + nextCompetitive)
    ) {
      onFieldChange("mainCompetitionWeek", null);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
          Planificación de temporada
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Configurar macrociclo
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Distribuye la temporada en periodo preparatorio, competitivo y de
          transición, con progresión, recuperación y control de carga.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-7 space-y-7">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <TextField
            label="Deporte"
            value={formData.sport}
            onChange={(value) => onFieldChange("sport", value)}
          />
          <TextField
            label="Categoría"
            value={formData.category}
            onChange={(value) => onFieldChange("category", value)}
          />
          <label className="text-sm font-bold text-slate-800">
            Nivel
            <select
              value={formData.level}
              onChange={(event) =>
                onFieldChange(
                  "level",
                  event.target.value as MacrocycleFormData["level"],
                )
              }
              className={fieldClass}
            >
              <option value="initiation">Iniciación</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </label>
          <NumberField
            label="Semanas preparatorias"
            value={formData.preparatoryWeeks}
            min={4}
            max={40}
            onChange={(value) => updatePeriodWeeks("preparatoryWeeks", value)}
          />
          <NumberField
            label="Semanas competitivas"
            value={formData.competitiveWeeks}
            min={2}
            max={30}
            onChange={(value) => updatePeriodWeeks("competitiveWeeks", value)}
          />
          <NumberField
            label="Semanas de transición"
            value={formData.transitionWeeks}
            min={1}
            max={8}
            onChange={(value) => updatePeriodWeeks("transitionWeeks", value)}
          />
          <NumberField
            label="Sesiones por semana"
            value={formData.sessionsPerWeek}
            min={2}
            max={7}
            onChange={(value) => onFieldChange("sessionsPerWeek", value)}
          />
          <NumberField
            label="Duración por sesión (min)"
            value={formData.sessionDurationMinutes}
            min={30}
            max={180}
            onChange={(value) =>
              onFieldChange("sessionDurationMinutes", value)
            }
          />
          <NumberField
            label="Deportistas"
            value={formData.athleteCount}
            min={1}
            max={100}
            onChange={(value) => onFieldChange("athleteCount", value)}
          />
          <label className="text-sm font-bold text-slate-800">
            Semana de competencia principal
            <select
              value={formData.mainCompetitionWeek ?? "none"}
              onChange={(event) =>
                onFieldChange(
                  "mainCompetitionWeek",
                  event.target.value === "none"
                    ? null
                    : Number(event.target.value),
                )
              }
              className={fieldClass}
            >
              <option value="none">Sin competencia definida</option>
              {Array.from(
                { length: formData.competitiveWeeks },
                (_, index) => formData.preparatoryWeeks + index + 1,
              ).map((week) => (
                  <option key={week} value={week}>
                    Semana {week}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-bold text-slate-800">
          Objetivo principal de la temporada
          <textarea
            required
            rows={3}
            value={formData.seasonObjective}
            onChange={(event) =>
              onFieldChange("seasonObjective", event.target.value)
            }
            placeholder="Ejemplo: desarrollar progresivamente los fundamentos técnicos y transferirlos al rendimiento competitivo de la categoría."
            className={fieldClass}
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Espacio disponible"
            value={formData.space}
            onChange={(value) => onFieldChange("space", value)}
          />
          <TextField
            label="Materiales disponibles"
            value={formData.materials}
            onChange={(value) => onFieldChange("materials", value)}
          />
        </div>

        <label className="block text-sm font-bold text-slate-800">
          Indicaciones adicionales
          <textarea
            rows={3}
            value={formData.additionalInstructions}
            onChange={(event) =>
              onFieldChange("additionalInstructions", event.target.value)
            }
            className={fieldClass}
          />
        </label>

        <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-slate-600">
            <strong className="text-slate-900">Resumen:</strong> {totalWeeks}{" "}
            semanas · {totalSessions} sesiones · {totalMinutes} minutos.
          </p>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? "Diseñando macrociclo…" : "Generar macrociclo"}
          </button>
        </div>

        {totalWeeks < 8 || totalWeeks > 52 ? (
          <p className="text-sm font-semibold text-red-700">
            La suma de los tres periodos debe estar entre 8 y 52 semanas.
          </p>
        ) : null}
      </form>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm font-bold text-slate-800">
      {label}
      <input
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="text-sm font-bold text-slate-800">
      {label}
      <input
        type="number"
        required
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={fieldClass}
      />
    </label>
  );
}
