import type { AIRubricData } from "@/features/ai/types/ai";

interface AIRubricTableProps {
  rubric: AIRubricData;
  compact?: boolean;
}

export default function AIRubricTable({
  rubric,
  compact = false,
}: AIRubricTableProps) {
  return (
    <section className="mt-6">
      <h4 className="mb-4 text-lg font-black text-slate-950">
        {rubric.title}
      </h4>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full min-w-[1000px] border-collapse text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="border border-slate-200 px-4 py-3 text-sm font-black">
                Criterio
              </th>

              <th className="border border-slate-200 px-4 py-3 text-sm font-black">
                Excelente (10)
              </th>

              <th className="border border-slate-200 px-4 py-3 text-sm font-black">
                Bien (9)
              </th>

              <th className="border border-slate-200 px-4 py-3 text-sm font-black">
                Regular (8)
              </th>

              <th className="border border-slate-200 px-4 py-3 text-sm font-black">
                Aceptable (7)
              </th>

              <th className="border border-slate-200 px-4 py-3 text-sm font-black">
                Mejorable (5)
              </th>
            </tr>
          </thead>

          <tbody>
            {rubric.criteria.map((criterion, index) => (
              <tr key={`${criterion.criterion}-${index}`}>
                <th className="border border-slate-200 px-4 py-3 align-top text-sm font-black text-slate-900">
                  {criterion.criterion}
                </th>

                <td className="border border-slate-200 px-4 py-3 align-top text-sm leading-6 text-slate-700">
                  {criterion.excellent}
                </td>

                <td className="border border-slate-200 px-4 py-3 align-top text-sm leading-6 text-slate-700">
                  {criterion.good}
                </td>

                <td className="border border-slate-200 px-4 py-3 align-top text-sm leading-6 text-slate-700">
                  {criterion.regular}
                </td>

                <td className="border border-slate-200 px-4 py-3 align-top text-sm leading-6 text-slate-700">
                  {criterion.acceptable}
                </td>

                <td className="border border-slate-200 px-4 py-3 align-top text-sm leading-6 text-slate-700">
                  {criterion.improvable}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!compact && (
        <p className="mt-3 text-xs text-slate-500">
          Escala de valoración: Excelente 10 · Bien 9 · Regular 8 · Aceptable 7 · Mejorable 5
        </p>
      )}
    </section>
  );
}