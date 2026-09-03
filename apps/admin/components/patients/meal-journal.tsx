import type { MealEntry } from "@remi/services/shared";
import { MealEntryItem } from "@/components/patients/meal-entry-item";

type Props = {
  /** Already ordered by the service — newest meal first, not newest typed. */
  entries: readonly MealEntry[];
};

/**
 * The journal, flat and reverse-chronological.
 *
 * No grouping by week or by slot: the week is what she scrolls, and a header
 * every seven rows would push the meal she is looking for further down a phone
 * screen. Whether she wants weeks is hers to say once she has used this.
 */
export const MealJournal = ({ entries }: Props) => (
  <ul className="flex flex-col gap-3">
    {entries.map((entry) => (
      <MealEntryItem key={entry.id} entry={entry} />
    ))}
  </ul>
);
