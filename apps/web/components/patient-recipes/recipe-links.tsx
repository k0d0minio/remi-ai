import NextLink from "next/link";
import {
  formatRecipeMinutes,
  localePath,
  type Locale,
  type PatientRecipeSummary,
} from "@remi/services/shared";
import { Badge, Card, Typography } from "@remi/ui/server";
import { fill } from "@/lib/content/fill";
import type { Content } from "@/lib/content/types";
import { recipePath } from "@/lib/patient-auth/paths";

type Props = {
  recipes: readonly PatientRecipeSummary[];
  locale: Locale;
  content: Content["patientRecipeCard"];
};

/**
 * The recipes that the patient can open, one link for each. A simple list:
 * `recipe-space/patient-recipes-today` (REM-92) replaces it with the recipes
 * of the day.
 */
export const RecipeLinks = ({ recipes, locale, content }: Props) => (
  <ul className="flex flex-col gap-3">
    {recipes.map((recipe) => (
      <li key={recipe.id}>
        <NextLink
          href={localePath(locale, recipePath(recipe.id))}
          className="focus-visible:ring-ring block rounded-2xl outline-none focus-visible:ring-[3px]"
        >
          <Card interactive className="gap-2 px-4">
            <Badge
              variant={recipe.source === "remi" ? "info" : "neutral"}
              tone="subtle"
              className="self-start"
            >
              {recipe.source === "remi"
                ? content.proposedByRemi
                : content.chosenByPractitioner}
            </Badge>
            <Typography as="h2" weight="semibold" className="break-words">
              {recipe.title}
            </Typography>
            {recipe.description !== "" ? (
              <Typography size="sm" tone="muted" className="break-words">
                {recipe.description}
              </Typography>
            ) : null}
            {recipe.totalMinutes !== null ? (
              <Typography size="sm" tone="muted">
                {fill(content.list.totalTime, {
                  time: formatRecipeMinutes(recipe.totalMinutes),
                })}
              </Typography>
            ) : null}
          </Card>
        </NextLink>
      </li>
    ))}
  </ul>
);
