import type { AssistantId } from "../types/assistant";
import { PROFE_IA_INSTRUCTIONS } from "./profe-ia/instructions";
import { PROFEGPT_INSTRUCTIONS } from "./profegpt/instructions";
import { SALUDGPT_INSTRUCTIONS } from "./saludgpt/instructions";
import { SPORTGPT_INSTRUCTIONS } from "./sportgpt/instructions";

const ASSISTANT_INSTRUCTIONS: Record<AssistantId, string> = {
  "profe-ia": PROFE_IA_INSTRUCTIONS,
  profegpt: PROFEGPT_INSTRUCTIONS,
  sportgpt: SPORTGPT_INSTRUCTIONS,
  saludgpt: SALUDGPT_INSTRUCTIONS,
};

export const getAssistantInstructions = (
  assistantId: AssistantId,
): string => {
  return ASSISTANT_INSTRUCTIONS[assistantId];
};