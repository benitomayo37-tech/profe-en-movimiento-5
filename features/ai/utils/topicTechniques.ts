export interface TopicTechniqueRule {
  label: string;
  visiblePattern: RegExp;
  replacementPattern: RegExp;
  abbreviatedRequestPattern?: RegExp;
}

export const TOPIC_TECHNIQUE_RULES: TopicTechniqueRule[] = [
  {
    label: "pase de pecho",
    visiblePattern: /\bpase(?:s)?\s+de\s+pecho\b/i,
    replacementPattern: /\bpase(?:s)?\s+de\s+pecho\b/gi,
    abbreviatedRequestPattern: /\bpecho\b/i,
  },
  {
    label: "pase de pique",
    visiblePattern: /\bpase(?:s)?\s+(?:de\s+)?(?:pique|picado)\b/i,
    replacementPattern: /\bpase(?:s)?\s+(?:de\s+)?(?:pique|picado)\b/gi,
    abbreviatedRequestPattern: /\b(?:pique|picado)\b/i,
  },
  {
    label: "pase sobre la cabeza",
    visiblePattern:
      /\bpase(?:s)?\s+(?:sobre|por\s+encima\s+de)\s+(?:la\s+)?cabeza\b/i,
    replacementPattern:
      /\bpase(?:s)?\s+(?:sobre|por\s+encima\s+de)\s+(?:la\s+)?cabeza\b/gi,
    abbreviatedRequestPattern:
      /\b(?:sobre|por\s+encima\s+de)\s+(?:la\s+)?cabeza\b/i,
  },
  {
    label: "pase de béisbol",
    visiblePattern: /\bpase(?:s)?\s+de\s+b[eé]isbol\b/i,
    replacementPattern: /\bpase(?:s)?\s+de\s+b[eé]isbol\b/gi,
    abbreviatedRequestPattern: /\bb[eé]isbol\b/i,
  },
  {
    label: "dribling",
    visiblePattern:
      /\b(?:dribling|dribbling|bote\s+de\s+bal[oó]n|manejo\s+de\s+bal[oó]n)\b/i,
    replacementPattern:
      /\b(?:dribling|dribbling|bote\s+de\s+bal[oó]n|manejo\s+de\s+bal[oó]n)\b/gi,
  },
  {
    label: "tiro al aro",
    visiblePattern:
      /\b(?:tiro|lanzamiento)\s+(?:al\s+aro|a\s+canasta)\b/i,
    replacementPattern:
      /\b(?:tiro|lanzamiento)\s+(?:al\s+aro|a\s+canasta)\b/gi,
  },
  {
    label: "entrada a canasta",
    visiblePattern: /\b(?:entrada\s+a\s+canasta|doble\s+ritmo)\b/i,
    replacementPattern: /\b(?:entrada\s+a\s+canasta|doble\s+ritmo)\b/gi,
  },
];

export function getRequestedTechniqueRules(
  requestedText: string,
): TopicTechniqueRule[] {
  const includesPassContext = /\bpases?\b/i.test(requestedText);

  return TOPIC_TECHNIQUE_RULES.filter((rule) =>
    rule.visiblePattern.test(requestedText) ||
    Boolean(
      includesPassContext &&
        rule.abbreviatedRequestPattern?.test(requestedText),
    ),
  );
}
