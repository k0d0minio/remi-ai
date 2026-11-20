import { BadgeCheck } from "lucide-react";
import type { Recipe } from "@remi/services/shared";
import { Badge } from "@remi/ui/server";

type Props = {
  recipe: Pick<Recipe, "verifiedAt">;
};

/**
 * The state of the mark, with an icon and the word: never colour alone. A
 * recipe with no mark reads « non vérifiée », so that the absence is said.
 */
export const VerifiedBadge = ({ recipe }: Props) =>
  recipe.verifiedAt !== null ? (
    <Badge variant="success" tone="subtle" size="sm">
      <BadgeCheck aria-hidden="true" />
      vérifiée
    </Badge>
  ) : (
    <Badge variant="neutral" tone="subtle" size="sm">
      non vérifiée
    </Badge>
  );
