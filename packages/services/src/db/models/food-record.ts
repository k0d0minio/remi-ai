import type {
  DishRole,
  FoodRecordSource,
  FoodRecordStatus,
} from "../../shared/food-record";
import type { FoodUnit } from "../../shared/kitchen-units";
import type { Entity, Id } from "../../types";

/**
 * The record of one CIQUAL food — REM-189 and REM-190.
 *
 * Reference data, not patient data. The key is CIQUAL's own code
 * (`Food["code"]`): there is no second food table.
 *
 * The record has two parts, and a person confirms each one apart:
 * - the record itself: « cuisinable », the allergen tags, the role in a dish
 * - the kitchen units: the density and the food's own units with a weight
 *
 * A part that is not `confirmed` is an aid to entry. The compatibility gate
 * and the generation read a confirmed part only (D-30).
 */
export type FoodRecord = Entity & {
  /** CIQUAL's `alim_code`, matching `Food["code"]`. */
  foodCode: string;
  /** True when REMI can cook with the food. */
  cookable: boolean;
  /** The tags that the food contains, in the vocabulary of the gate. */
  containsTags: readonly string[];
  /** The tags that the food can contain: traces, a frequent variant. */
  mayContainTags: readonly string[];
  role: DishRole | null;
  status: FoodRecordStatus;
  source: FoodRecordSource;
  /** The model id of the proposal, or `""` for a record that a person wrote. */
  proposedModel: string;
  /** The id of the gate's lexicon row that names this food, or null. */
  lexiconId: string | null;
  confirmedAt: Date | null;
  /** The account that confirmed. No foreign key: the fact stays. */
  confirmedById: Id | null;
  /** The name of that account at the time, or `""`. */
  confirmedByName: string;
  /** Grams for one millilitre, for a liquid or a powder. */
  densityGPerMl: number | null;
  units: readonly FoodUnit[];
  /** Null when no unit and no density were entered or proposed. */
  unitsStatus: FoodRecordStatus | null;
  unitsConfirmedAt: Date | null;
  unitsConfirmedById: Id | null;
  unitsConfirmedByName: string;
};
