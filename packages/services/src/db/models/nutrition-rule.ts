import type {
  NutritionRuleKind,
  NutritionRuleStatus,
} from "../../shared/nutrition-rules";
import type { Entity, Id } from "../../types";

/**
 * One piece of Morgane's own nutrition knowledge, written once and looked up by
 * tag — her covering message's « remplir la base de donnée de REMI avec les
 * informations importantes et que l'IA puisse aller les rechercher facilement ».
 *
 * The corpus belongs to the practice, not to a patient and not to a
 * practitioner: there is no `patientId` and no `practitionerId` here. Whether
 * rules ever become per-practitioner is hers to answer, and the answer is an
 * additive nullable column rather than a reshape of this type.
 *
 * Three fields say "not in force" and they are not redundant — each answers a
 * different question:
 *
 *   status === "draft"     not trusted yet — nobody has validated this wording
 *   supersededBy !== null  replaced — a newer version carries it forward
 *   archivedAt !== null    withdrawn — no replacement is coming
 *
 * Retrieval requires all three to say "in force". Nothing is ever deleted.
 */
export type NutritionRule = Entity & {
  title: string;
  /** Markdown, stored raw — it is what a prompt will paste verbatim. */
  body: string;
  /** Free text, normalised, no taxonomy. See `shared/nutrition-rules.ts`. */
  tags: string[];
  kind: NutritionRuleKind;
  status: NutritionRuleStatus;
  /** 1 on the first wording; a revision of a validated rule increments it. */
  version: number;
  /** The operator who validated this wording, and when. Null while `draft`. */
  validatedBy: Id | null;
  validatedAt: Date | null;
  /** The revision that replaced this row. Null on the current wording. */
  supersededBy: Id | null;
  /** Withdrawn with no replacement — the counterpart to the library's archive. */
  archivedAt: Date | null;
};
