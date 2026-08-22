import type { GeneratedAIContent } from "../types/ai";
import type {
  AIAssistant,
  AssistantId,
  AssistantRoutingResult,
} from "../types/assistant";

export interface AIEngineMetadata {
  assistant: AIAssistant;
  requestedAssistantId: AssistantId;
  routing: AssistantRoutingResult;
  fallbackApplied: boolean;
  fallbackReason?: string;
  model: string;
}

export interface AIEngineGenerationResult {
  content: GeneratedAIContent;
  metadata: AIEngineMetadata;
}