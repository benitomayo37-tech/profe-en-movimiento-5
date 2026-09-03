import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getPlatformMetrics } from "@/features/admin/server/platformMetrics";
import { getAuthAccess } from "@/features/auth/server/access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Usuarios y suscripciones | Profe en Movimiento" };

function MetricCard({ label, value, detail, tone = "blue" }: { label: string; value: number | string; detail: string; tone?: "blue" | "orange" | "emerald" | "violet" }) {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    orange: "border-orange-200 bg-orange-50 text-orange-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    violet: "border-violet-200 bg-violet-50 text-violet-800",
  };
  return <article className={`rounded-3xl border p-6 shadow-sm ${tones[tone]}`}><p className="text-xs font-black uppercase tracking-[.16em]">{label}</p><p className="mt-3 text-4xl font-black text-slate-950">{typeof value === "number" ? value.toLocaleString("es") : value}</p><p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{detail}</p></article>;
}

function JourneyStatus({ complete, label }: { complete: boolean; label: string }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black shadow-sm ${complete ? "journey-status-complete" : "journey-status-pending"}`}>{complete ? "✓" : "—"} {label}</span>;
}

const agentFeatureLabels: Record<string, string> = {
  general: "Coordinación general",
  planning: "Planificación",
  assessment: "Evaluación",
  inclusion: "Inclusión y DUA",
  training_session: "Sesión de entrenamiento",
  microcycle: "Microciclo",
  mesocycle: "Mesociclo",
  macrocycle: "Macrociclo",
};

export default async function AdminUsersPage() {
  const access = await getAuthAccess();
  if (!access.authenticated) redirect("/login?next=/admin/usuarios");
  if (access.role !== "admin") redirect("/dashboard");

  let metrics = null;
  let loadError = false;
  try {
    metrics = await getPlatformMetrics();
  } catch (error) {
    console.error("[Administración] No se pudieron cargar las métricas.", error);
    loadError = true;
  }

  return (
    <AppLayout sidebar={<Sidebar />} header={<div className="flex min-h-20 items-center justify-between gap-4 px-6"><div><h1 className="text-lg font-bold text-slate-950">Usuarios y suscripciones</h1><p className="text-sm text-slate-500">Panel privado de administración</p></div><AccountBadge authenticated email={access.email} fullName={access.fullName} /></div>} footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Datos administrativos privados</div>}>
      <Container size="wide" className="space-y-8 py-8">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-violet-900 p-8 text-white shadow-2xl sm:p-10">
          <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">Control de acceso</p>
          <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><h2 className="text-4xl font-black">Personas con acceso real a la plataforma</h2><p className="mt-4 max-w-3xl leading-7 text-blue-100">Cifras calculadas directamente desde Supabase. Incluyen cuentas docentes registradas y cuentas estudiantiles activas.</p></div><Link href="/cuenta" className="shrink-0 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-black text-white">← Volver a mi cuenta</Link></div>
        </section>

        {!metrics || loadError ? <section className="rounded-3xl border border-red-200 bg-red-50 p-8"><h2 className="text-xl font-black text-red-900">No se pudieron cargar las estadísticas</h2><p className="mt-2 text-red-700">Comprueba la configuración administrativa de Supabase y vuelve a intentarlo.</p></section> : <>
          <section>
            <div><p className="text-xs font-black uppercase tracking-[.18em] text-blue-700">Plataforma</p><h2 className="mt-2 text-3xl font-black text-slate-950">Acceso general</h2></div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Total de personas" value={metrics.totalPeople} detail="Docentes registrados + estudiantes activos." tone="blue" />
              <MetricCard label="Cuentas docentes" value={metrics.teacherAccounts} detail="Perfiles creados mediante Supabase Auth." tone="violet" />
              <MetricCard label="Estudiantes activos" value={metrics.activeStudentAccounts} detail="Cuentas estudiantiles habilitadas." tone="emerald" />
              <MetricCard label="Nuevos este mes" value={metrics.newThisMonth} detail="Altas docentes y estudiantiles del mes actual." tone="orange" />
            </div>
          </section>

          <section>
            <div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-600">Planes docentes</p><h2 className="mt-2 text-3xl font-black text-slate-950">Distribución Free y Pro</h2></div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard label="Plan Free" value={metrics.freeAccounts} detail="Cuentas docentes sin acceso Pro activo." tone="blue" />
              <MetricCard label="Plan Pro" value={metrics.proAccounts} detail="Cuentas docentes con acceso Pro activo." tone="orange" />
              <MetricCard label="Administradores" value={metrics.adminAccounts} detail="Cuentas con permisos administrativos." tone="violet" />
            </div>
          </section>

          <section>
            <div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">Hotmart</p><h2 className="mt-2 text-3xl font-black text-slate-950">Suscripciones y vinculación</h2></div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard label="Suscripciones activas" value={metrics.activeSubscriptions} detail="Accesos activos recibidos desde Hotmart." tone="emerald" />
              <MetricCard label="Plan mensual" value={metrics.monthlySubscriptions} detail="Oferta mensual identificada por Hotmart." tone="blue" />
              <MetricCard label="Plan anual" value={metrics.annualSubscriptions} detail="Oferta anual identificada por Hotmart." tone="orange" />
              <MetricCard label="Sin modalidad histórica" value={metrics.uncategorizedSubscriptions} detail="Accesos anteriores sin código de oferta registrado." tone="violet" />
              <MetricCard label="Pendientes de registro" value={metrics.pendingRegistration} detail="Compradores que aún no crearon una cuenta con el mismo correo." tone="orange" />
              <MetricCard label="Inactivas" value={metrics.inactiveSubscriptions} detail="Suscripciones canceladas, vencidas o reembolsadas." tone="blue" />
            </div>
          </section>

          <section>
            <div><p className="text-xs font-black uppercase tracking-[.18em] text-violet-700">Agentes IA</p><h2 className="mt-2 text-3xl font-black text-slate-950">Uso mensual y conversión</h2><p className="mt-2 text-sm text-slate-500">Ejecuciones registradas desde el primer día de esta medición avanzada.</p></div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard label="Ejecuciones del mes" value={metrics.agentRunsThisMonth} detail="Solicitudes completadas por todos los agentes." tone="violet" />
              <MetricCard label="Usuarios activos" value={metrics.activeAgentUsers} detail="Cuentas que utilizaron Agentes IA este mes." tone="emerald" />
              <MetricCard label="Usuarios en el límite" value={metrics.agentUsersAtLimit} detail="Cuentas que alcanzaron su cuota mensual." tone="orange" />
              <MetricCard label="Uso Free" value={metrics.agentFreeRuns} detail="Ejecuciones realizadas desde cuentas Free." tone="blue" />
              <MetricCard label="Uso Pro" value={metrics.agentProRuns} detail="Ejecuciones realizadas desde cuentas Pro." tone="orange" />
              <MetricCard label="Uso administrativo" value={metrics.agentAdminRuns} detail="Ejecuciones de cuentas administradoras." tone="violet" />
            </div>
            <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4"><h3 className="font-black text-slate-950">Distribución por función</h3></div>
              {metrics.agentFeatureUsage.length ? <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">{metrics.agentFeatureUsage.map((item) => <article key={item.feature} className="bg-white p-5"><p className="text-xs font-black uppercase tracking-wide text-slate-500">{agentFeatureLabels[item.feature] ?? item.feature}</p><p className="mt-2 text-3xl font-black text-slate-950">{item.runs.toLocaleString("es")}</p></article>)}</div> : <p className="p-6 text-sm text-slate-500">Todavía no hay ejecuciones clasificadas este mes.</p>}
            </div>
          </section>

          <section>
            <div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-600">Embudo de captación</p><h2 className="mt-2 text-3xl font-black text-slate-950">Kit gratuito y registros</h2><p className="mt-2 text-sm text-slate-500">Contactos captados desde la landing de la clase de 45 minutos.</p></div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Leads captados" value={metrics.funnelLeads} detail="Contactos únicos que solicitaron el recurso." tone="orange" />
              <MetricCard label="Leads este mes" value={metrics.funnelLeadsThisMonth} detail="Nuevos contactos registrados durante el mes actual." tone="blue" />
              <MetricCard label="Cuentas creadas" value={metrics.funnelConvertedLeads} detail="Leads vinculados posteriormente con una cuenta." tone="emerald" />
              <MetricCard label="Conversión a cuenta" value={`${metrics.funnelConversionRate}%`} detail="Porcentaje de leads que crearon una cuenta Free." tone="violet" />
              <MetricCard label="Kits descargados" value={metrics.funnelKitDownloads} detail="Descargas confirmadas mediante el enlace medible." tone="blue" />
              <MetricCard label="Activados en Agentes IA" value={metrics.funnelAgentActivations} detail="Leads convertidos que realizaron su primera solicitud." tone="orange" />
              <MetricCard label="Iniciaron Academia" value={metrics.funnelAcademyActivations} detail="Leads convertidos con progreso en un curso." tone="violet" />
              <MetricCard label="Ruta completada" value={metrics.funnelCompletedActivations} detail="Personas que completaron los tres pasos de activación." tone="emerald" />
              <MetricCard label="Conversiones a Pro" value={metrics.funnelProConversions} detail="Leads que actualmente tienen un plan Pro." tone="orange" />
              <MetricCard label="Conversión a Pro" value={`${metrics.funnelProConversionRate}%`} detail="Porcentaje de leads captados que llegaron al plan Pro." tone="emerald" />
              <MetricCard label="Correos enviados" value={metrics.funnelEmailsSent} detail="Mensajes de la secuencia aceptados por Brevo." tone="blue" />
              <MetricCard label="Envíos pendientes de reintento" value={metrics.funnelEmailFailures} detail="Mensajes que no pudieron enviarse y volverán a intentarse." tone="orange" />
              <MetricCard label="Suscripciones canceladas" value={metrics.funnelUnsubscribed} detail="Contactos que retiraron su autorización para esta secuencia." tone="violet" />
              <MetricCard label="Automatización de correo" value={metrics.funnelEmailAutomationConfigured ? "Configurada" : "Incompleta"} detail="Estado de las variables privadas requeridas en este despliegue." tone={metrics.funnelEmailAutomationConfigured ? "emerald" : "orange"} />
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-xl font-black text-slate-950">Recorrido individual de los leads</h3>
                <p className="mt-1 text-sm text-slate-500">Últimos 50 contactos, ordenados desde el más reciente.</p>
              </div>
              {metrics.funnelLeadJourneys.length ? <div className="overflow-x-auto">
                <table className="min-w-[1100px] w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr><th className="px-5 py-4">Contacto</th><th className="px-5 py-4">Captado</th><th className="px-5 py-4">Kit</th><th className="px-5 py-4">Cuenta</th><th className="px-5 py-4">Agentes IA</th><th className="px-5 py-4">Academia</th><th className="px-5 py-4">Ruta</th><th className="px-5 py-4">Correos</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metrics.funnelLeadJourneys.map((lead) => <tr key={lead.id} className="align-top">
                      <td className="px-5 py-4"><p className="font-black text-slate-950">{lead.fullName}</p><p className="mt-1 text-xs text-slate-500">{lead.email}</p>{lead.unsubscribedAt ? <span className="mt-2 inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-800">Baja solicitada</span> : null}</td>
                      <td className="px-5 py-4 font-semibold text-slate-600">{new Intl.DateTimeFormat("es", { dateStyle: "short", timeStyle: "short", timeZone: "America/Guayaquil" }).format(new Date(lead.createdAt))}</td>
                      <td className="px-5 py-4"><JourneyStatus complete={Boolean(lead.downloadedAt)} label={lead.downloadedAt ? "Descargado" : "Pendiente"} /></td>
                      <td className="px-5 py-4"><JourneyStatus complete={Boolean(lead.convertedAt)} label={lead.accountPlan === "pro" ? "Pro" : lead.accountPlan === "admin" ? "Admin" : lead.convertedAt ? "Free" : "Sin cuenta"} /></td>
                      <td className="px-5 py-4"><JourneyStatus complete={Boolean(lead.agentsFirstRunAt)} label={lead.agentsFirstRunAt ? "Activado" : "Pendiente"} /></td>
                      <td className="px-5 py-4"><JourneyStatus complete={Boolean(lead.academyStartedAt)} label={lead.academyStartedAt ? "Iniciada" : "Pendiente"} /></td>
                      <td className="px-5 py-4"><JourneyStatus complete={Boolean(lead.completedAt)} label={lead.completedAt ? "Completa" : "En proceso"} /></td>
                      <td className="px-5 py-4"><span className="font-black text-slate-950">{lead.emailsSent}</span><span className="text-slate-500"> enviados</span></td>
                    </tr>)}
                  </tbody>
                </table>
              </div> : <p className="p-6 text-sm text-slate-500">Todavía no hay leads para mostrar.</p>}
            </div>
          </section>

          <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-500">Actualizado al abrir esta página: {new Intl.DateTimeFormat("es", { dateStyle: "long", timeStyle: "short", timeZone: "America/Guayaquil" }).format(new Date(metrics.generatedAt))}. Los datos no son públicos.</p>
        </>}
      </Container>
    </AppLayout>
  );
}
