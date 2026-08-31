export type AgentSpecialist = "coordinator" | "planning" | "assessment" | "inclusion" | "training";

export interface AgentConversation {
  id: string;
  title: string;
  last_specialist: AgentSpecialist | null;
  created_at: string;
  updated_at: string;
}

export interface AgentMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  specialist: AgentSpecialist | null;
  saved_at: string | null;
  created_at: string;
}
