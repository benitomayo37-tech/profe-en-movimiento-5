"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { restoreGradingActivityAction } from "../server/gradingActivityActions";
import type { GradingActivity } from "../types";

export default function ArchivedActivitiesPanel({ courseId, activities }: { courseId: string; activities: GradingActivity[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  if (!activities.length) return null;
  function restore(activityId: string) {
    startTransition(async () => {
      const result = await restoreGradingActivityAction(courseId, activityId);
      if (!result.success) window.alert(result.message);
      else router.refresh();
    });
  }
  return (
    <section className="rounded-3xl border-2 border-dashed border-slate-400 bg-slate-100 p-5">
      <h3 className="text-lg font-black text-slate-950">Actividades archivadas</h3>
      <div className="mt-3 space-y-2">
        {activities.map((activity) => (
          <div key={activity.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3">
            <div><p className="font-black text-slate-950">{activity.name}</p><p className="text-xs font-bold text-slate-600">Puedes restaurarla sin perder sus calificaciones.</p></div>
            <button type="button" onClick={() => restore(activity.id)} disabled={pending} className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-900 hover:bg-emerald-100 disabled:opacity-50">Restaurar</button>
          </div>
        ))}
      </div>
    </section>
  );
}
