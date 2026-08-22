import Image from "next/image";

export default function AIEmptyState() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-4 text-center">
      <div
        className="relative h-28 w-28 overflow-hidden rounded-[2rem]"
        aria-hidden="true"
      >
        <Image
          src="/images/profe-ia-robot.png"
          alt=""
          width={220}
          height={280}
          className="absolute left-1/2 top-0 h-[180px] w-auto max-w-none -translate-x-1/2 object-contain"
        />
      </div>

      <h3 className="mt-6 text-xl font-black text-slate-950">
        Profe IA está listo
      </h3>

      <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
        Selecciona una herramienta, completa los datos principales y pulsa
        “Generar contenido”.
      </p>
    </div>
  );
}