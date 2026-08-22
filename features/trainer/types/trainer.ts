export type TrainerModuleId =
  | "training-session"
  | "microcycle"
  | "mesocycle"
  | "macrocycle";

export type TrainingLevel =
  | "initiation"
  | "intermediate"
  | "advanced";

export type TrainingIntensity =
  | "low"
  | "moderate"
  | "high-controlled";

export type TrainingFocus =
  | "technical"
  | "tactical"
  | "physical"
  | "coordination"
  | "recovery"
  | "combined";

export type TrainingDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type CompetitionDay = TrainingDay | "none";

export type MicrocyclePhase =
  | "general-preparation"
  | "specific-preparation"
  | "pre-competition"
  | "competition"
  | "recovery";

export type MacrocyclePeriodType =
  | "preparatory"
  | "competitive"
  | "transition";

export interface TrainingSessionFormData {
  sport: string;
  category: string;
  level: TrainingLevel;
  focus: TrainingFocus;
  objective: string;
  durationMinutes: number;
  athleteCount: number;
  intensity: TrainingIntensity;
  materials: string;
  space: string;
  competitionContext: string;
  additionalInstructions: string;
}

export interface MicrocycleFormData {
  sport: string;
  category: string;
  level: TrainingLevel;
  phase: MicrocyclePhase;
  weeklyObjective: string;
  trainingDays: TrainingDay[];
  sessionDurationMinutes: number;
  athleteCount: number;
  competitionDay: CompetitionDay;
  materials: string;
  space: string;
  additionalInstructions: string;
}

export interface MesocycleFormData {
  sport: string;
  category: string;
  level: TrainingLevel;
  phase: MicrocyclePhase;
  mainObjective: string;
  weekCount: number;
  sessionsPerWeek: number;
  sessionDurationMinutes: number;
  athleteCount: number;
  competitionWeek: number | null;
  materials: string;
  space: string;
  additionalInstructions: string;
}

export interface MacrocycleFormData {
  sport: string;
  category: string;
  level: TrainingLevel;
  seasonObjective: string;
  preparatoryWeeks: number;
  competitiveWeeks: number;
  transitionWeeks: number;
  sessionsPerWeek: number;
  sessionDurationMinutes: number;
  athleteCount: number;
  mainCompetitionWeek: number | null;
  materials: string;
  space: string;
  additionalInstructions: string;
}

export interface GeneratedTrainingSegment {
  name: string;
  seconds: number;
  description: string;
}

export interface GeneratedTrainingActivity {
  name: string;
  minutes: number;
  description: string;
  segments: GeneratedTrainingSegment[];
}

export interface GeneratedTrainingBlock {
  name: string;
  objective: string;
  minutes: number;
  intensity: string;
  organization: string;
  activities: GeneratedTrainingActivity[];
  coachingPoints: string[];
  recovery: string;
  safety: string;
}

export interface GeneratedTrainingSession {
  title: string;
  summary: string;
  objective: string;
  totalMinutes: number;
  loadGuidance: string;
  blocks: GeneratedTrainingBlock[];
  evaluationCriteria: string[];
  safetyMeasures: string[];
  adaptationNotes: string[];
}

export interface GeneratedMicrocycleSegment {
  name: string;
  minutes: number;
  objective: string;
  content: string;
}

export interface GeneratedMicrocycleDay {
  day: TrainingDay;
  sessionNumber: number;
  title: string;
  objective: string;
  focus: TrainingFocus;
  intensity: TrainingIntensity;
  minutes: number;
  loadLevel: number;
  organization: string;
  segments: GeneratedMicrocycleSegment[];
  coachingPoints: string[];
  recovery: string;
  monitoring: string;
  safety: string;
}

export interface GeneratedMicrocycle {
  title: string;
  summary: string;
  weeklyObjective: string;
  phaseGuidance: string;
  totalSessions: number;
  totalMinutes: number;
  days: GeneratedMicrocycleDay[];
  weeklyLoadSummary: string;
  evaluationCriteria: string[];
  safetyMeasures: string[];
  adaptationNotes: string[];
}

export interface GeneratedMesocycleWeek {
  weekNumber: number;
  title: string;
  objective: string;
  focus: TrainingFocus;
  intensity: TrainingIntensity;
  loadLevel: number;
  sessionCount: number;
  sessionDurationMinutes: number;
  totalMinutes: number;
  organization: string;
  keyContents: string[];
  loadGuidance: string;
  recovery: string;
  monitoring: string;
  safety: string;
}

export interface GeneratedMesocycle {
  title: string;
  summary: string;
  mainObjective: string;
  phaseGuidance: string;
  totalWeeks: number;
  totalSessions: number;
  totalMinutes: number;
  weeks: GeneratedMesocycleWeek[];
  overallLoadSummary: string;
  evaluationCriteria: string[];
  safetyMeasures: string[];
  adaptationNotes: string[];
}

export interface GeneratedMacrocyclePeriod {
  periodNumber: number;
  type: MacrocyclePeriodType;
  title: string;
  weekStart: number;
  weekEnd: number;
  objective: string;
  focus: TrainingFocus;
  intensity: TrainingIntensity;
  loadLevel: number;
  sessionCount: number;
  totalMinutes: number;
  organization: string;
  keyContents: string[];
  progression: string;
  recovery: string;
  monitoring: string;
  safety: string;
}

export interface GeneratedMacrocycle {
  title: string;
  summary: string;
  seasonObjective: string;
  periodizationRationale: string;
  totalWeeks: number;
  totalSessions: number;
  totalMinutes: number;
  periods: GeneratedMacrocyclePeriod[];
  annualLoadSummary: string;
  mainCompetitionGuidance: string;
  evaluationCriteria: string[];
  safetyMeasures: string[];
  adaptationNotes: string[];
}
