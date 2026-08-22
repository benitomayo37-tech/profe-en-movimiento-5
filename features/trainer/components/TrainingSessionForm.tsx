import type {
  TrainingSessionFormData,
} from "@/features/trainer/types/trainer";

interface TrainingSessionFormProps {
  formData: TrainingSessionFormData;
  onFieldChange: <
    K extends keyof TrainingSessionFormData,
  >(
    field: K,
    value: TrainingSessionFormData[K],
  ) => void;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
  ) => void;
}

const fieldStyles =
  "mt-2 min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

export default function TrainingSessionForm({
  formData,
  onFieldChange,
  onSubmit,
}: TrainingSessionFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
          Configuración
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          Sesión de entrenamiento
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Define el deporte, la categoría, el objetivo y las condiciones reales de trabajo.
        </p>
      </div>

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <label>
          <span className="text-sm font-bold text-slate-800">
            Deporte o disciplina
          </span>
          <input
            type="text"
            required
            value={formData.sport}
            onChange={(event) =>
              onFieldChange("sport", event.target.value)
            }
            placeholder="Ejemplo: baloncesto"
            className={fieldStyles}
          />
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Categoría o grupo de edad
          </span>
          <input
            type="text"
            required
            value={formData.category}
            onChange={(event) =>
              onFieldChange("category", event.target.value)
            }
            placeholder="Ejemplo: Sub-16"
            className={fieldStyles}
          />
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Nivel deportivo
          </span>
          <select
            value={formData.level}
            onChange={(event) =>
              onFieldChange(
                "level",
                event.target.value as TrainingSessionFormData["level"],
              )
            }
            className={fieldStyles}
          >
            <option value="initiation">Iniciación</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Enfoque principal
          </span>
          <select
            value={formData.focus}
            onChange={(event) =>
              onFieldChange(
                "focus",
                event.target.value as TrainingSessionFormData["focus"],
              )
            }
            className={fieldStyles}
          >
            <option value="technical">Técnico</option>
            <option value="tactical">Táctico</option>
            <option value="physical">Físico</option>
            <option value="coordination">Coordinativo</option>
            <option value="recovery">Recuperación</option>
            <option value="combined">Combinado</option>
          </select>
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-bold text-slate-800">
            Objetivo principal
          </span>
          <textarea
            required
            rows={3}
            value={formData.objective}
            onChange={(event) =>
              onFieldChange("objective", event.target.value)
            }
            placeholder="Ejemplo: mejorar la precisión del pase y la ocupación de espacios en situaciones reducidas"
            className={`${fieldStyles} py-3`}
          />
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Duración total
          </span>
          <div className="relative mt-2">
            <input
              type="number"
              min={15}
              max={300}
              required
              value={formData.durationMinutes}
              onChange={(event) =>
                onFieldChange(
                  "durationMinutes",
                  Number(event.target.value),
                )
              }
              className={`${fieldStyles} mt-0 pr-24`}
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-slate-500">
              minutos
            </span>
          </div>
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Cantidad de deportistas
          </span>
          <input
            type="number"
            min={1}
            max={200}
            required
            value={formData.athleteCount}
            onChange={(event) =>
              onFieldChange(
                "athleteCount",
                Number(event.target.value),
              )
            }
            className={fieldStyles}
          />
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Intensidad prevista
          </span>
          <select
            value={formData.intensity}
            onChange={(event) =>
              onFieldChange(
                "intensity",
                event.target.value as TrainingSessionFormData["intensity"],
              )
            }
            className={fieldStyles}
          >
            <option value="low">Baja</option>
            <option value="moderate">Moderada</option>
            <option value="high-controlled">Alta controlada</option>
          </select>
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Contexto competitivo
          </span>
          <select
            value={formData.competitionContext}
            onChange={(event) =>
              onFieldChange(
                "competitionContext",
                event.target.value,
              )
            }
            className={fieldStyles}
          >
            <option value="without-competition">Sin competencia próxima</option>
            <option value="more-than-seven-days">Competencia en más de 7 días</option>
            <option value="three-to-seven-days">Competencia entre 3 y 7 días</option>
            <option value="next-48-hours">Competencia en las próximas 48 horas</option>
          </select>
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Materiales disponibles
          </span>
          <input
            type="text"
            required
            value={formData.materials}
            onChange={(event) =>
              onFieldChange("materials", event.target.value)
            }
            placeholder="Ejemplo: 4 balones, conos y silbato"
            className={fieldStyles}
          />
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Espacio disponible
          </span>
          <input
            type="text"
            required
            value={formData.space}
            onChange={(event) =>
              onFieldChange("space", event.target.value)
            }
            placeholder="Ejemplo: media cancha de baloncesto"
            className={fieldStyles}
          />
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-bold text-slate-800">
            Indicaciones adicionales
          </span>
          <textarea
            rows={4}
            value={formData.additionalInstructions}
            onChange={(event) =>
              onFieldChange(
                "additionalInstructions",
                event.target.value,
              )
            }
            placeholder="Incluye necesidades del grupo, restricciones, antecedentes de la semana o aspectos de seguridad relevantes."
            className={`${fieldStyles} py-3`}
          />
        </label>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-xs leading-5 text-slate-500">
          Entrenador IA priorizará progresión, recuperación, participación activa y seguridad según la categoría indicada.
        </p>

        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-600 px-6 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
        >
          Preparar configuración
        </button>
      </div>
    </form>
  );
}
