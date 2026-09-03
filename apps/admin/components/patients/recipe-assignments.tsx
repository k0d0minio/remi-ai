import type { AssignedRecipe } from "@remi/services/shared";
import { RecipeAssignmentItem } from "@/components/patients/recipe-assignment-item";

type Props = {
  /** Already ordered by the service — newest giving first. */
  entries: readonly AssignedRecipe[];
};

/**
 * What this person holds, or held. Flat and dated: § I's weekly rhythm is
 * recorded as the dates on these rows, so no week grouping is derived here and
 * none is stored.
 */
export const RecipeAssignments = ({ entries }: Props) => (
  <ul className="flex flex-col gap-3">
    {entries.map((entry) => (
      <RecipeAssignmentItem key={entry.assignment.id} entry={entry} />
    ))}
  </ul>
);
