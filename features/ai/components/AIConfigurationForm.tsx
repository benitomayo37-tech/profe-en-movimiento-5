import AIExamConfiguration from "./AIExamConfiguration";
import AIObjectiveTaxonomySelector from "./AIObjectiveTaxonomySelector";
import AIPlanningMethodologySelector from "./AIPlanningMethodologySelector";

import { getAIToolById } from "@/features/ai/data/aiTools";
import type { AIFormData } from "@/features/ai/types/ai";

interface AIConfigurationFormProps {
  formData: AIFormData;
  isGenerating: boolean;
  onFieldChange: <K extends keyof AIFormData>(
    field: K,
    value: AIFormData[K],
  ) => void;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
  ) => void;
}

const fieldStyles =
  "mt-2 min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const presetDurations = [
  "45 minutos",
  "60 minutos",
  "90 minutos",
] as const;

const gradesByEducationalLevel: Record<
  string,
  string[]
> = {
  "Educación General Básica Elemental": [
    "2do EGB",
    "3ro EGB",
    "4to EGB",
  ],
  "Educación General Básica Media": [
    "5to EGB",
    "6to EGB",
    "7mo EGB",
  ],
  "Educación General Básica Superior": [
    "8vo EGB",
    "9no EGB",
    "10mo EGB",
  ],
  "Bachillerato General Unificado": [
    "1ro BGU",
    "2do BGU",
    "3ro BGU",
  ],
};

export default function AIConfigurationForm({
  formData,
  isGenerating,
  onFieldChange,
  onSubmit,
}: AIConfigurationFormProps) {
  const selectedTool = getAIToolById(
    formData.toolId,
  );

  const availableGrades =
    gradesByEducationalLevel[formData.educationalLevel] ?? [];

  function handleEducationalLevelChange(
    educationalLevel: string,
  ) {
    const grades =
      gradesByEducationalLevel[
        educationalLevel
      ] ?? [];

    onFieldChange(
      "educationalLevel",
      educationalLevel,
    );

    onFieldChange(
      "grade",
      grades[0] ?? "",
    );
  }

  const usesFlexibleDuration =
  !presetDurations.some(
    (duration) =>
      duration ===
      formData.duration,
  );

const flexibleDurationMinutes =
  formData.duration.match(
    /^\d+/,
  )?.[0] ?? "";

  return (
    <form
  onSubmit={onSubmit}
  translate="no"
  className="notranslate rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
>
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div
          key={formData.toolId}
          translate="no"
          className="notranslate"
        >
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
            Configuración
          </p>

          <h2
            key={`title-${formData.toolId}`}
            className="mt-2 text-2xl font-black tracking-tight text-slate-950"
          >
            <span aria-hidden="true">
              {selectedTool?.icon}
            </span>{" "}
            <span>{selectedTool?.title}</span>
          </h2>

          <p
            key={`description-${formData.toolId}`}
            className="mt-2 max-w-2xl text-sm leading-6 text-slate-600"
          >
            {selectedTool?.description}
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
          <span
            className="h-2 w-2 rounded-full bg-emerald-500"
            aria-hidden="true"
          />
          IA conectada
        </span>
      </div>

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="text-sm font-bold text-slate-800">
            Tema o contenido
          </span>

          <input
            type="text"
            value={formData.topic}
            onChange={(event) =>
              onFieldChange(
                "topic",
                event.target.value,
              )
            }
            placeholder="Ejemplo: técnica de carreras de velocidad"
            className={fieldStyles}
          />
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Nivel educativo
          </span>

         <select
  value={formData.educationalLevel}
  onChange={(event) =>
    handleEducationalLevelChange(
      event.target.value,
    )
  }
  className={fieldStyles}
>
  <option value="Educación General Básica Elemental">
    Educación General Básica Elemental
  </option>

  <option value="Educación General Básica Media">
    Educación General Básica Media
  </option>

  <option value="Educación General Básica Superior">
    Educación General Básica Superior
  </option>

  <option value="Bachillerato General Unificado">
    Bachillerato General Unificado
  </option>
</select>

</label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Grado o curso
          </span>

          <select
            value={formData.grade}
            onChange={(event) =>
              onFieldChange("grade", event.target.value)
            }
            className={fieldStyles}
          >
            {availableGrades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </label>
        
       <div>
  <label
    htmlFor="ai-duration"
    className="text-sm font-bold text-slate-800"
  >
    Duración
  </label>

  <select
    id="ai-duration"
    value={
      usesFlexibleDuration
        ? "Duración flexible"
        : formData.duration
    }
    onChange={(event) => {
      const selectedDuration =
        event.target.value;

      onFieldChange(
        "duration",
        selectedDuration ===
          "Duración flexible"
          ? "20 minutos"
          : selectedDuration,
      );
    }}
    className={fieldStyles}
  >
    {presetDurations.map(
      (duration) => (
        <option
          key={duration}
          value={duration}
        >
          {duration}
        </option>
      ),
    )}

    <option value="Duración flexible">
      Duración flexible
    </option>
  </select>

  {usesFlexibleDuration ? (
    <div className="mt-3">
      <label
        htmlFor="ai-flexible-duration"
        className="text-sm font-bold text-slate-800"
      >
        Minutos personalizados
      </label>

      <div className="relative mt-2">
        <input
          id="ai-flexible-duration"
          type="number"
          min={1}
          max={300}
          step={1}
          required
          value={flexibleDurationMinutes}
          onChange={(event) => {
            const minutes =
              event.target.value;

            onFieldChange(
              "duration",
              minutes
                ? `${minutes} minutos`
                : "",
            );
          }}
          placeholder="Ejemplo: 20"
          className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-24 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-slate-500">
          minutos
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        Introduce una duración entre 1 y
        300 minutos.
      </p>
    </div>
  ) : null}
</div>
        <label>
          <span className="text-sm font-bold text-slate-800">
            Cantidad de estudiantes
          </span>

          <input
            type="text"
            value={formData.students}
            onChange={(event) =>
              onFieldChange(
                "students",
                event.target.value,
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
            type="text"
            value={formData.materials}
            onChange={(event) =>
              onFieldChange(
                "materials",
                event.target.value,
              )
            }
            className={fieldStyles}
          />
        </label>

        <label>
          <span className="text-sm font-bold text-slate-800">
            Destreza con criterio de desempeño
          </span>

          <input
            type="text"
            value={formData.curriculumCode}
            onChange={(event) =>
              onFieldChange(
                "curriculumCode",
                event.target.value,
              )
            }
            placeholder="Ejemplo: EF.5.4.1"
            className={fieldStyles}
          />
        </label>

       {formData.toolId === "lesson-plan" ? (
  <>
    <AIPlanningMethodologySelector
      value={
        formData.planningMethodology
      }
      onChange={(
        planningMethodology,
      ) =>
        onFieldChange(
          "planningMethodology",
          planningMethodology,
        )
      }
    />

    <AIObjectiveTaxonomySelector
      value={
        formData.objectiveTaxonomy
      }
      onChange={(
        objectiveTaxonomy,
      ) =>
        onFieldChange(
          "objectiveTaxonomy",
          objectiveTaxonomy,
        )
      }
    />
  </>
) : null}

        {formData.toolId === "exam" &&
        formData.examConfig ? (
          <AIExamConfiguration
            config={formData.examConfig}
            onChange={(examConfig) =>
              onFieldChange(
                "examConfig",
                examConfig,
              )
            }
          />
        ) : null}

        <div className="sm:col-span-2">
          <p className="text-sm font-bold text-slate-800">
            Adaptaciones
          </p>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 transition hover:bg-emerald-50">
              <input
                type="checkbox"
                checked={formData.includeDua}
                onChange={(event) =>
                  onFieldChange(
                    "includeDua",
                    event.target.checked,
                  )
                }
                className="h-5 w-5 accent-emerald-600"
              />

              <div>
                <p className="font-bold text-slate-950">
                  Incluir DUA
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Representación, acción, expresión e
                  implicación.
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 transition hover:bg-blue-50">
              <input
                type="checkbox"
                checked={formData.includeNee}
                onChange={(event) =>
                  onFieldChange(
                    "includeNee",
                    event.target.checked,
                  )
                }
                className="h-5 w-5 accent-blue-600"
              />

              <div>
                <p className="font-bold text-slate-950">
                  Incluir adaptación NEE
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Variantes, apoyos y participación
                  inclusiva.
                </p>
              </div>
            </label>
          </div>
        </div>

        <label className="sm:col-span-2">
          <span className="text-sm font-bold text-slate-800">
            Indicaciones adicionales
          </span>

          <textarea
            value={
              formData.additionalInstructions
            }
            onChange={(event) =>
              onFieldChange(
                "additionalInstructions",
                event.target.value,
              )
            }
            rows={4}
            placeholder="Ejemplo: utilizar pocos recursos, incluir coevaluación y organizar grupos de cinco estudiantes."
            className="mt-2 w-full resize-y rounded-2xl border border-slate-300 bg-white p-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </div>
      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          disabled={isGenerating}
          className="inline-flex min-h-14 min-w-[240px] items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 px-7 py-4 text-base font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-wait disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <span
                className="mr-3 animate-spin"
                aria-hidden="true"
              >
                ◌
              </span>
              Profe IA está trabajando…
            </>
          ) : (
            <>
              <span
                className="mr-3"
                aria-hidden="true"
              >
                ✨
              </span>
              Generar contenido
            </>
          )}
        </button>
      </div>
    </form>
  );
}
