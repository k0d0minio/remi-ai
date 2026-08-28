import type {
  PatientSex,
  PatientStatus,
  RecommendationCategory,
} from "@remi/services/shared";
import type { Intent } from "@remi/ui/server";

/**
 * One mapping for the patient vocabulary, read by the roster, the detail page
 * and both recommendation forms: a status must read identically everywhere an
 * operator can act on it.
 *
 * French, because the console's operators are Morgane and Arnaud. Identifiers
 * and comments stay English per `CONVENTIONS.md` — it is the rendered copy that
 * follows the reader, not the code.
 */

export const patientStatusLabels: Record<PatientStatus, string> = {
  active: "en cours",
  paused: "en pause",
  ended: "terminé",
};

export const patientStatusIntents: Record<PatientStatus, Intent> = {
  active: "success",
  paused: "warning",
  ended: "neutral",
};

export const patientSexLabels: Record<PatientSex, string> = {
  female: "femme",
  male: "homme",
  other: "autre",
  unspecified: "non précisé",
};

export const categoryLabels: Record<RecommendationCategory, string> = {
  nutrition: "Nutrition",
  habit: "Habitudes",
  supplement: "Compléments",
  activity: "Activité",
  monitoring: "Suivi",
};
