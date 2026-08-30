import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import ResourceFileUploader from "@/features/resources/components/ResourceFileUploader";
import {
  importCurrentCatalogAction,
  saveResourceAction,
  toggleResourceFeaturedAction,
  toggleResourcePublishedAction,
} from "@/features/resources/server/adminActions";
import { getAdminLibraryResources } from "@/features/resources/server/catalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administrar biblioteca | Profe en Movimiento" };

function csv(values: string[] | undefined) {
  return values?.join(", ") ?? "";
}

export default async function ResourcesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; saved?: string; imported?: string; error?: string }>;
}) {
  const access = await getAuthAccess();
  if (!access.authenticated) redirect("/login?next=/resources/admin");
  if (access.role !== "admin") redirect("/resources");

  const params = await searchParams;
  const catalog = await getAdminLibraryResources();
  const editing = catalog.find((resource) => resource.databaseId === params.edit) ?? null;

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={(
        <div className="flex min-h-20 items-center justify-between gap-4 px-6">
          <div><h1 className="text-lg font-bold">Administrar biblioteca</h1><p className="text-sm text-slate-500">Publicación y edición de recursos</p></div>
          <AccountBadge authenticated email={access.email} fullName={access.fullName} className="bg-orange-500" />
        </div>
      )}
      footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Administración de recursos</div>}
    >
      <Container size="wide" className="space-y-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/resources" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold hover:border-orange-300"><span className="text-slate-700">← Volver a la biblioteca</span></Link>
          <Link href="/resources/admin" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold"><span className="text-white">+ Nuevo recurso</span></Link>
        </div>

        <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-orange-950 p-8 text-white shadow-xl sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Panel administrativo</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Gestiona la Biblioteca Profesional</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">Crea, edita, publica, oculta y destaca recursos sin modificar el código de la plataforma.</p>
        </section>

        {params.saved ? <p className="rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-700">Recurso guardado correctamente.</p> : null}
        {params.imported ? <p className="rounded-2xl bg-blue-50 p-4 font-bold text-blue-700">Catálogo comprobado correctamente. Los recursos existentes se conservaron y se añadieron únicamente los faltantes.</p> : null}
        {params.error ? <p className="rounded-2xl bg-red-50 p-4 font-bold text-red-700">No se pudo guardar. Revisa el slug y los campos obligatorios.</p> : null}

        <section className="rounded-3xl border border-orange-200 bg-orange-50 p-7">
            <h2 className="text-xl font-black text-slate-950">Importar los recursos actuales</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Comprueba el catálogo original y añade únicamente los recursos que falten. Tus ediciones y publicaciones existentes no serán sobrescritas.</p>
            <form action={importCurrentCatalogAction} className="mt-5">
              <button className="rounded-xl bg-orange-600 px-5 py-3 font-bold text-white hover:bg-orange-700">Importar los recursos actuales</button>
            </form>
        </section>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-4">
            <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Catálogo</p><h2 className="mt-1 text-2xl font-black">{catalog.length} recursos administrables</h2></div>
            {catalog.length ? catalog.map((resource) => (
              <article key={resource.databaseId} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0"><div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black ${resource.published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{resource.published ? "Publicado" : "Oculto"}</span>{resource.featured ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">Destacado</span> : null}{resource.premium ? <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">Premium</span> : null}</div><h3 className="mt-3 text-lg font-black text-slate-950">{resource.title}</h3><p className="mt-1 text-sm text-slate-500">/{resource.slug}</p></div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/resources/admin?edit=${resource.databaseId}`} className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold"><span className="text-white">Editar</span></Link>
                    <form action={toggleResourcePublishedAction}><input type="hidden" name="databaseId" value={resource.databaseId} /><input type="hidden" name="published" value={String(resource.published)} /><button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700">{resource.published ? "Ocultar" : "Publicar"}</button></form>
                    <form action={toggleResourceFeaturedAction}><input type="hidden" name="databaseId" value={resource.databaseId} /><input type="hidden" name="featured" value={String(resource.featured)} /><button className="rounded-xl border border-amber-300 px-4 py-2 text-sm font-bold text-amber-700">{resource.featured ? "Quitar destaque" : "Destacar"}</button></form>
                  </div>
                </div>
              </article>
            )) : <p className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Importa el catálogo para comenzar.</p>}
          </section>

          <section className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-lg xl:sticky xl:top-24">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">{editing ? "Editar recurso" : "Nuevo recurso"}</p>
            <h2 className="mt-2 text-2xl font-black">Datos de publicación</h2>
            <form
              key={editing?.databaseId ?? "new-resource"}
              action={saveResourceAction}
              className="mt-6 space-y-4"
            >
              {editing ? <input type="hidden" name="databaseId" value={editing.databaseId} /> : null}
              <label className="block text-sm font-bold">Título<input required minLength={3} name="title" defaultValue={editing?.title} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label>
              <label className="block text-sm font-bold">Slug<input required name="slug" defaultValue={editing?.slug} placeholder="planificacion-baloncesto" className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label>
              <label className="block text-sm font-bold">Resumen<textarea required minLength={10} name="summary" defaultValue={editing?.summary} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 p-3" /></label>
              <label className="block text-sm font-bold">Descripción<textarea required minLength={20} name="description" defaultValue={editing?.description} rows={5} className="mt-2 w-full rounded-xl border border-slate-300 p-3" /></label>
              <label className="block text-sm font-bold">Categorías, separadas por comas<input required name="categories" defaultValue={csv(editing?.categories)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label>
              <label className="block text-sm font-bold">Niveles<input required name="levels" defaultValue={csv(editing?.levels)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label>
              <label className="block text-sm font-bold">Formatos<input required name="formats" defaultValue={csv(editing?.formats)} placeholder="PDF, Word" className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label>
              <label className="block text-sm font-bold">Etiquetas<input name="tags" defaultValue={csv(editing?.tags)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label>
              <label className="block text-sm font-bold">Competencias<input name="competencies" defaultValue={csv(editing?.competencies)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label>
              <label className="block text-sm font-bold">Sellos de calidad<input name="quality" defaultValue={csv(editing?.quality)} placeholder="Certificado, IA Ready" className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label>
              <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Dificultad<select name="difficulty" defaultValue={editing?.difficulty ?? "Intermedio"} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3"><option>Básico</option><option>Intermedio</option><option>Avanzado</option></select></label><label className="block text-sm font-bold">Duración<input name="duration" defaultValue={editing?.duration} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label></div>
              <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Autor<input name="author" defaultValue={editing?.author ?? "Profe en Movimiento"} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label><label className="block text-sm font-bold">Versión<input name="version" defaultValue={editing?.version ?? "1.0"} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label></div>
              <ResourceFileUploader initialValue={editing?.downloadUrl} initialPremium={editing?.premium} />
              <fieldset className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold">{[["published", "Publicado", editing?.published], ["featured", "Destacado", editing?.featured], ["verified", "Verificado", editing?.verified], ["editorsChoice", "Editor choice", editing?.editorsChoice], ["aiReady", "Profe IA", editing?.aiReady ?? true], ["dua", "DUA", editing?.dua], ["nee", "NEE", editing?.nee]].map(([name, label, value]) => <label key={String(name)} className="flex items-center gap-2"><input key={`${editing?.databaseId ?? "new-resource"}-${String(name)}-${Boolean(value)}`} type="checkbox" name={String(name)} defaultChecked={Boolean(value)} autoComplete="off" />{String(label)}</label>)}</fieldset>
              <button className="min-h-12 w-full rounded-xl bg-orange-600 px-5 py-3 font-black text-white hover:bg-orange-700">{editing ? "Guardar cambios" : "Crear recurso"}</button>
            </form>
          </section>
        </div>
      </Container>
    </AppLayout>
  );
}
