import Link from "next/link";

interface RecentActivityItemProps {
  title: string;
  description: string;
  time: string;
  href?: string;
  icon?: string;
}

export default function RecentActivityItem({
  title,
  description,
  time,
  href,
  icon = "📄",
}: RecentActivityItemProps) {
  const content = (
    <>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl">
        <span aria-hidden="true">{icon}</span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <span className="text-xs font-medium text-slate-400">
          {time}
        </span>

        {href && (
          <span
            aria-hidden="true"
            className="ml-3 inline-block text-blue-700 transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        )}
      </div>
    </>
  );

  const styles =
    "group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-blue-200 hover:shadow-md";

  if (href) {
    return (
      <Link
        href={href}
        className={`${styles} focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={styles}>
      {content}
    </div>
  );
}