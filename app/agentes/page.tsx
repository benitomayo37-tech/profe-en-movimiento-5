import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import AgentsWorkspace from "@/features/agents/components/AgentsWorkspace";
import type { AgentConversation, AgentMessage } from "@/features/agents/types";
import { getAuthAccess } from "@/features/auth/server/access";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Agentes IA | Profe en Movimiento", description: "Coordinación inteligente para planificación, evaluación, inclusión y entrenamiento deportivo." };

export default async function AgentsPage({ searchParams }: { searchParams: Promise<{ conversation?: string }> }) {
  const access = await getAuthAccess();
  if (!access.authenticated || !access.userId) redirect("/login?next=/agentes");
  const supabase = await createClient();
  if (!supabase) redirect("/dashboard");
  const params = await searchParams;
  const { data: conversationsData } = await supabase.from("ai_agent_conversations").select("id,title,last_specialist,created_at,updated_at").eq("user_id", access.userId).order("updated_at", { ascending: false }).limit(30);
  const conversations = (conversationsData ?? []) as AgentConversation[];
  const requested = typeof params.conversation === "string" && conversations.some((item) => item.id === params.conversation) ? params.conversation : null;
  const conversationId = requested;
  const { data: messagesData } = conversationId ? await supabase.from("ai_agent_messages").select("id,conversation_id,role,content,specialist,saved_at,created_at").eq("conversation_id", conversationId).eq("user_id", access.userId).order("created_at", { ascending: true }).limit(100) : { data: [] };
  const month = new Date(); month.setUTCDate(1); month.setUTCHours(0, 0, 0, 0);
  const { data: usage } = await supabase.from("monthly_agent_usage").select("run_count").eq("user_id", access.userId).eq("usage_month", month.toISOString().slice(0, 10)).maybeSingle();
  const monthlyLimit = access.role === "admin" ? 1000 : access.hasProAccess ? 100 : 3;
  const remaining = Math.max(0, monthlyLimit - (usage?.run_count ?? 0));

  return <AppLayout sidebar={<Sidebar />} header={<div className="flex min-h-20 items-center justify-between gap-4 px-6"><div><h1 className="text-lg font-bold text-slate-950">Centro de Agentes IA</h1><p className="text-sm text-slate-500">Coordinador docente y especialistas</p></div><AccountBadge authenticated email={access.email} fullName={access.fullName} /></div>} footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · El docente conserva la decisión final</div>}>
    <Container size="wide" className="space-y-7 py-8"><section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-violet-900 p-8 text-white shadow-xl sm:p-10"><p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">Segunda fase</p><h1 className="mt-3 text-4xl font-black">Un equipo de agentes para tu trabajo docente y deportivo</h1><p className="mt-4 max-w-3xl leading-7 text-blue-100">Planificación, Evaluación, Inclusión y Entrenamiento Deportivo colaboran bajo un Coordinador. Cada resultado queda en tu conversación y solo se guarda cuando tú lo confirmas.</p></section><AgentsWorkspace initialConversations={conversations} initialMessages={(messagesData ?? []) as AgentMessage[]} initialConversationId={conversationId} initialRemaining={remaining} monthlyLimit={monthlyLimit} /></Container>
  </AppLayout>;
}
