export interface StudentHistoryBlock {
  title: string;
  content: string;
}

export interface StudentHistoryPage {
  pageNumber: number;
  heading: string;
  blocks: StudentHistoryBlock[];
}

export interface StudentHistoryResult {
  title: string;
  subtitle: string;
  studentLevel: string;
  pages: StudentHistoryPage[];
  keyIdeas: string[];
  reflectionQuestion: string;
}

export interface StudentHistoryApiResponse {
  success: boolean;
  result?: StudentHistoryResult;
  remaining?: number | null;
  error?: string;
}
