import type {
  PatientStatus,
  RecommendationCategory,
} from "@remi/services/shared";
import type { Intent } from "@/lib/fixtures";

/**
 * One mapping for the patient vocabulary, read by the list, the detail page and
 * both recommendation forms — the same rule as the practitioner mappings: a
 * status must read identically everywhere an operator can act on it.
 */

export const patientStatusLabels: Record<PatientStatus, string> = {
  active: "active",
  paused: "paused",
  ended: "ended",
};

export const patientStatusIntents: Record<PatientStatus, Intent> = {
  active: "success",
  paused: "warning",
  ended: "neutral",
};

export const categoryLabels: Record<RecommendationCategory, string> = {
  nutrition: "Nutrition",
  habit: "Habits",
  supplement: "Supplements",
  activity: "Activity",
  monitoring: "Monitoring",
};
