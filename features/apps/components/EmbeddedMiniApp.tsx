import type { MiniAppDefinition } from "@/features/apps/data/miniApps";

interface EmbeddedMiniAppProps {
  app: MiniAppDefinition;
}

export default function EmbeddedMiniApp({ app }: EmbeddedMiniAppProps) {
  if (!app.embeddedAsset) return null;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
            Herramienta interactiva
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Trabaja directamente en el panel. La herramienta tiene desplazamiento propio.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-800">
          <span aria-hidden="true">●</span> Disponible
        </span>
      </div>

      <iframe
        src={`/api/miniapps/${app.id}`}
        title={app.title}
        loading="eager"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-downloads allow-modals"
        className="h-[780px] w-full border-0 bg-white sm:h-[900px] lg:h-[980px]"
      />
    </section>
  );
}
