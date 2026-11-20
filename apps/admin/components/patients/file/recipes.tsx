import type { ComponentProps } from "react";
import { Typography } from "@remi/ui/server";
import { AssignRecipeForm } from "@/components/patients/assign-recipe-form";
import { RecipeAssignments } from "@/components/patients/recipe-assignments";
import { SectionFold } from "@/components/patients/section-fold";

type Entries = ComponentProps<typeof RecipeAssignments>["entries"];

type Props = {
  patientId: string;
  assigned: Entries;
  past: Entries;
  /** The active library: an archived recipe is out of circulation. */
  library: ComponentProps<typeof AssignRecipeForm>["recipes"];
  today: string;
};

/** « Recettes »: the current ones, the assign form, then the previous ones. */
export const RecipesSection = ({
  patientId,
  assigned,
  past,
  library,
  today,
}: Props) => (
  <>
    {assigned.length === 0 ? (
      <Typography size="sm" tone="muted">
        Aucune recette attribuée pour le moment.
      </Typography>
    ) : (
      <RecipeAssignments entries={assigned} today={today} />
    )}

    <AssignRecipeForm patientId={patientId} recipes={library} today={today} />

    {past.length > 0 ? (
      <SectionFold
        id="past-recipes"
        label="Recettes précédentes"
        count={past.length}
      >
        <RecipeAssignments entries={past} today={today} />
      </SectionFold>
    ) : null}
  </>
);
