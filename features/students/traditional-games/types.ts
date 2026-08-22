export interface StudentTraditionalGame {
  name: string;
  location: string;
  participants: string;
  materials: string[];
  objective: string;
  preparation: string;
  steps: string[];
  rules: string[];
  safety: string[];
  inclusiveAdaptation: string;
  culturalNote: string;
}

export interface StudentTraditionalGamesResult {
  title: string;
  subtitle: string;
  studentLevel: string;
  locationLabel: string;
  introduction: string;
  games: StudentTraditionalGame[];
  keyIdeas: string[];
  reflectionQuestion: string;
}

export interface StudentTraditionalGamesApiResponse {
  success: boolean;
  result?: StudentTraditionalGamesResult;
  remaining?: number | null;
  error?: string;
}
