export type StudentSportsFocus = "auto" | "complete" | "technique" | "tactics" | "rules";

export interface StudentSportsBlock {
  title: string;
  content: string;
  points: string[];
}

export interface StudentSportsPage {
  pageNumber: number;
  heading: string;
  blocks: StudentSportsBlock[];
}

export interface StudentSportsVisual {
  pageNumber: 1 | 2;
  imageUrl: string;
  sourcePage: string;
  alt: string;
  caption: string;
  author: string;
  license: string;
}

export interface StudentSportsResult {
  title: string;
  subtitle: string;
  studentLevel: string;
  detectedFocus: string;
  introduction: string;
  pages: StudentSportsPage[];
  glossary: Array<{ term: string; definition: string }>;
  keyIdeas: string[];
  reflectionQuestion: string;
  visuals?: StudentSportsVisual[];
}

export interface StudentSportsApiResponse {
  success: boolean;
  result?: StudentSportsResult;
  remaining?: number | null;
  error?: string;
}
