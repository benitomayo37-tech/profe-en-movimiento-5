import { getAssistantById, isAssistantAvailable } from "../assistants/registry";
import { routeAssistant } from "../router/routeAssistant";
import type {
  AIAssistant,
  AssistantId,
  AssistantRoutingResult,
} from "../types/assistant";

export interface ResolvedAssistant {
  requestedAssistantId: AssistantId;
  selectedAssistant: AIAssistant;
  routing: AssistantRoutingResult;
  fallbackApplied: boolean;
  fallbackReason?: string;
}

const DEFAULT_ASSISTANT_ID: AssistantId = "profegpt";

const buildFallbackRouting = (
  originalRouting: AssistantRoutingResult,
): AssistantRoutingResult => {
  return {
    assistantId: DEFAULT_ASSISTANT_ID,
    domain: "education",
    confidence: originalRouting.confidence,
    reason:
      `${originalRouting.reason} ` +
      "El asistente detectado todavía no está disponible, por lo que ProfeGPT atenderá temporalmente la consulta.",
  };
};

export const resolveAssistant = (
  message: string,
  preferredAssistantId?: AssistantId,
): ResolvedAssistant => {
  const routing = routeAssistant(message, preferredAssistantId);
  const requestedAssistantId = routing.assistantId;

  if (isAssistantAvailable(requestedAssistantId)) {
    return {
      requestedAssistantId,
      selectedAssistant: getAssistantById(requestedAssistantId),
      routing,
      fallbackApplied: false,
    };
  }

  const fallbackRouting = buildFallbackRouting(routing);

  return {
    requestedAssistantId,
    selectedAssistant: getAssistantById(DEFAULT_ASSISTANT_ID),
    routing: fallbackRouting,
    fallbackApplied: true,
    fallbackReason:
      `${getAssistantById(requestedAssistantId).name} se encuentra en desarrollo.`,
  };
};