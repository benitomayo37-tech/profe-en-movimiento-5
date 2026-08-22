import type {
  AssistantDomain,
  AssistantId,
  AssistantRoutingResult,
} from "../types/assistant";

interface RoutingRule {
  assistantId: Exclude<AssistantId, "profe-ia">;
  domain: Exclude<AssistantDomain, "orchestrator">;
  keywords: readonly string[];
}

const ROUTING_RULES: readonly RoutingRule[] = [
  {
    assistantId: "profegpt",
    domain: "education",
    keywords: [
      "planificación",
      "planificacion",
      "clase",
      "docente",
      "estudiante",
      "currículo",
      "curriculo",
      "rúbrica",
      "rubrica",
      "evaluación",
      "evaluacion",
      "dua",
      "nee",
      "adaptación",
      "adaptacion",
      "destreza",
      "indicador",
      "metodología",
      "metodologia",
      "didáctica",
      "didactica",
      "educación física",
      "educacion fisica",
      "bachillerato",
      "básica",
      "basica",
      "juego cooperativo",
      "instrumento de evaluación",
    ],
  },
  {
    assistantId: "sportgpt",
    domain: "sport",
    keywords: [
      "deporte",
      "entrenamiento",
      "técnica",
      "tecnica",
      "táctica",
      "tactica",
      "reglamento",
      "fútbol",
      "futbol",
      "baloncesto",
      "atletismo",
      "voleibol",
      "natación",
      "natacion",
      "mundial",
      "olímpico",
      "olimpico",
      "partido",
      "jugador",
      "equipo",
      "entrenador",
      "competencia",
      "rendimiento deportivo",
      "sesión de entrenamiento",
      "sesion de entrenamiento",
    ],
  },
  {
    assistantId: "saludgpt",
    domain: "health",
    keywords: [
      "salud",
      "ejercicio",
      "actividad física",
      "actividad fisica",
      "bienestar",
      "sedentarismo",
      "hábitos saludables",
      "habitos saludables",
      "adulto mayor",
      "movilidad",
      "flexibilidad",
      "postura",
      "sobrepeso",
      "obesidad",
      "prevención",
      "prevencion",
      "calidad de vida",
      "rutina saludable",
      "condición física",
      "condicion fisica",
      "frecuencia cardíaca",
      "frecuencia cardiaca",
    ],
  },
];

const normalizeText = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const calculateMatches = (
  normalizedMessage: string,
  keywords: readonly string[],
): number => {
  return keywords.reduce((total, keyword) => {
    const normalizedKeyword = normalizeText(keyword);

    return normalizedMessage.includes(normalizedKeyword)
      ? total + 1
      : total;
  }, 0);
};

const buildConfidence = (
  bestScore: number,
  totalMatches: number,
): number => {
  if (bestScore === 0 || totalMatches === 0) {
    return 0.5;
  }

  const score = bestScore / totalMatches;

  return Number(Math.min(0.99, 0.6 + score * 0.35).toFixed(2));
};

export const routeAssistant = (
  message: string,
  preferredAssistantId?: AssistantId,
): AssistantRoutingResult => {
  const normalizedMessage = normalizeText(message);

  if (preferredAssistantId && preferredAssistantId !== "profe-ia") {
    const preferredRule = ROUTING_RULES.find(
      (rule) => rule.assistantId === preferredAssistantId,
    );

    if (preferredRule) {
      return {
        assistantId: preferredRule.assistantId,
        domain: preferredRule.domain,
        confidence: 1,
        reason: "El usuario seleccionó directamente este asistente.",
      };
    }
  }

  const rankedRules = ROUTING_RULES.map((rule) => ({
    ...rule,
    score: calculateMatches(normalizedMessage, rule.keywords),
  })).sort((first, second) => second.score - first.score);

  const bestMatch = rankedRules[0];
  const totalMatches = rankedRules.reduce(
    (total, rule) => total + rule.score,
    0,
  );

  if (!bestMatch || bestMatch.score === 0) {
    return {
      assistantId: "profegpt",
      domain: "education",
      confidence: 0.5,
      reason:
        "No se detectó una intención especializada clara. Se utiliza ProfeGPT como asistente predeterminado.",
    };
  }

  return {
    assistantId: bestMatch.assistantId,
    domain: bestMatch.domain,
    confidence: buildConfidence(bestMatch.score, totalMatches),
    reason: `Se detectaron ${bestMatch.score} coincidencias relacionadas con el dominio ${bestMatch.domain}.`,
  };
};