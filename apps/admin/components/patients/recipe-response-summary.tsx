import { recipeResponses, type AssignedRecipe } from "@remi/services/shared";
import { Badge, Typography } from "@remi/ui/server";
import {
  recipeResponseIntents,
  recipeResponseLabels,
} from "@/components/patients/vocabulary";

type Props = {
  /** Both lists, because an archived giving keeps the answer it was given. */
  assigned: readonly AssignedRecipe[];
  archived: readonly AssignedRecipe[];
};

/**
 * What the recipes taught, in one line: « 3 aimées · 1 pas pour cette
 * personne ».
 *
 * It sits under « À retenir » because that is the card Morgane re-reads before
 * a consultation, and the § 7 answers are exactly what it is for — the point
 * of asking the patient is that the next propositions read the reply, and she
 * should not have to open four assignments to know what it said.
 *
 * Archived givings count. A recipe that rotated out was still cooked, and
 * dropping it would make the tally quietly reset every week — the opposite of
 * « ce que les semaines vous apprennent ».
 *
 * An answer nobody gave renders as nothing rather than as a zero: four
 * counters at zero on a patient who has answered once reads as four facts,
 * and there is one.
 */
export const RecipeResponseSummary = ({ assigned, archived }: Props) => {
  const answers = [...assigned, ...archived]
    .map((entry) => entry.assignment.patientResponse)
    .filter((response) => response !== null);

  if (answers.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <Typography as="h4" size="sm" weight="medium">
        Avis sur les recettes
      </Typography>
      <div className="flex flex-wrap items-center gap-2">
        {recipeResponses.map((response) => {
          const count = answers.filter((answer) => answer === response).length;
          if (count === 0) {
            return null;
          }
          return (
            <Badge
              key={response}
              variant={recipeResponseIntents[response]}
              tone="subtle"
              size="sm"
            >
              {count} {recipeResponseLabels[response]}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
