export type AssistantId =
  | "profe-ia"
  | "profegpt"
  | "sportgpt"
  | "saludgpt";

export type AssistantDomain =
  | "orchestrator"
  | "education"
  | "sport"
  | "health";

export type AssistantStatus =
  | "active"
  | "coming-soon"
  | "disabled";

export type AssistantIcon =
  | "🤖"
  | "🧑‍🏫"
  | "🏃"
  | "❤️";

export interface AIAssistant {
  id: AssistantId;
  name: string;
  shortName: string;
  description: string;
  domain: AssistantDomain;
  icon: AssistantIcon;
  status: AssistantStatus;
  capabilities: string[];
}

export interface AssistantRoutingResult {
  assistantId: AssistantId;
  domain: AssistantDomain;
  confidence: number;
  reason: string;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  assistantId?: AssistantId;
  createdAt: string;
}

export interface AssistantConversation {
  id: string;
  title: string;
  activeAssistantId: AssistantId;
  messages: AssistantMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AssistantRequest {
  message: string;
  preferredAssistantId?: AssistantId;
  conversationId?: string;
}

export interface AssistantResponse {
  success: true;
  assistantId: AssistantId;
  assistantName: string;
  content: string;
  routing: AssistantRoutingResult;
}

export interface AssistantErrorResponse {
  success: false;
  error: string;
  code?:
    | "INVALID_REQUEST"
    | "ROUTING_ERROR"
    | "GENERATION_ERROR"
    | "RATE_LIMIT"
    | "UNAVAILABLE";
}

export type AssistantAPIResponse =
  | AssistantResponse
  | AssistantErrorResponse;