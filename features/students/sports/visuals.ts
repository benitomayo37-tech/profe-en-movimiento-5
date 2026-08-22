import type { StudentSportsVisual } from "@/features/students/sports/types";

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const ALLOWED_LICENSE_PATTERN = /(?:CC0|CC BY|CC-BY|public domain|dominio p[uú]blico)/i;

interface CommonsMetadataValue {
  value?: unknown;
}

interface CommonsPage {
  title?: unknown;
  imageinfo?: Array<{
    thumburl?: unknown;
    descriptionurl?: unknown;
    extmetadata?: Record<string, CommonsMetadataValue>;
  }>;
}

interface VisualSearchPlan {
  queries: string[];
  requiredGroups: string[][];
  caption: string;
}

const SPORT_PLANS: Array<{ pattern: RegExp; term: string; aliases: string[] }> = [
  { pattern: /baloncesto/i, term: "basketball", aliases: ["basketball", "baloncesto"] },
  { pattern: /f[uú]tbol/i, term: "association football", aliases: ["football", "soccer", "futbol", "fútbol"] },
  { pattern: /voleibol|v[oó]ley/i, term: "volleyball", aliases: ["volleyball", "voleibol", "voley", "vóley"] },
  { pattern: /nataci[oó]n/i, term: "swimming", aliases: ["swimming", "natacion", "natación"] },
  { pattern: /atletismo|carrera|velocidad/i, term: "athletics running", aliases: ["athletics", "running", "sprint", "atletismo", "carrera"] },
  { pattern: /gimnasia/i, term: "gymnastics", aliases: ["gymnastics", "gimnasia"] },
  { pattern: /balonmano|handball/i, term: "handball", aliases: ["handball", "balonmano"] },
  { pattern: /b[eé]isbol/i, term: "baseball", aliases: ["baseball", "beisbol", "béisbol"] },
  { pattern: /tenis/i, term: "tennis", aliases: ["tennis", "tenis"] },
  { pattern: /ciclismo/i, term: "cycling", aliases: ["cycling", "cyclist", "ciclismo"] },
  { pattern: /boxeo/i, term: "boxing", aliases: ["boxing", "boxeo"] },
  { pattern: /judo/i, term: "judo", aliases: ["judo"] },
];

function plainText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const text = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
  return text || fallback;
}

function metadataValue(metadata: Record<string, CommonsMetadataValue> | undefined, key: string) {
  return metadata?.[key]?.value;
}

function isSafeCommonsImage(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "upload.wikimedia.org";
  } catch {
    return false;
  }
}

function normalizedSearchText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function matchesRequiredGroups(value: string, groups: string[][]) {
  const normalized = normalizedSearchText(value);
  return groups.every((group) => group.some((term) => normalized.includes(normalizedSearchText(term))));
}

function visualSearchPlan(topic: string): VisualSearchPlan | null {
  const sport = SPORT_PLANS.find((candidate) => candidate.pattern.test(topic));
  if (!sport) return null;

  if (sport.term === "basketball" && /tiro\s+libre/i.test(topic)) {
    return {
      queries: ["basketball free throw", "basketball free throw technique"],
      requiredGroups: [sport.aliases, ["free throw", "free-throw", "freethrow", "tiro libre"]],
      caption: "Ejecución de un tiro libre durante un partido de baloncesto.",
    };
  }

  return {
    queries: [`${sport.term} sport`, `${sport.term} technique`],
    requiredGroups: [sport.aliases],
    caption: "Ejemplo visual relacionado con el tema deportivo investigado.",
  };
}

async function searchCommons(
  query: string,
  requiredGroups: string[][],
  safeCaption: string,
  pageNumber: 1 | 2,
): Promise<StudentSportsVisual | null> {
  const parameters = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "1000",
    uselang: "es",
    origin: "*",
  });

  const response = await fetch(`${COMMONS_API}?${parameters.toString()}`, {
    headers: { "User-Agent": "ProfeEnMovimiento/5.0 (educational visual support)" },
    signal: AbortSignal.timeout(5_500),
  });
  if (!response.ok) return null;

  const payload = await response.json() as { query?: { pages?: CommonsPage[] } };
  for (const page of payload.query?.pages ?? []) {
    const image = page.imageinfo?.[0];
    if (!image) continue;
    const imageUrl = typeof image.thumburl === "string" ? image.thumburl : "";
    const sourcePage = typeof image.descriptionurl === "string" ? image.descriptionurl : "";
    const metadata = image.extmetadata;
    const license = plainText(metadataValue(metadata, "LicenseShortName"), "Licencia indicada en Wikimedia Commons");
    if (!imageUrl || !sourcePage || !isSafeCommonsImage(imageUrl) || !ALLOWED_LICENSE_PATTERN.test(license)) continue;

    const description = plainText(
      metadataValue(metadata, "ImageDescription"),
      plainText(page.title, "Imagen deportiva"),
    );
    const candidateText = `${plainText(page.title, "")} ${description}`;
    if (!matchesRequiredGroups(candidateText, requiredGroups)) continue;
    const author = plainText(metadataValue(metadata, "Artist"), "Autor indicado en Wikimedia Commons");
    return {
      pageNumber,
      imageUrl,
      sourcePage,
      alt: `Apoyo visual: ${safeCaption}`.slice(0, 220),
      caption: safeCaption.slice(0, 220),
      author: author.slice(0, 160),
      license: license.slice(0, 80),
    };
  }
  return null;
}

export async function findStudentSportsVisuals(topic: string) {
  const plan = visualSearchPlan(topic);
  if (!plan) return [];
  const visuals: StudentSportsVisual[] = [];

  for (let index = 0; index < plan.queries.length; index += 1) {
    try {
      const visual = await searchCommons(
        plan.queries[index],
        plan.requiredGroups,
        plan.caption,
        (index + 1) as 1 | 2,
      );
      if (visual && !visuals.some((item) => item.imageUrl === visual.imageUrl)) visuals.push(visual);
    } catch {
      // El apoyo visual es opcional: el reporte textual continúa si Commons no responde.
    }
  }
  return visuals;
}
