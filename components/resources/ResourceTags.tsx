interface ResourceTagsProps {
  tags: string[];
}

export default function ResourceTags({
  tags,
}: ResourceTagsProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
        Clasificación
      </p>

      <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
        Etiquetas
      </h2>

      <div className="mt-5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          >
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}