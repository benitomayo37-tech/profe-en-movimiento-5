import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface DashboardSectionProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function DashboardSection({
  title,
  description,
  eyebrow,
  action,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
              {eyebrow}
            </p>
          )}

          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
            {title}
          </h2>

          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>

      <div>{children}</div>
    </section>
  );
}