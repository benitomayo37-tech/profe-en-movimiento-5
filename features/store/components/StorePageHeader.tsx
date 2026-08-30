import Link from "next/link";

import { AccountBadge } from "@/components/layout";
import type { AuthAccess } from "@/features/auth/types";

interface StorePageHeaderProps {
  access: AuthAccess;
  description: string;
  title: string;
}

export default function StorePageHeader({
  access,
  description,
  title,
}: StorePageHeaderProps) {
  return (
    <div className="flex min-h-20 items-center gap-3 px-4 sm:gap-4 sm:px-6">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold text-slate-950">{title}</h1>
        <p className="truncate text-sm text-slate-500">{description}</p>
      </div>

      {access.authenticated ? (
        <span className={`hidden rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide sm:inline-flex ${
          access.hasProAccess
            ? "bg-violet-100 text-violet-700"
            : "bg-slate-100 text-slate-600"
        }`}>
          Plan {access.hasProAccess ? "Pro" : "Free"}
        </span>
      ) : null}

      <Link
        href={access.authenticated ? "/cuenta" : "/login?next=/store"}
        className="relative z-50 inline-flex min-h-11 shrink-0 touch-manipulation items-center rounded-xl border border-blue-200 bg-blue-50 px-3 text-sm font-black text-blue-700 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
      >
        {access.authenticated ? "Mi cuenta" : "Ingresar"}
      </Link>

      <AccountBadge
        authenticated={access.authenticated}
        email={access.email}
        fullName={access.fullName}
        className="bg-blue-700"
      />
    </div>
  );
}
