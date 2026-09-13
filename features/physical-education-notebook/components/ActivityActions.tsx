"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { archiveGradingActivityAction } from "../server/gradingActivityActions";

interface Props { courseId: string; activityId: string; canEdit: boolean; onEdit: () => void; }

export default function ActivityActions({ courseId, activityId, canEdit, onEdit }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function archive() {
    if (!canEdit || pending) return;
    if (!window.confirm("Archivar esta actividad? Sus calificaciones se conservaran.")) return;
    startTransition(async () => {
      const result = await archiveGradingActivityAction(courseId, activityId);
      if (!result.success) { window.alert(result.message); return; }
      router.refresh();
    });
  }
  return (
    <div className="flex flex-wrap gap-2 px-1 pt-2">
      <button type="button" onClick={() => { onEdit(); }} disabled={pending} className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-black text-blue-900 hover:bg-blue-100 disabled:opacity-50">Editar</button>
      <button type="button" onClick={archive} disabled={!canEdit || pending} className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-black text-red-800 hover:bg-red-100 disabled:opacity-50">{pending ? "Archivando..." : "Archivar"}</button>
    </div>
  );
}
