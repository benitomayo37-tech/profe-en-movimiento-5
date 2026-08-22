import {
  getObjectiveTaxonomyById,
  objectiveTaxonomies,
} from "@/features/ai/data/objectiveTaxonomies";
import type {
  AIObjectiveTaxonomy,
} from "@/features/ai/types/ai";

interface AIObjectiveTaxonomySelectorProps {
  value: AIObjectiveTaxonomy;
  onChange: (
    taxonomy: AIObjectiveTaxonomy,
  ) => void;
}

export default function AIObjectiveTaxonomySelector({
  value,
  onChange,
}: AIObjectiveTaxonomySelectorProps) {
  const selectedTaxonomy =
    getObjectiveTaxonomyById(value);

  return (
    <section className="sm:col-span-2 rounded-3xl border border-amber-200 bg-amber-50/60 p-5 sm:p-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
          Formulación del objetivo
        </p>

        <h3 className="mt-2 text-xl font-black text-slate-950">
          Taxonomía para estructurar el objetivo
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          La taxonomía seleccionada definirá los
          verbos observables, el enfoque cognitivo
          o psicomotor y los criterios de logro del
          objetivo de aprendizaje.
        </p>
      </div>

      <div className="mt-5">
        <label
          htmlFor="objective-taxonomy"
          className="text-sm font-bold text-slate-900"
        >
          Seleccionar taxonomía
        </label>

        <select
          id="objective-taxonomy"
          value={value}
          onChange={(event) =>
            onChange(
              event.target
                .value as AIObjectiveTaxonomy,
            )
          }
          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
        >
          {objectiveTaxonomies.map(
            (taxonomy) => (
              <option
                key={taxonomy.id}
                value={taxonomy.id}
              >
                {taxonomy.label}
              </option>
            ),
          )}
        </select>
      </div>

      {selectedTaxonomy ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-white p-4">
          <p className="text-sm font-black text-amber-800">
            {selectedTaxonomy.shortLabel}
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {selectedTaxonomy.description}
          </p>
        </div>
      ) : null}
    </section>
  );
}