export type PhysicalPlannerContext =
  | "physical_education"
  | "sport";

export type PhysicalCapacity =
  | "strength"
  | "endurance"
  | "speed"
  | "mobility"
  | "coordination"
  | "agility"
  | "balance"
  | "combined";

export type PhysicalPlannerLevel =
  | "initiation"
  | "intermediate"
  | "advanced";

export type PhysicalPlannerIntensity =
  | "low"
  | "moderate"
  | "high-controlled";

export interface PhysicalPlannerFormData {
  context: PhysicalPlannerContext;
  activityOrSport: string;
  group: string;
  level: PhysicalPlannerLevel;
  capacity: PhysicalCapacity;
  objective: string;
  durationMinutes: number;
  participantCount: number;
  intensity: PhysicalPlannerIntensity;
  experience: string;
  materials: string;
  space: string;
  inclusionNeeds: string;
  safetyNotes: string;
  additionalInstructions: string;
}

export interface PhysicalPlannerActivity {
  name: string;
  description: string;
  series: number;
  repetitions: string;
  rounds: number;
  workSeconds: number;
  recoverySeconds: number;
  transitionSeconds: number;
  totalSeconds: number;
  organization: string;
  intensity: string;
  coachingPoints: string[];
  safety: string;
}

export interface PhysicalPlannerBlock {
  name: string;
  objective: string;
  minutes: number;
  activities: PhysicalPlannerActivity[];
}

export interface PhysicalPlannerDua {
  commitment: string[];
  representation: string[];
  actionExpression: string[];
}

export interface GeneratedPhysicalPlan {
  title: string;
  summary: string;
  objective: string;
  totalMinutes: number;
  sessionRpe: number;
  estimatedLoad: number;
  loadGuidance: string;
  organizationSummary: string;
  blocks: PhysicalPlannerBlock[];
  hydrationGuidance: string;
  safetyMeasures: string[];
  observableIndicators: string[];
  dua: PhysicalPlannerDua;
  adaptationNotes: string[];
  teacherReview: string[];
}

export interface PhysicalPlannerUsage {
  tier: "free" | "pro" | "admin";
  limit: number;
  used: number;
  remaining: number;
  historyLimit: number;
}