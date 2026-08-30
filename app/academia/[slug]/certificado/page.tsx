import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { CertificatePrintButton } from "@/features/academy/components/CertificatePrintButton";
import { CertificateImageButton } from "@/features/academy/components/CertificateImageButton";
import { academyCourse } from "@/features/academy/data/courses";
import { getAcademyProgress } from "@/features/academy/server/progress";
import { getAuthAccess } from "@/features/auth/server/access";

export const dynamic = "force-dynamic";

export default async function CertificatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== academyCourse.slug) notFound();

  const access = await getAuthAccess();
  if (!access.authenticated) redirect(`/login?next=/academia/${slug}/certificado`);

  const progress = await getAcademyProgress(access.userId);
  if (!progress.certificateEarnedAt || (progress.quizScore ?? 0) < academyCourse.passingScore) {
    redirect(`/academia/${slug}`);
  }

  const date = new Intl.DateTimeFormat("es-EC", {
    dateStyle: "long",
    timeZone: "America/Guayaquil",
  }).format(new Date(progress.certificateEarnedAt));
  const participant = access.fullName || access.email || "Participante";

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="academy-no-print mx-auto mb-5 flex max-w-[1100px] justify-between gap-3">
        <a href={`/academia/${slug}`} className="rounded-xl border bg-white px-5 py-3 font-black text-slate-700">
          ← Volver al curso
        </a>
        <div className="flex flex-wrap justify-end gap-3">
          <CertificateImageButton courseTitle={academyCourse.title} date={date} duration={academyCourse.duration} instructor={academyCourse.instructor} participant={participant} score={progress.quizScore ?? 0} />
          <CertificatePrintButton />
        </div>
      </div>

      <article className="academy-certificate relative mx-auto flex aspect-[1.414/1] max-w-[1100px] flex-col items-center justify-center border-[12px] border-double border-[#0b2050] p-10 text-center text-[#0b2050] shadow-2xl">
        <Image src="/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento" width={110} height={110} className="academy-certificate-logo h-24 w-24 object-contain" />
        <p className="mt-5 text-sm font-black uppercase tracking-[.3em] text-orange-600">Academia Profe en Movimiento</p>
        <h1 className="mt-4 text-5xl font-black">Certificado de finalización</h1>
        <p className="mt-7 text-xl">Se certifica que</p>
        <p className="mt-3 border-b-2 border-orange-500 px-10 pb-2 text-4xl font-black">{participant}</p>
        <p className="mt-7 max-w-3xl text-lg leading-8">completó satisfactoriamente el curso</p>
        <h2 className="mt-2 max-w-4xl text-3xl font-black">{academyCourse.title}</h2>
        <p className="mt-5 text-lg">Duración: {academyCourse.duration} · Evaluación final: {progress.quizScore}%</p>

        <div className="mt-5 w-full max-w-sm">
          <Image src="/images/firma-armando-mayo.png" alt="Firma de MSc. Armando Mayo García" width={220} height={105} className="academy-certificate-signature mx-auto -mb-1 h-32 w-auto object-contain" />
          <div className="border-t border-slate-500 pt-2">
            <p className="font-black">{academyCourse.instructor}</p>
            <p className="text-sm">Autor e instructor</p>
            <p className="academy-certificate-note mt-1 text-xs">Fecha de finalización: {date}</p>
          </div>
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-[.18em]">Profe en Movimiento · Educación Física, Deporte y Salud</p>
        <p className="academy-certificate-note mt-2 text-[10px]">Constancia interna de finalización. No equivale a una titulación o acreditación oficial.</p>
        <Image src="/images/sello-academia-profe-en-movimiento.svg" alt="Sello institucional de Academia Profe en Movimiento" width={128} height={128} className="academy-certificate-seal absolute bottom-8 right-10 h-28 w-28 object-contain" />
      </article>
    </main>
  );
}
