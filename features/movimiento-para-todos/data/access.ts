import type { MovementAudience } from "../types";

export type MovementAccessLevel = "free" | "pro";

export const FREE_EXERCISE_IDS: Record<MovementAudience, string[]> = {
  "older-adults": [
    "older-adults-chair-stand",
    "older-adults-march-in-place",
    "older-adults-heel-raise",
  ],

  "chronic-diseases": [
    "chronic-diseases-comfortable-walk",
    "chronic-diseases-chair-stand",
    "chronic-diseases-wall-push",
  ],

  prenatal: [
    "prenatal-comfortable-walk",
    "prenatal-chair-stand",
    "prenatal-ankle-foot-mobility",
  ],

  "reduced-mobility": [
    "reduced-mobility-ankle-pumps",
    "reduced-mobility-heel-slides",
    "reduced-mobility-quad-activation",
  ],
};

export const FREE_CAREGIVER_IDS = [
  "caregiver-prepare-environment",
  "caregiver-communicate-before-moving",
  "caregiver-repositioning",
];

export const PRO_CAREGIVER_IDS = [
  "caregiver-transfer-planning",
  "caregiver-after-fall",
  "caregiver-assistive-devices",
];

export const isFreeExercise = (id: string) =>
  Object.values(FREE_EXERCISE_IDS).some((ids) => ids.includes(id));

export const isFreeCaregiverGuidance = (id: string) =>
  FREE_CAREGIVER_IDS.includes(id);

export const isProCaregiverGuidance = (id: string) =>
  PRO_CAREGIVER_IDS.includes(id);
