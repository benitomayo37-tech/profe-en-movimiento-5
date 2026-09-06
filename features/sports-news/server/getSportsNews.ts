import { XMLParser } from "fast-xml-parser";
import iconv from "iconv-lite";
import { unstable_cache } from "next/cache";

import {
  sportsNewsSources,
  type SportsNewsSource,
} from "@/features/sports-news/sources";
import {
  sportsNewsCategories,
  type SportsNewsItem,
  type SportsNewsResponse,
} from "@/features/sports-news/types";

const REQUEST_TIMEOUT_MS = 12_000;
const MAX_ITEMS_PER_SOURCE = 12;
const MAX_TOTAL_ITEMS = 60;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true,
  textNodeName: "#text",
  trimValues: true,
  processEntities: true,
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value)
    ? value
    : [value];
}

function readText(value: unknown): string {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const text = readText(entry);

      if (text) {
        return text;
      }
    }

    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value).trim();
  }

  if (
    value &&
    typeof value === "object"
  ) {
    const record =
      value as Record<string, unknown>;

    return readText(
      record["#text"] ??
      record["__cdata"] ??
      "",
    );
  }

  return "";
}

function countEncodingArtifacts(value: string): number {
  return (
    value.match(
      /Ã.|Â.|â.|ðŸ|�/g,
    ) ?? []
  ).length;
}

function repairTextEncoding(value: string): string {
  const originalArtifactCount =
    countEncodingArtifacts(value);

  if (originalArtifactCount === 0) {
    return value;
  }

  const repaired =
    iconv.decode(
      iconv.encode(
        value,
        "windows-1252",
      ),
      "utf8",
    );

  const repairedArtifactCount =
    countEncodingArtifacts(repaired);

  if (
    repaired.includes("�") ||
    repairedArtifactCount >= originalArtifactCount
  ) {
    return value;
  }

  return repaired;
}

function stripMarkup(value: string): string {
  return repairTextEncoding(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(
  value: string,
  maximumLength: number,
): string {
  if (value.length <= maximumLength) {
    return value;
  }

  return `${value.slice(0, maximumLength - 1).trim()}…`;
}

function readLink(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const link = readLink(entry);

      if (link) {
        return link;
      }
    }

    return "";
  }

  if (
    value &&
    typeof value === "object"
  ) {
    const record =
      value as Record<string, unknown>;

    return readText(
      record["@_href"] ??
      record["#text"] ??
      "",
    );
  }

  return "";
}

function isAllowedArticleUrl(
  value: string,
  source: SportsNewsSource,
): boolean {
  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return false;
    }

    return source.allowedDomains.some(
      (domain) =>
        url.hostname === domain ||
        url.hostname.endsWith(`.${domain}`),
    );
  }
  catch {
    return false;
  }
}

function createStableId(
  sourceId: string,
  value: string,
): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash =
      Math.imul(31, hash) +
      value.charCodeAt(index) |
      0;
  }

  return `${sourceId}-${Math.abs(hash)}`;
}

function normalizeDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? new Date(0).toISOString()
    : date.toISOString();
}

function extractRawItems(
  parsedFeed: unknown,
): Array<Record<string, unknown>> {
  if (
    !parsedFeed ||
    typeof parsedFeed !== "object"
  ) {
    return [];
  }

  const root =
    parsedFeed as Record<string, unknown>;

  const rss =
    root.rss as
      | Record<string, unknown>
      | undefined;

  const channel =
    rss?.channel as
      | Record<string, unknown>
      | undefined;

  if (channel?.item) {
    return asArray(channel.item)
      .filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) &&
          typeof item === "object",
      );
  }

  const feed =
    root.feed as
      | Record<string, unknown>
      | undefined;

  return asArray(feed?.entry)
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) &&
        typeof item === "object",
    );
}

function normalizeItem(
  rawItem: Record<string, unknown>,
  source: SportsNewsSource,
): SportsNewsItem | null {
  const title =
    truncate(
      stripMarkup(
        readText(rawItem.title),
      ),
      180,
    );

  const url =
    readLink(rawItem.link) ||
    readText(rawItem.guid);

  if (
    title.length < 8 ||
    !isAllowedArticleUrl(url, source)
  ) {
    return null;
  }

  const summary =
    truncate(
      stripMarkup(
        readText(
          rawItem.description ??
          rawItem.summary ??
          rawItem.content,
        ),
      ),
      240,
    );

  const publishedAt =
    normalizeDate(
      readText(
        rawItem.pubDate ??
        rawItem.published ??
        rawItem.updated,
      ),
    );

  return {
    id: createStableId(
      source.id,
      `${url}-${title}`,
    ),
    title,
    summary,
    url,
    source: source.name,
    category: source.category,
    publishedAt,
  };
}

async function fetchSource(
  source: SportsNewsSource,
): Promise<SportsNewsItem[]> {
  const response = await fetch(
    source.feedUrl,
    {
      headers: {
        Accept:
          "application/rss+xml, application/xml, text/xml;q=0.9",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152 Safari/537.36",
        "Accept-Language":
          "es-ES,es;q=0.9",
      },
      next: {
        revalidate: 3600,
      },
      signal:
        AbortSignal.timeout(
          REQUEST_TIMEOUT_MS,
        ),
    },
  );

  if (!response.ok) {
    throw new Error(
      `La fuente ${source.name} respondió ${response.status}.`,
    );
  }

  const xml = await response.text();
  const parsedFeed =
    parser.parse(xml) as unknown;

  return extractRawItems(parsedFeed)
    .slice(0, MAX_ITEMS_PER_SOURCE)
    .map((item) =>
      normalizeItem(item, source),
    )
    .filter(
      (item): item is SportsNewsItem =>
        item !== null,
    );
}

function removeDuplicates(
  items: SportsNewsItem[],
): SportsNewsItem[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();

  return items.filter((item) => {
    const normalizedTitle =
      item.title
        .toLocaleLowerCase("es")
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim();

    if (
      seenUrls.has(item.url) ||
      seenTitles.has(normalizedTitle)
    ) {
      return false;
    }

    seenUrls.add(item.url);
    seenTitles.add(normalizedTitle);

    return true;
  });
}

function limitWithCategoryCoverage(
  items: SportsNewsItem[],
  maximum: number,
): SportsNewsItem[] {
  const sortedItems =
    [...items].sort(
      (first, second) =>
        new Date(second.publishedAt).getTime() -
        new Date(first.publishedAt).getTime(),
    );

  const selected: SportsNewsItem[] = [];
  const selectedIds = new Set<string>();

  for (const category of sportsNewsCategories) {
    const categoryItems =
      sortedItems
        .filter(
          (item) =>
            item.category === category,
        )
        .slice(0, 3);

    for (const item of categoryItems) {
      if (!selectedIds.has(item.id)) {
        selected.push(item);
        selectedIds.add(item.id);
      }
    }
  }

  for (const item of sortedItems) {
    if (selected.length >= maximum) {
      break;
    }

    if (!selectedIds.has(item.id)) {
      selected.push(item);
      selectedIds.add(item.id);
    }
  }

  return selected
    .sort(
      (first, second) =>
        new Date(second.publishedAt).getTime() -
        new Date(first.publishedAt).getTime(),
    )
    .slice(0, maximum);
}

async function loadSportsNews():
  Promise<SportsNewsResponse> {
  const results =
    await Promise.allSettled(
      sportsNewsSources.map(
        async (source) => ({
          source,
          items: await fetchSource(source),
        }),
      ),
    );

  const availableSources =
    new Set<string>();

  const unavailableSources =
    new Set<string>();

  const items: SportsNewsItem[] = [];

  results.forEach((result, index) => {
    const configuredSource =
      sportsNewsSources[index];

    if (result.status === "fulfilled") {
      if (result.value.items.length > 0) {
        availableSources.add(
          configuredSource.name,
        );

        items.push(...result.value.items);
      }
      else {
        unavailableSources.add(
          configuredSource.name,
        );
      }
    }
    else {
      unavailableSources.add(
        configuredSource.name,
      );

      console.warn(
        `[Actualidad Deportiva] ${configuredSource.id}:`,
        result.reason instanceof Error
          ? result.reason.message
          : "Error desconocido",
      );
    }
  });

  const normalizedItems =
    limitWithCategoryCoverage(
      removeDuplicates(items),
      MAX_TOTAL_ITEMS,
    );

  return {
    items: normalizedItems,
    updatedAt: new Date().toISOString(),
    availableSources:
      Array.from(availableSources),
    unavailableSources:
      Array.from(unavailableSources)
        .filter(
          (source) =>
            !availableSources.has(source),
        ),
  };
}

const getCachedSportsNews =
  unstable_cache(
    loadSportsNews,
    ["sports-news-feed-v5"],
    {
      revalidate: 3600,
      tags: ["sports-news"],
    },
  );

export async function getSportsNews():
  Promise<SportsNewsResponse> {
  try {
    return await getCachedSportsNews();
  }
  catch (error) {
    console.error(
      "[Actualidad Deportiva] No fue posible cargar las fuentes:",
      error,
    );

    return {
      items: [],
      updatedAt: new Date().toISOString(),
      availableSources: [],
      unavailableSources:
        Array.from(
          new Set(
            sportsNewsSources.map(
              (source) => source.name,
            ),
          ),
        ),
    };
  }
}