import {
  getPlanningMethodologyById,
  planningMethodologies,
} from "@/features/ai/data/planningMethodologies";
import type {
  AIPlanningMethodology,
} from "@/features/ai/types/ai";

interface AIPlanningMethodologySelectorProps {
  value: AIPlanningMethodology;
  onChange: (
    methodology: AIPlanningMethodology,
  ) => void;
}

export default function AIPlanningMethodologySelector({
  value,
  onChange,
}: AIPlanningMethodologySelectorProps) {
  const selectedMethodology =
    getPlanningMethodologyById(value);

  return (
    <section className="sm:col-span-2 rounded-3xl border border-violet-200 bg-violet-50/60 p-5 sm:p-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">
          Metodología de la planificación
        </p>

        <h3 className="mt-2 text-xl font-black text-slate-950">
          Estrategia para desarrollar la clase
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          La metodología seleccionada se aplicará
          en las actividades, la organización, los
          roles y la evaluación.
        </p>
      </div>

      <div className="mt-5">
        <label
          htmlFor="planning-methodology"
          className="text-sm font-bold text-slate-900"
        >
          Seleccionar metodología
        </label>

        <select
          id="planning-methodology"
          value={value}
          onChange={(event) =>
            onChange(
              event.target
                .value as AIPlanningMethodology,
            )
          }
          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
        >
          {planningMethodologies.map(
            (methodology) => (
              <option
                key={methodology.id}
                value={methodology.id}
              >
                {methodology.label}
              </option>
            ),
          )}
        </select>
      </div>

      {selectedMethodology ? (
        <div className="mt-4 rounded-2xl border border-violet-200 bg-white p-4">
          <p className="text-sm font-black text-violet-800">
            {selectedMethodology.shortLabel}
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {selectedMethodology.description}
          </p>
        </div>
      ) : null}
    </section>
  );
}