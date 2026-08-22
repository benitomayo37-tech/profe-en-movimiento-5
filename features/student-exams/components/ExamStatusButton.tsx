"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ExamStatusButton({ examId, active }: { examId: string; active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const response = await fetch("/api/teacher/exams/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, active: !active }),
      });
      if (!response.ok) throw new Error("status_update_failed");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return <button type="button" onClick={toggle} disabled={loading} className={`rounded-xl px-4 py-2 text-xs font-black ${active ? "border border-red-200 bg-red-50 text-red-700" : "bg-emerald-600 text-white"}`}>{loading ? "Guardando…" : active ? "Cerrar código" : "Reactivar código"}</button>;
}
