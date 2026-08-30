import { AccountBadge } from "@/components/layout";
import type { AuthAccess } from "@/features/auth/types";
import Link from "next/link";

export default function DashboardHeader({ access }: { access?: AuthAccess }) {
  return (
    <div className="flex min-h-20 items-center gap-4 px-6">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-slate-950">
            Dashboard
          </h1>

          <p className="truncate text-sm text-slate-500">
            Centro de operaciones del docente
          </p>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <span className={`dashboard-header-plan-badge rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide ${access?.hasProAccess ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}>
            Plan {access?.hasProAccess ? "Pro" : "Free"}
          </span>
          {access?.role === "admin" ? <span className="dashboard-header-admin-badge rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-amber-800">Administrador</span> : null}
        </div>
        <Link href="/cuenta" className="relative z-50 inline-flex min-h-11 shrink-0 touch-manipulation items-center rounded-xl border border-blue-200 bg-blue-50 px-3 text-sm font-black text-blue-700 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
          <span className="sm:hidden">Cuenta</span>
          <span className="hidden sm:inline">Mi cuenta</span>
        </Link>
        <AccountBadge authenticated={access?.authenticated ?? false} email={access?.email} fullName={access?.fullName} className="bg-blue-700" />
    </div>
  );
}
