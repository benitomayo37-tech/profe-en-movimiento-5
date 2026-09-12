"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveGradesAction } from "../server/gradingGradeActions";
import type {
  GradingActivity,
  GradeEntryInput,
  PhysicalEducationStudent,
  StudentGrade,
} from "../types";

interface GradeEntryWorkspaceProps {
  courseId: string;
  activity: GradingActivity;
  students: PhysicalEducationStudent[];
  initialGrades: StudentGrade[];
}

const statusLabels: Record<GradeEntryInput["status"], string> = {
  graded: "Evaluado",
  pending: "Pendiente",
  not_evaluated: "No evaluado",
  excused: "Justificado",
};

export default function GradeEntryWorkspace({
  courseId,
  activity,
  students,
  initialGrades,
}: GradeEntryWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [entries, setEntries] = useState<GradeEntryInput[]>(() =>
    students.map((student) => {
      const grade = initialGrades.find((item) => item.studentId === student.id);
      return {
        studentId: student.id,
        score: grade?.score ?? null,
        status: grade?.status ?? "pending",
        observation: grade?.observation ?? null,
      };
    }),
  );

  function updateEntry(index: number, patch: Partial<GradeEntryInput>) {
    setEntries((current) => current.map((entry, itemIndex) =>
      itemIndex === index ? { ...entry, ...patch } : entry,
    ));
  }

  function submit() {
    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await saveGradesAction({
        courseId,
        gradingActivityId: activity.id,
        entries,
      });
      if (!result.success) {
        setError(result.message);
        return;
      }
      setMessage(result.message);
      router.refresh();
    });
  }

  return (
    <section className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 p-6 text-white shadow-xl sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-200">Registro de notas</p>
        <h2 className="mt-3 text-3xl font-black">{activity.name}</h2>
        <p className="mt-2 text-sm text-blue-100">Puntaje m&aacute;ximo: {activity.maxScore.toFixed(2)} · {students.length} estudiantes</p>
      </div>

      {message ? <p role="status" className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-sm font-black text-emerald-900">{message}</p> : null}
      {error ? <p role="alert" className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-sm font-black text-red-900">{error}</p> : null}

      <div className="space-y-4">
        {students.map((student, index) => {
          const entry = entries[index];
          return (
            <article key={student.id} className="rounded-3xl border-2 border-slate-300 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-black text-slate-950">{student.lastNames}, {student.firstNames}</p>
                  <p className="mt-1 text-xs font-bold text-slate-600">{student.studentCode || "Sin c&oacute;digo"}</p>
                </div>
                <div className="w-full sm:w-44">
                  <label className="text-xs font-black uppercase tracking-wide text-slate-700">Estado</label>
                  <select value={entry.status} onChange={(event) => updateEntry(index, { status: event.target.value as GradeEntryInput["status"], score: event.target.value === "graded" ? entry.score : null })} className="mt-2 min-h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-950">
                    {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-[150px_1fr]">
                <label>
                  <span className="text-sm font-black text-slate-800">Nota</span>
                  <input type="number" min="1" max={activity.maxScore} step="0.01" value={entry.score ?? ""} disabled={entry.status !== "graded"} onChange={(event) => updateEntry(index, { score: event.target.value === "" ? null : Number(event.target.value) })} className="mt-2 min-h-11 w-full rounded-xl border-2 border-slate-300 px-3 text-sm font-black text-slate-950 disabled:bg-slate-100" />
                </label>
                <label>
                  <span className="text-sm font-black text-slate-800">Observaci&oacute;n</span>
                  <input maxLength={500} value={entry.observation ?? ""} onChange={(event) => updateEntry(index, { observation: event.target.value || null })} className="mt-2 min-h-11 w-full rounded-xl border-2 border-slate-300 px-3 text-sm text-slate-950" />
                </label>
              </div>
            </article>
          );
        })}
      </div>

      <button type="button" onClick={submit} disabled={isPending || !students.length} className="min-h-12 rounded-xl border-2 border-blue-700 bg-blue-700 px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-blue-800 disabled:opacity-60">
        {isPending ? "Guardando..." : "Guardar calificaciones"}
      </button>
    </section>
  );
}
