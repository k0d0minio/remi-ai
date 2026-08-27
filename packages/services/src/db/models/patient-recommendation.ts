import type { Entity, Id } from "../../types";
import type { RecommendationCategory } from "./recommendation";

/**
 * One recommendation Morgane encodes directly into a patient profile —
 * structured text, no parser, no consultation record behind it yet.
 *
 * Kept separate from `Recommendation`, which hangs off a consultation and
 * carries the practitioner-confirmation flow; that model belongs to the parked
 * practitioner phase. When REMI-014 models the full loop, these two shapes are
 * reconciled there. The category vocabulary is shared on purpose.
 */
export type PatientRecommendation = Entity & {
  patientId: Id;
  category: RecommendationCategory;
  title: string;
  detail: string;
};
