import { AccountBadge } from "@/components/layout";
import type { AuthAccess } from "@/features/auth/types";

export function AcademyHeader({ access, title = "Academia" }: { access: AuthAccess; title?: string }) {
  return <div className="flex min-h-20 items-center justify-between gap-4 px-6"><div className="min-w-0"><h1 className="truncate text-lg font-bold text-slate-950">{title}</h1><p className="truncate text-sm text-slate-500">Formación docente · Profe en Movimiento</p></div><AccountBadge authenticated={access.authenticated} email={access.email} fullName={access.fullName} className="bg-violet-600" /></div>;
}
