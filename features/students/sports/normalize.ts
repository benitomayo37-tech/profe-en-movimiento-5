import type { StudentSportsResult } from "@/features/students/sports/types";

const FREE_THROW_RULES = [
  "Cada tiro libre convertido suma un punto para el equipo del lanzador.",
  "Los jugadores ubicados en los espacios de rebote pueden entrar en la zona cuando el balón sale de las manos del lanzador.",
  "El lanzador no puede pisar la línea ni entrar en la zona restringida hasta que el balón entre en la canasta o toque el aro.",
];

function normalizeText(value: string) {
  return value
    .replace(/\bIdentify\b/gi, "Identifica")
    .replace(/l[ií]nea de lance libre/gi, "línea de tiro libre")
    .replace(
      /reserva(?:r)? espacio visual[^.]*\.?/gi,
      "Observa una demostración correcta y compara la postura, la alineación y el seguimiento.",
    )
    .replace(
      /(?:usar|utilizar|colocar|emplear) un aro m[aá]s alto\s*\/\s*bajo/gi,
      "usar un aro más bajo o reducir la distancia",
    )
    .replace(
      /error:\s*(?:mover|colocar|llevar|mantener)\s+la mano gu[ií]a al costado del bal[oó]n\.?\s*(?:correcci[oó]n:\s*[^.]*\.?)?/gi,
      "Error: impulsar o desviar el balón con la mano guía. Corrección: mantener la mano guía al costado del balón para que solo la mano de tiro impulse y dirija.",
    )
    .replace(
      /error:\s*mano gu[ií]a al costado del bal[oó]n\.?\s*(?:correcci[oó]n:\s*[^.]*\.?)?/gi,
      "Error: impulsar o desviar el balón con la mano guía. Corrección: mantener la mano guía al costado del balón para que solo la mano de tiro impulse y dirija.",
    )
    .replace(/la mano gu[ií]a (?:atr[aá]s|detr[aá]s) del bal[oó]n/gi, "la mano guía al costado del balón")
    .replace(
      /(?:los|otros) jugadores[^.]{0,120}(?:hasta que|cuando) el bal[oó]n (?:toque|haya tocado) (?:el )?(?:aro|tablero)[^.]*\.?/gi,
      "Los jugadores ubicados en los espacios de rebote pueden entrar en la zona cuando el balón sale de las manos del lanzador.",
    )
    .replace(
      /el lanzador[^.]{0,100}(?:hasta que|cuando) el bal[oó]n (?:toque|haya tocado) (?:el )?tablero[^.]*\.?/gi,
      "El lanzador no puede pisar la línea ni entrar en la zona restringida hasta que el balón entre en la canasta o toque el aro.",
    )
    .replace(/pauta t[eé]cnica y reglamentaria/gi, "pauta técnica para controlar el balón")
    .replace(/el borde del tablero o el centro del aro/gi, "el borde delantero o el centro del aro")
    .replace(
      /practicar (?:los )?tiros? desde (?:las )?rodillas/gi,
      "practicar primero desde una distancia corta y después integrar progresivamente el impulso de las piernas",
    );
}

function normalizeFreeThrowRules(result: StudentSportsResult): StudentSportsResult {
  const subject = `${result.title} ${result.detectedFocus}`;
  if (!/tiro\s+libre/i.test(subject) || !/baloncesto/i.test(subject)) return result;

  return {
    ...result,
    pages: result.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) => /reglas|criterios/i.test(block.title)
        ? { ...block, points: FREE_THROW_RULES }
        : block),
    })),
  };
}

export function normalizeStudentSportsResult(result: StudentSportsResult): StudentSportsResult {
  const normalized = {
    ...result,
    title: normalizeText(result.title),
    subtitle: normalizeText(result.subtitle),
    introduction: normalizeText(result.introduction),
    detectedFocus: normalizeText(result.detectedFocus),
    pages: result.pages.map((page) => ({
      ...page,
      heading: normalizeText(page.heading),
      blocks: page.blocks.map((block) => ({
        ...block,
        title: normalizeText(block.title),
        content: normalizeText(block.content),
        points: block.points.map(normalizeText),
      })),
    })),
    glossary: result.glossary.map((item) => ({
      term: normalizeText(item.term),
      definition: normalizeText(item.definition),
    })),
    keyIdeas: result.keyIdeas.map(normalizeText),
    reflectionQuestion: normalizeText(result.reflectionQuestion),
  };
  return normalizeFreeThrowRules(normalized);
}
