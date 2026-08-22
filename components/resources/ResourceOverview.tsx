import ResourceTags from "@/components/resources/ResourceTags";
import type { Resource } from "@/types/Resource";

interface ResourceOverviewProps {
  resource: Resource;
}

export default function ResourceOverview({
  resource,
}: ResourceOverviewProps) {
  const hasCompetencies =
    Array.isArray(resource.competencies) &&
    resource.competencies.length > 0;

  return (
    <div className="space-y-8">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
          Acerca de este recurso
        </p>

        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          Descripción
        </h2>

        <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-600">
          {resource.description}
        </p>
      </article>

      {hasCompetencies && (
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
            Desarrollo curricular
          </p>

          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
            Competencias y destrezas
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Referencias curriculares relacionadas con la aplicación
            pedagógica del material.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {resource.competencies?.map((competency) => (
              <span
                key={competency}
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
              >
                {competency}
              </span>
            ))}
          </div>
        </article>
      )}

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
          Organización
        </p>

        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
          Características del material
        </h2>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <dt className="text-sm font-semibold text-slate-500">
              Categorías
            </dt>

            <dd className="mt-2 font-bold leading-6 text-slate-950">
              {resource.categories.join(", ")}
            </dd>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <dt className="text-sm font-semibold text-slate-500">
              Niveles educativos
            </dt>

            <dd className="mt-2 font-bold leading-6 text-slate-950">
              {resource.levels.join(", ")}
            </dd>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <dt className="text-sm font-semibold text-slate-500">
              Formatos incluidos
            </dt>

            <dd className="mt-2 font-bold leading-6 text-slate-950">
              {resource.formats.join(", ")}
            </dd>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <dt className="text-sm font-semibold text-slate-500">
              Dificultad
            </dt>

            <dd className="mt-2 font-bold text-slate-950">
              {resource.difficulty}
            </dd>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <dt className="text-sm font-semibold text-slate-500">
              Duración estimada
            </dt>

            <dd className="mt-2 font-bold text-slate-950">
              {resource.duration || "Duración flexible"}
            </dd>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <dt className="text-sm font-semibold text-slate-500">
              Idioma
            </dt>

            <dd className="mt-2 font-bold text-slate-950">
              {resource.language}
            </dd>
          </div>
        </dl>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
          Accesibilidad e inclusión
        </p>

        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
          Preparado para diferentes necesidades
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Consulta las características inclusivas incorporadas en esta
          versión del recurso.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div
            className={`rounded-2xl border p-5 ${
              resource.dua
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                  resource.dua
                    ? "bg-emerald-100"
                    : "bg-slate-200"
                }`}
                aria-hidden="true"
              >
                ◯
              </span>

              <div>
                <p className="font-bold text-slate-950">
                  Diseño Universal para el Aprendizaje
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {resource.dua
                    ? "Este recurso incorpora principios, alternativas y estrategias relacionadas con el DUA."
                    : "Este recurso todavía no incluye una adaptación específica basada en el DUA."}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl border p-5 ${
              resource.nee
                ? "border-blue-200 bg-blue-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                  resource.nee
                    ? "bg-blue-100"
                    : "bg-slate-200"
                }`}
                aria-hidden="true"
              >
                △
              </span>

              <div>
                <p className="font-bold text-slate-950">
                  Necesidades Educativas Específicas
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {resource.nee
                    ? "Contiene orientaciones o variantes para favorecer una participación inclusiva."
                    : "Las adaptaciones para necesidades educativas se incorporarán en una futura versión."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
          Control de calidad
        </p>

        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
          Información editorial
        </h2>

        <dl className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200">
          <div className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-sm font-semibold text-slate-500">
              Autor
            </dt>

            <dd className="font-bold text-slate-950">
              {resource.author}
            </dd>
          </div>

          <div className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-sm font-semibold text-slate-500">
              Versión
            </dt>

            <dd className="font-bold text-slate-950">
              {resource.version}
            </dd>
          </div>

          <div className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-sm font-semibold text-slate-500">
              Estado de verificación
            </dt>

            <dd
              className={
                resource.verified
                  ? "font-bold text-emerald-700"
                  : "font-bold text-slate-600"
              }
            >
              {resource.verified
                ? "Verificado"
                : "Pendiente de verificación"}
            </dd>
          </div>
        </dl>
      </article>

      <ResourceTags tags={resource.tags} />
    </div>
  );
}