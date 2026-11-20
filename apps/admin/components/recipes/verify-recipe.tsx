"use client";

import { BadgeCheck, Undo2 } from "lucide-react";
import { useActionState, useState } from "react";
import { formatDate, type Recipe } from "@remi/services/shared";
import { Button, Checkbox } from "@remi/ui";
import { Typography } from "@remi/ui/server";
import {
  setRecipeVerifiedAction,
  type VerifyRecipeState,
} from "@/lib/recipes/actions";

const initial: VerifyRecipeState = { error: null };

type Props = {
  recipe: Recipe;
};

/**
 * The mark « vérifiée » of a recipe (D-34): REMI generates a patient's recipes
 * only from a verified recipe. The mark is set by this control and by nothing
 * else. The practitioner ticks that she read the recipe again, then presses
 * the button. The same control removes the mark.
 */
export const VerifyRecipe = ({ recipe }: Props) => {
  const [state, action, pending] = useActionState(
    setRecipeVerifiedAction,
    initial,
  );
  const [reviewed, setReviewed] = useState(false);
  const verified = recipe.verifiedAt !== null;

  if (recipe.content === null) {
    return (
      <Typography size="sm" tone="muted">
        Cette recette est dans l&apos;ancienne forme en texte libre. Ajoutez ses
        ingrédients et ses étapes ligne par ligne, puis enregistrez : vous
        pourrez alors la vérifier.
      </Typography>
    );
  }

  if (recipe.archivedAt !== null && !verified) {
    return (
      <Typography size="sm" tone="muted">
        Une recette archivée ne peut pas être vérifiée. Remettez-la d&apos;abord
        dans la bibliothèque.
      </Typography>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={recipe.id} />
      <input type="hidden" name="verified" value={verified ? "false" : "true"} />

      {verified && recipe.verifiedAt ? (
        <Typography size="sm">
          Vérifiée le {formatDate(recipe.verifiedAt)}
          {recipe.verifiedByName ? ` par ${recipe.verifiedByName}` : ""}. REMI
          peut partir de cette recette.
        </Typography>
      ) : (
        <>
          <Typography size="sm" tone="muted">
            La vérification porte sur la version enregistrée. Enregistrez
            d&apos;abord vos modifications.
          </Typography>
          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <Checkbox
              name="reviewed"
              value="true"
              checked={reviewed}
              onCheckedChange={(checked) => setReviewed(checked === true)}
            />
            <Typography size="sm">
              J&apos;ai relu les ingrédients, les quantités et les étapes.
            </Typography>
          </label>
        </>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {verified ? (
          <Button type="submit" size="sm" variant="ghost" disabled={pending}>
            <Undo2 aria-hidden="true" />
            Retirer la marque « vérifiée »
          </Button>
        ) : (
          <Button type="submit" size="sm" disabled={pending || !reviewed}>
            <BadgeCheck aria-hidden="true" />
            Marquer comme vérifiée
          </Button>
        )}
        {state.error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {state.error}
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
