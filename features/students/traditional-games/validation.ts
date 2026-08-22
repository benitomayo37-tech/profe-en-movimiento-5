import type {
  StudentTraditionalGame,
  StudentTraditionalGamesResult,
} from "@/features/students/traditional-games/types";

const MAX_TOTAL_CHARACTERS = 12_000;

function isText(value: unknown, minimum = 1, maximum = 500): value is string {
  return typeof value === "string" && value.trim().length >= minimum && value.trim().length <= maximum;
}

function isTextList(value: unknown, minimum: number, maximum: number, itemMaximum: number): value is string[] {
  return Array.isArray(value)
    && value.length >= minimum
    && value.length <= maximum
    && value.every((item) => isText(item, 3, itemMaximum));
}

function isTraditionalGame(value: unknown): value is StudentTraditionalGame {
  if (typeof value !== "object" || value === null) return false;
  const game = value as Record<string, unknown>;
  return isText(game.name, 2, 90)
    && isText(game.location, 2, 120)
    && isText(game.participants, 3, 100)
    && isTextList(game.materials, 1, 6, 90)
    && isText(game.objective, 15, 260)
    && isText(game.preparation, 20, 360)
    && isTextList(game.steps, 3, 6, 260)
    && isTextList(game.rules, 2, 5, 220)
    && isTextList(game.safety, 2, 4, 220)
    && isText(game.inclusiveAdaptation, 20, 340)
    && isText(game.culturalNote, 25, 420);
}

export function isStudentTraditionalGamesResult(value: unknown): value is StudentTraditionalGamesResult {
  if (typeof value !== "object" || value === null) return false;
  const result = value as Record<string, unknown>;
  if (
    !isText(result.title, 5, 140)
    || !isText(result.subtitle, 5, 180)
    || !isText(result.studentLevel, 2, 100)
    || !isText(result.locationLabel, 2, 120)
    || !isText(result.introduction, 80, 650)
    || !Array.isArray(result.games)
    || result.games.length < 4
    || result.games.length > 5
    || !result.games.every(isTraditionalGame)
    || !isTextList(result.keyIdeas, 3, 5, 180)
    || !isText(result.reflectionQuestion, 15, 240)
  ) return false;

  return JSON.stringify(result).length <= MAX_TOTAL_CHARACTERS;
}
