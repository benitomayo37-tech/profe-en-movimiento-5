import Link from "next/link";

export default function AuthSetupNotice() {
  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Configuración pendiente</p>
      <h2 className="mt-2 text-2xl font-black">Conecta el proyecto con Supabase</h2>
      <p className="mt-4 leading-7">
        Añade la URL del proyecto y la publishable key a <code className="rounded bg-white px-1.5 py-1 text-sm">.env.local</code>, y ejecuta la migración SQL incluida en el proyecto.
      </p>
      <p className="mt-3 text-sm leading-6">Consulta el archivo <strong>docs/SUPABASE_SETUP.md</strong> para completar el proceso paso a paso.</p>
      <Link href="/apps" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-700 px-5 py-2 font-black text-white transition hover:bg-amber-800">
        Volver a las miniapps
      </Link>
    </div>
  );
}
