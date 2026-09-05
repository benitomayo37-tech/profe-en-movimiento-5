import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  AccountBadge,
  AppLayout,
  Sidebar,
} from "@/components/layout";
import Container from "@/components/ui/Container";
import SavedAgentDocuments, {
  type SavedAgentDocument,
} from "@/features/agents/components/SavedAgentDocuments";
import { getAuthAccess } from "@/features/auth/server/access";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Documentos de Agentes IA | Profe en Movimiento",
  description:
    "Planificaciones, evaluaciones y entrenamientos guardados.",
};

interface MessageRow {
  id: string;
  conversation_id: string;
  content: string;
  saved_at: string;
}

interface ConversationRow {
  id: string;
  title: string;
}

interface VersionRow {
  message_id: string;
  version_number: number;
  content: string;
  created_at: string;
}

export default async function AgentDocumentsPage() {
  const access = await getAuthAccess();

  if (!access.authenticated || !access.userId) {
    redirect("/login?next=/agentes/documentos");
  }

  const supabase = await createClient();
  if (!supabase) redirect("/dashboard");

  const documentLimit =
    access.role === "admin"
      ? 300
      : access.hasProAccess
        ? 100
        : 10;

  const { data: savedMessages } = await supabase
    .from("ai_agent_messages")
    .select("id,conversation_id,content,saved_at")
    .eq("user_id", access.userId)
    .eq("role", "assistant")
    .eq("response_kind", "result")
    .not("saved_at", "is", null)
    .order("saved_at", { ascending: false })
    .limit(documentLimit);

  const messages = (savedMessages ?? []) as MessageRow[];
  const messageIds = messages.map((item) => item.id);
  const conversationIds = [
    ...new Set(messages.map((item) => item.conversation_id)),
  ];

  const { data: conversationData } = conversationIds.length
    ? await supabase
        .from("ai_agent_conversations")
        .select("id,title")
        .eq("user_id", access.userId)
        .in("id", conversationIds)
    : { data: [] };

  const { data: versionData } = messageIds.length
    ? await supabase
        .from("ai_agent_result_versions")
        .select("message_id,version_number,content,created_at")
        .eq("user_id", access.userId)
        .in("message_id", messageIds)
        .order("version_number", { ascending: false })
    : { data: [] };

  const conversations = new Map(
    ((conversationData ?? []) as ConversationRow[]).map((item) => [
      item.id,
      item.title,
    ]),
  );
  const latestVersions = new Map<string, VersionRow>();
  const versionCounts = new Map<string, number>();

  for (const version of (versionData ?? []) as VersionRow[]) {
    versionCounts.set(
      version.message_id,
      (versionCounts.get(version.message_id) ?? 0) + 1,
    );

    if (!latestVersions.has(version.message_id)) {
      latestVersions.set(version.message_id, version);
    }
  }

  const documents: SavedAgentDocument[] = messages.map((message) => {
    const latest = latestVersions.get(message.id);

    return {
      id: message.id,
      conversationId: message.conversation_id,
      conversationTitle:
        conversations.get(message.conversation_id)
        ?? "Conversación de Agentes IA",
      originalContent: message.content,
      content: latest?.content ?? message.content,
      savedAt: latest?.created_at ?? message.saved_at,
      versionCount: versionCounts.get(message.id) ?? 0,
      latestVersionNumber: latest?.version_number ?? null,
    };
  });

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={
        <div className="flex min-h-20 items-center justify-between gap-4 px-6">
          <div>
            <h1 className="text-lg font-bold text-slate-950">
              Documentos de Agentes IA
            </h1>
            <p className="text-sm text-slate-500">
              Resultados guardados y versiones editadas
            </p>
          </div>
          <AccountBadge
            authenticated
            email={access.email}
            fullName={access.fullName}
          />
        </div>
      }
      footer={
        <div className="px-6 py-4 text-center text-xs text-slate-500">
          Profe en Movimiento 5.0 · Documentos privados
        </div>
      }
    >
      <Container size="wide" className="space-y-7 py-8">
        <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-violet-900 p-8 text-white shadow-xl sm:p-10">
          <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">
            Biblioteca personal
          </p>
          <h1 className="mt-3 text-4xl font-black">
            Tus documentos creados con Agentes IA
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-blue-100">
            Encuentra rápidamente planificaciones, rúbricas,
            evaluaciones, adaptaciones y entrenamientos que hayas
            guardado. Siempre se muestra la versión más reciente.
          </p>
        </section>

        <SavedAgentDocuments
          documents={documents}
          hasProAccess={access.hasProAccess}
        />
      </Container>
    </AppLayout>
  );
}