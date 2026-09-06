import type {
  SportsNewsCategory,
  SportsNewsItem,
} from "@/features/sports-news/types";

export const categoryPresentation:
  Record<
    SportsNewsCategory,
    {
      label: string;
      icon: string;
      badge: string;
      accent: string;
    }
  > = {
  football: {
    label: "Fútbol",
    icon: "⚽",
    badge: "bg-emerald-700 text-white",
    accent: "border-t-emerald-600",
  },
  "ecuadorian-football": {
    label: "Liga Ecuatoriana",
    icon: "🇪🇨",
    badge: "bg-yellow-500 text-slate-950",
    accent: "border-t-yellow-500",
  },  mlb: {
    label: "MLB",
    icon: "⚾",
    badge: "bg-red-700 text-white",
    accent: "border-t-red-600",
  },
  nba: {
    label: "NBA",
    icon: "🏀",
    badge: "bg-orange-600 text-white",
    accent: "border-t-orange-500",
  },
  mma: {
    label: "MMA",
    icon: "🥊",
    badge: "bg-violet-700 text-white",
    accent: "border-t-violet-600",
  },
  athletics: {
    label: "Atletismo",
    icon: "🏃",
    badge: "bg-blue-700 text-white",
    accent: "border-t-blue-600",
  },
  tennis: {
    label: "Tenis",
    icon: "🎾",
    badge: "bg-amber-500 text-slate-950",
    accent: "border-t-amber-500",
  },
  olympic: {
    label: "Olímpicos",
    icon: "🏅",
    badge: "bg-sky-700 text-white",
    accent: "border-t-sky-600",
  },
  multisport: {
    label: "Polideportivo",
    icon: "🌍",
    badge: "bg-slate-700 text-white",
    accent: "border-t-slate-600",
  },
};

function formatPublishedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat(
    "es-EC",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Guayaquil",
    },
  ).format(date);
}

interface SportsNewsCardProps {
  item: SportsNewsItem;
  compact?: boolean;
}

export default function SportsNewsCard({
  item,
  compact = false,
}: SportsNewsCardProps) {
  const presentation =
    categoryPresentation[item.category];

  return (
    <article
      className={`flex h-full flex-col border border-slate-200 border-t-4 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${presentation.accent} ${
        compact
          ? "rounded-2xl p-4"
          : "rounded-3xl p-6"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${presentation.badge}`}
        >
          <span aria-hidden="true">
            {presentation.icon}
          </span>
          {presentation.label}
        </span>

        <span className="text-xs font-black uppercase tracking-wide text-slate-500">
          {item.source}
        </span>
      </div>

      <h3 className={`${compact ? "mt-4 text-base" : "mt-5 text-xl"} font-black leading-snug text-slate-950`}>
        {item.title}
      </h3>

      {item.summary ? (
        <p className={`${compact ? "mt-2 line-clamp-2 text-xs leading-5" : "mt-3 line-clamp-3 text-sm leading-6"} text-slate-600`}>
          {item.summary}
        </p>
      ) : null}

      <div className={`mt-auto ${compact ? "pt-4" : "pt-6"}`}>
        <time
          dateTime={item.publishedAt}
          className="block text-xs font-semibold text-slate-500"
        >
          {formatPublishedAt(item.publishedAt)}
        </time>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer external"
          className={`${compact ? "mt-3 min-h-9 px-3 py-2 text-xs" : "mt-4 min-h-11 px-4 py-2.5 text-sm"} inline-flex items-center gap-2 rounded-xl bg-blue-700 font-black text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200`}
          aria-label={`Leer en ${item.source}: ${item.title}`}
        >
          Leer en {item.source}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}