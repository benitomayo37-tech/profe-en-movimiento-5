export const sportsNewsCategories = [
  "football",
  "ecuadorian-football",
  "mlb",
  "nba",
  "mma",
  "athletics",
  "tennis",
  "olympic",
  "multisport",
] as const;

export type SportsNewsCategory =
  (typeof sportsNewsCategories)[number];

export interface SportsNewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: SportsNewsCategory;
  publishedAt: string;
}

export interface SportsNewsResponse {
  items: SportsNewsItem[];
  updatedAt: string;
  availableSources: string[];
  unavailableSources: string[];
}