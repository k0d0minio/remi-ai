import type {
  FoodDirectiveKind,
  FoodLimitLevel,
} from "../../shared/food-directives";
import type { Entity, Id } from "../../types";

/**
 * One food directive of a patient file — REM-54, story 13. The practitioner
 * writes « À favoriser », « À limiter » and « Éviction totale », and each term
 * of a field is one row.
 *
 * The term is stored as typed. REMI has no term base yet, so a row has no
 * resolved term and no resolution state: each term reads « non reconnu ».
 *
 * A total eviction (`exclude`) is safety data (story 14, D-30). It has an end
 * date or the durable status. A row that leaves the list is disabled, never
 * deleted: `disabledAt` keeps its history.
 */
export type PatientFoodDirective = Entity & {
  patientId: Id;
  kind: FoodDirectiveKind;
  /** The term as the practitioner typed it. */
  term: string;
  /** For `limit` only. Null when the practitioner chose no level. */
  limitLevel: FoodLimitLevel | null;
  /** For `exclude` only. `YYYY-MM-DD`, or null: applies from the save. */
  startsOn: string | null;
  /** For `exclude` only. `YYYY-MM-DD`, or null for a durable eviction. */
  endsOn: string | null;
  /** For `exclude` only. The durable medical exclusion. */
  durable: boolean;
  /** Rank in the field of its kind, ascending. */
  position: number;
  /** Null for a directive in force. Set when the practitioner disabled it. */
  disabledAt: Date | null;
};
