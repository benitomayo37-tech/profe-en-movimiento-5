import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import ExamStatusButton from "@/features/student-exams/components/ExamStatusButton";
import TeacherResultsActions from "@/features/student-exams/components/TeacherResultsActions";
import type { StoredExamQuestion } from "@/features/student-exams/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Resultados de exámenes | Profe en Movimiento" };

interface ExamRow { id: string; access_code: string; title: string; topic: string; institution: string; grade_course: string; active: boolean; expires_at: string; created_at: string; }
interface AttemptRow { id: string; student_name: string; institution: string; grade_course: string; version_questions: StoredExamQuestion[]; answers: Record<string, string | null> | null; score: number | null; submitted_at: string | null; created_at: string; }

function dateLabel(value: string | null) {
  return value ? new Date(value).toLocaleString("es-EC", { dateStyle: "short", timeStyle: "short" }) : "—";
}

export default async function TeacherExamResultsPage({ searchParams }: { searchParams: Promise<{ exam?: string }> }) {
  const access = await getAuthAccess();
  if (!access.authenticated || !access.userId) redirect("/login?next=/examenes/resultados");
  const admin = createAdminClient();
  if (!admin) return <p className="p-8">Supabase no está configurado.</p>;

  const { data: examData } = await admin.from("student_exams")
    .select("id, access_code, title, topic, institution, grade_course, active, expires_at, created_at")
    .eq("teacher_id", access.userId)
    .order("created_at", { ascending: false });
  const exams = (examData || []) as ExamRow[];
  const requested = (await searchParams).exam;
  const selected = exams.find((exam) => exam.id === requested) || exams[0] || null;

  let attempts: AttemptRow[] = [];
  if (selected) {
    const { data } = await admin.from("student_exam_attempts")
      .select("id, student_name, institution, grade_course, version_questions, answers, score, submitted_at, created_at")
      .eq("exam_id", selected.id)
      .order("created_at", { ascending: false })
      .limit(500);
    attempts = (data || []) as AttemptRow[];
  }

  const completed = attempts.filter((attempt) => attempt.submitted_at && typeof attempt.score === "number");
  const average = completed.length ? completed.reduce((total, attempt) => total + (attempt.score || 0), 0) / completed.length : 0;
  const highest = completed.length ? Math.max(...completed.map((attempt) => attempt.score || 0)) : 0;
  const lowest = completed.length ? Math.min(...completed.map((attempt) => attempt.score || 0)) : 0;
  const exportRows = attempts.map((attempt) => ({ studentName: attempt.student_name, institution: attempt.institution, gradeCourse: attempt.grade_course, score: attempt.score, status: attempt.submitted_at ? "Entregado" : "En curso", startedAt: dateLabel(attempt.created_at), submittedAt: dateLabel(attempt.submitted_at) }));

  return (
    <AppLayout sidebar={<Sidebar />} header={<div className="flex min-h-16 items-center justify-between px-6"><div><h1 className="text-lg font-bold">Resultados de exámenes</h1><p className="text-sm text-slate-500">Seguimiento de evaluaciones estudiantiles</p></div><AccountBadge authenticated fullName={access.fullName} email={access.email} className="bg-blue-700" /></div>}>
      <Container size="wide" className="space-y-7 py-8">
        <style>{`@media print { body * { visibility: hidden !important; } .teacher-results-print, .teacher-results-print * { visibility: visible !important; } .teacher-results-print { position: absolute; inset: 0; width: 100%; } .no-print { display: none !important; } @page { size: A4 landscape; margin: 12mm; } }`}</style>
        <div className="no-print flex flex-wrap items-center justify-between gap-3 text-sm font-semibold"><div><Link href="/examenes" className="text-blue-700 hover:underline">Crear examen</Link><span className="mx-2 text-slate-400">/</span><span>Resultados</span></div><Link href="/examenes" className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 font-black text-slate-950">+ Crear otro examen</Link></div>

        <section className="no-print rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-600 p-8 text-white shadow-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Panel docente</p><h2 className="mt-2 text-4xl font-black">Revisa el progreso de tu grupo</h2><p className="mt-3 max-w-3xl leading-7 text-blue-100">Consulta notas, intentos y respuestas de cada estudiante. También puedes cerrar un código cuando termine la evaluación.</p></section>

        {!exams.length ? <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm"><p className="text-5xl">📋</p><h2 className="mt-4 text-2xl font-black">Todavía no has creado exámenes</h2><Link href="/examenes" className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-black text-white">Crear mi primer examen</Link></section> : (
          <div className="grid gap-7 xl:grid-cols-[300px_1fr]">
            <aside className="no-print h-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"><p className="px-2 pb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Mis exámenes</p><div className="space-y-2">{exams.map((exam) => <Link key={exam.id} href={`/examenes/resultados?exam=${exam.id}`} className={`block rounded-2xl border p-4 transition ${selected?.id === exam.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}><p className="font-black text-slate-950">{exam.title}</p><p className="mt-1 text-xs font-bold text-blue-700">{exam.access_code}</p><p className="mt-2 text-xs text-slate-500">{exam.grade_course}</p></Link>)}</div></aside>

            {selected ? <section className="teacher-results-print min-w-0 rounded-3xl border border-blue-100 bg-white p-6 shadow-lg sm:p-8">
              <header className="flex flex-wrap items-center justify-between gap-5 border-b-2 border-blue-700 pb-5"><div className="flex items-center gap-4"><Image src="/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento" width={62} height={62} className="h-16 w-16 object-contain" /><div><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Profe en Movimiento 5.0</p><h2 className="mt-1 text-2xl font-black">{selected.title}</h2><p className="text-sm text-slate-500">Código {selected.access_code} · {selected.institution} · {selected.grade_course}</p></div></div><div className="no-print flex flex-wrap gap-2"><ExamStatusButton examId={selected.id} active={selected.active} /><TeacherResultsActions title={selected.title} code={selected.access_code} rows={exportRows} /></div></header>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><article className="rounded-2xl bg-blue-50 p-5"><p className="text-xs font-black uppercase text-blue-700">Entregados</p><p className="mt-2 text-3xl font-black">{completed.length}</p></article><article className="rounded-2xl bg-cyan-50 p-5"><p className="text-xs font-black uppercase text-cyan-700">Promedio</p><p className="mt-2 text-3xl font-black">{average.toFixed(2)}/10</p></article><article className="rounded-2xl bg-emerald-50 p-5"><p className="text-xs font-black uppercase text-emerald-700">Nota más alta</p><p className="mt-2 text-3xl font-black">{highest}/10</p></article><article className="rounded-2xl bg-orange-50 p-5"><p className="text-xs font-black uppercase text-orange-700">Nota más baja</p><p className="mt-2 text-3xl font-black">{lowest}/10</p></article></div>

              <div className="mt-7 overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left text-sm"><thead><tr className="border-b-2 border-slate-300 text-xs uppercase tracking-wide text-slate-500"><th className="p-3">Estudiante</th><th className="p-3">Institución</th><th className="p-3">Curso</th><th className="p-3">Estado</th><th className="p-3">Nota</th><th className="no-print p-3">Detalle</th></tr></thead><tbody>{attempts.map((attempt) => {
                const answerMap = attempt.answers || {};
                return <tr key={attempt.id} className="border-b border-slate-200 align-top"><td className="p-3 font-bold">{attempt.student_name}<p className="mt-1 text-xs font-normal text-slate-500">{dateLabel(attempt.submitted_at || attempt.created_at)}</p></td><td className="p-3">{attempt.institution}</td><td className="p-3">{attempt.grade_course}</td><td className="p-3"><span className={`rounded-full px-3 py-1 text-xs font-black ${attempt.submitted_at ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{attempt.submitted_at ? "Entregado" : "En curso"}</span></td><td className="p-3 text-lg font-black">{attempt.score === null ? "—" : `${attempt.score}/10`}</td><td className="no-print p-3">{attempt.submitted_at ? <details><summary className="cursor-pointer font-black text-blue-700">Ver respuestas</summary><div className="mt-3 w-[440px] max-w-[70vw] space-y-3">{attempt.version_questions.map((question, index) => {
                  const selectedId = answerMap[question.id]; const selectedOption = question.options.find((option) => option.id === selectedId); const correctOption = question.options.find((option) => option.id === question.correctOptionId); const correct = selectedId === question.correctOptionId;
                  return <div key={question.id} className={`rounded-xl border p-3 text-xs ${correct ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}><p className="font-black">{index + 1}. {question.prompt}</p><p className="mt-1"><b>Respondió:</b> {selectedOption?.text || "Sin respuesta"}</p>{!correct ? <p className="mt-1"><b>Correcta:</b> {correctOption?.text}</p> : null}</div>;
                })}</div></details> : "—"}</td></tr>;
              })}</tbody></table>{!attempts.length ? <p className="py-10 text-center font-semibold text-slate-500">Todavía no existen intentos para este código.</p> : null}</div>
              <footer className="mt-7 border-t border-slate-200 pt-4 text-xs text-slate-500"><p><b>Tema:</b> {selected.topic}</p><p className="mt-1">Código {selected.active ? "activo" : "cerrado"} · Vence: {dateLabel(selected.expires_at)}</p></footer>
            </section> : null}
          </div>
        )}
      </Container>
    </AppLayout>
  );
}
