import NextLink from "next/link";
import { formatDate, type Recipe } from "@remi/services/shared";
import { Badge, Typography } from "@remi/ui/server";
import { ArchiveRecipe } from "@/components/recipes/archive-recipe";

type Props = {
  recipes: readonly Recipe[];
};

/**
 * The library as rows rather than a table: they survive a phone screen, which
 * is where Morgane opens the console between consultations. Same call as the
 * patient roster next door.
 */
export const RecipeRows = ({ recipes }: Props) => (
  <ul className="flex flex-col gap-3">
    {recipes.map((recipe) => (
      <li
        key={recipe.id}
        className="border-border flex flex-col gap-2 rounded-lg border p-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <NextLink
            href={`/recipes/${recipe.id}`}
            className="focus-visible:ring-ring/40 rounded-sm focus-visible:outline-none focus-visible:ring-[3px]"
          >
            <Typography as="h3" size="sm" weight="medium">
              {recipe.title}
            </Typography>
          </NextLink>
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="neutral" tone="subtle" size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        <Typography size="sm" tone="muted" className="line-clamp-2">
          {recipe.body}
        </Typography>

        <div className="flex flex-wrap items-center gap-3">
          <Typography size="xs" tone="muted">
            modifiée le {formatDate(recipe.updatedAt)}
          </Typography>
          <ArchiveRecipe recipe={recipe} />
        </div>
      </li>
    ))}
  </ul>
);
