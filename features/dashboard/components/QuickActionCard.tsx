import Link from "next/link";

import Card from "@/components/ui/Card";

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
}

export default function QuickActionCard({
  title,
  description,
  href,
  icon,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
    >
      <Card
        hover
        className="h-full border-slate-200 p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-blue-200 group-hover:shadow-xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl transition-transform duration-300 group-hover:scale-110">
          <span aria-hidden="true">{icon}</span>
        </div>

        <h3 className="mt-5 text-lg font-black text-slate-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {description}
        </p>

        <span className="mt-5 inline-flex items-center text-sm font-bold text-blue-700">
          Abrir
          <span
            aria-hidden="true"
            className="ml-2 transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </Card>
    </Link>
  );
}