export default function AILoadingState() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-4xl">
        <span className="animate-pulse" aria-hidden="true">
          🧠
        </span>
      </div>

      <p className="mt-6 font-bold text-slate-950">
        Analizando tu solicitud
      </p>

      <p className="mt-2 text-sm text-slate-600">
        Organizando objetivos, actividades, evaluación y adaptaciones.
      </p>
    </div>
  );
}
