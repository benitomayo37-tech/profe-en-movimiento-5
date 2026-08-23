export type MovementAudience =
  | "older-adults"
  | "chronic-diseases"
  | "prenatal"
  | "reduced-mobility";

export type MovementContentType =
  | "exercise"
  | "maneuver"
  | "caregiver"
  | "safety"
  | "warning"
  | "assistive-device";

export type MovementGoal =
  | "mobility"
  | "strength"
  | "balance"
  | "endurance"
  | "coordination"
  | "flexibility"
  | "functional-autonomy"
  | "fall-prevention"
  | "gentle-activity";

export type MovementDifficulty = "basic" | "intermediate" | "advanced";

export interface MovementCategory {
  id: MovementAudience;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  color: string;
}

export interface MovementExercise {
  id: string;
  title: string;
  audience: MovementAudience;
  contentType: "exercise";
  objective: string;
  goals: MovementGoal[];
  difficulty: MovementDifficulty;
  materials?: string[];
  instructions: string[];
  benefits: string[];
  adaptations?: string[];
  safety: string[];
  stopIf: string[];
  contraindications?: string[];
}

export interface MovementManeuver {
  id: string;
  title: string;
  audience: "reduced-mobility";
  contentType: "maneuver" | "caregiver";
  objective: string;
  preparation: string[];
  steps: string[];
  personPosition?: string;
  caregiverPosition?: string;
  safety: string[];
  doNotAttemptIf: string[];
  assistiveDevices?: string[];
}

export interface MovementSafetyItem {
  id: string;
  title: string;
  contentType: "safety" | "warning";
  description: string;
  recommendations: string[];
}

export interface MovementAssistiveDevice {
  id: string;
  title: string;
  description: string;
  purpose: string;
  considerations: string[];
}

export interface MovementFilter {
  audience?: MovementAudience;
  contentType?: MovementContentType;
  goal?: MovementGoal;
  difficulty?: MovementDifficulty;
}
