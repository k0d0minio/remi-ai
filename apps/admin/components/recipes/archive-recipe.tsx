import { ArchiveRestore, ArchiveX } from "lucide-react";
import type { Recipe } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { archiveRecipeAction } from "@/lib/recipes/actions";

type Props = {
  recipe: Recipe;
};

/**
 * The library's only way out, and there is no second one: a recipe patients
 * hold cannot be deleted, so archiving takes it out of the library and out of
 * the assignment picker while every assignment already made stays exactly as it
 * was. The database says the same thing — assignments reference a recipe
 * `on delete restrict`.
 */
export const ArchiveRecipe = ({ recipe }: Props) => {
  const archived = recipe.archivedAt !== null;

  return (
    <form action={archiveRecipeAction}>
      <input type="hidden" name="id" value={recipe.id} />
      <input
        type="hidden"
        name="archived"
        value={archived ? "false" : "true"}
      />
      <Button type="submit" size="sm" variant="ghost">
        {archived ? (
          <ArchiveRestore aria-hidden="true" />
        ) : (
          <ArchiveX aria-hidden="true" />
        )}
        {archived ? "Remettre dans la bibliothèque" : "Archiver"}
      </Button>
    </form>
  );
};
