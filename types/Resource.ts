/**
 * ==========================================================
 * PROFE EN MOVIMIENTO 5.0
 * Modelo principal de Recursos Educativos
 * ==========================================================
 */

export type ResourceCategory =
  | "Baloncesto"
  | "Fútbol"
  | "Voleibol"
  | "Atletismo"
  | "Gimnasia"
  | "Juegos"
  | "Evaluación"
  | "Condición Física"
  | "Expresión Corporal"
  | "Recreación"
  | "Inclusión"
  | "Gestión Docente"
  | "Otro";

export type ResourceLevel =
  | "Inicial"
  | "Preparatoria"
  | "Básica Elemental"
  | "Básica Media"
  | "Básica Superior"
  | "Bachillerato"
  | "Universidad"
  | "Docentes";

export type ResourceFormat =
  | "PDF"
  | "Word"
  | "Excel"
  | "PowerPoint"
  | "Canva"
  | "Video"
  | "Imagen"
  | "ZIP";

export type ResourceDifficulty =
  | "Básico"
  | "Intermedio"
  | "Avanzado";

export type ResourceLanguage =
  | "Español"
  | "Inglés";

export type ResourceQuality =
  | "Certificado"
  | "Recomendado"
  | "Premium"
  | "IA Ready"
  | "Editor's Choice";

export interface Resource {
  id: string;

  title: string;

  slug: string;

  summary: string;

  description: string;

  categories: ResourceCategory[];

  levels: ResourceLevel[];

  formats: ResourceFormat[];

  difficulty: ResourceDifficulty;

  language: ResourceLanguage;

  duration?: string;

  competencies?: string[];

  tags: string[];

  coverImage?: string;

  downloadUrl?: string;

  previewUrl?: string;

  quality: ResourceQuality[];

  featured: boolean;

  featuredOrder?: number;

  premium: boolean;

  verified: boolean;

  editorsChoice: boolean;

  aiReady: boolean;

  downloads: number;

  likes: number;

  rating: number;

  dua: boolean;

  nee: boolean;

  author: string;

  version: string;

  createdAt: string;

  updatedAt: string;
}