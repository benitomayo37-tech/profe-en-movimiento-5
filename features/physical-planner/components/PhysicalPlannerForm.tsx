import type {
  PhysicalPlannerFormData,
} from "@/features/physical-planner/types/physicalPlanner";

interface PhysicalPlannerFormProps {
  formData: PhysicalPlannerFormData;
  hasProAccess: boolean;
  isGenerating: boolean;
  onFieldChange: <
    K extends keyof PhysicalPlannerFormData,
  >(
    field: K,
    value: PhysicalPlannerFormData[K],
  ) => void;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
  ) => void;
}

const fieldStyles =
  "mt-2 min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60";

export default function PhysicalPlannerForm({
  formData,
  hasProAccess,
  isGenerating,
  onFieldChange,
  onSubmit,
}: PhysicalPlannerFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
          Configuración de la sesión
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          Define las condiciones reales
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          El Planificador organizará carga, intervalos,
          recuperación, participación y seguridad con los
          materiales disponibles.
        </p>
      </div>

      <fieldset
        disabled={isGenerating}
        className="mt-7 grid gap-6 sm:grid-cols-2"
      >
        <legend className="sr-only">
          Datos de la sesión
        </legend>

        <div className="sm:col-span-2">
          <span className="text-sm font-bold text-slate-800">
            Tipo de planificación
          </span>

          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                onFieldChange(
                  "context",
                  "physical_education",
                )
              }
              className={`rounded-2xl border p-4 text-left transition ${
                formData.context === "physical_education"
                  ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100"
                  : "border-slate-300 bg-white hover:border-orange-300"
              }`}
            >
              <strong className="block text-slate-950">
                Educación Física
              </strong>
              <span className="mt-1 block text-xs leading-5 text-slate-600">
                Sesión educativa con DUA, participación,
                indicadores y adaptaciones.
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                onFieldChange("context", "sport")
              }
              className={`rounded-2xl border p-4 text-left transition ${
                formData.context === "sport"
                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                  : "border-slate-300 bg-white hover:border-blue-300"
              }`}
            >
              <strong className="block text-slate-950">
                Preparación deportiva
              </strong>
              <span className="mt-1 block text-xs leading-5 text-slate-600">
                Dosificación física aplicada a una disciplina
                y categoría deportiva.
              </span>
            </button>
          </div>

          {!hasProAccess &&
          formData.context === "sport" ? (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-900">
              El Plan Free incluye una prueba mensual de
              preparación deportiva.
            </p>
          ) : null}
        </div>

        <label>
          <span className="text-sm font-bold text-slate-800">
            {formData.context === "sport"
              ? "Deporte o disciplina"
              : "Actividad o contenido"}
          </span>
          <input
            required
            type="text"
            maxLength={120}
            value={formData.activityOrSport}
            onChange={(event) =>
              onFieldChange(
                "activityOrSport",
                event.target.value,
              )
            }
            placeholder={
              formData.context === "sport"
                ? "Ejemplo: baloncesto"
                : "Ejemplo: circuito de capacidades físicas"
            }
            className={fieldStyles}
          />
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            {formData.context === "sport"
              ? "Categoría o grupo de edad"
              : "Nivel, curso o grupo"}
          </span>
          <input
            required
            type="text"
            maxLength={120}
            value={formData.group}
            onChange={(event) =>
              onFieldChange("group", event.target.value)
            }
            placeholder={
              formData.context === "sport"
                ? "Ejemplo: Sub-16"
                : "Ejemplo: 1ro BGU"
            }
            className={fieldStyles}
          />
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Experiencia del grupo
          </span>
          <input
            required
            type="text"
            maxLength={500}
            value={formData.experience}
            onChange={(event) =>
              onFieldChange(
                "experience",
                event.target.value,
              )
            }
            placeholder="Ejemplo: experiencia básica y grupo heterogéneo"
            className={fieldStyles}
          />
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Nivel técnico
          </span>
          <select
            value={formData.level}
            onChange={(event) =>
              onFieldChange(
                "level",
                event.target
                  .value as PhysicalPlannerFormData["level"],
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
            Capacidad física principal
          </span>
          <select
            value={formData.capacity}
            onChange={(event) =>
              onFieldChange(
                "capacity",
                event.target
                  .value as PhysicalPlannerFormData["capacity"],
              )
            }
            className={fieldStyles}
          >
            <option value="strength">Fuerza</option>
            <option value="endurance">Resistencia</option>
            <option value="speed">Velocidad</option>
            <option value="mobility">
              Movilidad y flexibilidad
            </option>
            <option value="coordination">
              Coordinación
            </option>
            <option value="agility">Agilidad</option>
            <option value="balance">Equilibrio</option>
            <option value="combined">
              Capacidades combinadas
            </option>
          </select>
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
                event.target
                  .value as PhysicalPlannerFormData["intensity"],
              )
            }
            className={fieldStyles}
          >
            <option value="low">Baja</option>
            <option value="moderate">Moderada</option>
            <option value="high-controlled">
              Alta controlada
            </option>
          </select>
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-bold text-slate-800">
            Objetivo operativo
          </span>
          <textarea
            required
            rows={3}
            maxLength={800}
            value={formData.objective}
            onChange={(event) =>
              onFieldChange(
                "objective",
                event.target.value,
              )
            }
            placeholder="Ejemplo: mejorar la resistencia aeróbica manteniendo una ejecución técnica controlada"
            className={`${fieldStyles} py-3`}
          />
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Duración total
          </span>

          {hasProAccess ? (
            <div className="relative mt-2">
              <input
                required
                type="number"
                min={15}
                max={180}
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
          ) : (
            <select
              value={formData.durationMinutes}
              onChange={(event) =>
                onFieldChange(
                  "durationMinutes",
                  Number(event.target.value),
                )
              }
              className={fieldStyles}
            >
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>60 minutos</option>
            </select>
          )}

          <span className="mt-2 block text-xs text-slate-500">
            {hasProAccess
              ? "Plan Pro: duración personalizada entre 15 y 180 minutos."
              : "Plan Free: 30, 45 o 60 minutos."}
          </span>
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Cantidad de participantes
          </span>
          <input
            required
            type="number"
            min={1}
            max={200}
            value={formData.participantCount}
            onChange={(event) =>
              onFieldChange(
                "participantCount",
                Number(event.target.value),
              )
            }
            className={fieldStyles}
          />
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Materiales disponibles
          </span>
          <input
            required
            type="text"
            maxLength={500}
            value={formData.materials}
            onChange={(event) =>
              onFieldChange(
                "materials",
                event.target.value,
              )
            }
            placeholder="Ejemplo: únicamente 4 balones"
            className={fieldStyles}
          />
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Espacio disponible
          </span>
          <input
            required
            type="text"
            maxLength={400}
            value={formData.space}
            onChange={(event) =>
              onFieldChange("space", event.target.value)
            }
            placeholder="Ejemplo: cancha escolar completa"
            className={fieldStyles}
          />
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-bold text-slate-800">
            Necesidades de inclusión
          </span>
          <textarea
            rows={3}
            maxLength={800}
            value={formData.inclusionNeeds}
            onChange={(event) =>
              onFieldChange(
                "inclusionNeeds",
                event.target.value,
              )
            }
            placeholder="Describe apoyos o ajustes necesarios sin incluir nombres ni diagnósticos."
            className={`${fieldStyles} py-3`}
          />
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-bold text-slate-800">
            Consideraciones de seguridad
          </span>
          <textarea
            rows={3}
            maxLength={800}
            value={formData.safetyNotes}
            onChange={(event) =>
              onFieldChange(
                "safetyNotes",
                event.target.value,
              )
            }
            placeholder="Ejemplo: superficie exterior y clima cálido"
            className={`${fieldStyles} py-3`}
          />
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-bold text-slate-800">
            Indicaciones adicionales
          </span>
          <textarea
            rows={3}
            maxLength={1200}
            value={formData.additionalInstructions}
            onChange={(event) =>
              onFieldChange(
                "additionalInstructions",
                event.target.value,
              )
            }
            placeholder="Añade prioridades metodológicas u organizativas."
            className={`${fieldStyles} py-3`}
          />
        </label>
      </fieldset>

      <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs leading-5 text-slate-500">
          <p>
            La herramienta no diagnostica ni sustituye
            orientación médica o profesional.
          </p>
          <p className="font-semibold text-slate-700">
            {hasProAccess
              ? "Plan Pro · 40 sesiones mensuales · historial de 50"
              : "Plan Free · 2 sesiones mensuales · historial de 3"}
          </p>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-orange-600 px-6 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating
            ? "Generando sesión..."
            : "Generar planificación física →"}
        </button>
      </div>
    </form>
  );
}