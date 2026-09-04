import type { AssignedRecipe } from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";

type Props = {
  recipes: readonly AssignedRecipe[];
  content: Content["patientLink"];
};

/**
 * The recipes she has given this patient, newest first: the title, the body
 * as she wrote it, and her per-patient « pourquoi pour toi » note.
 *
 * The body renders as prose with its line breaks preserved rather than parsed
 * into ingredients and steps — she writes it the way she writes it, and
 * inventing structure would be putting words in her mouth. The library's tags
 * are her filing vocabulary in the console and do not render here.
 */
export const RecipeList = ({ recipes, content }: Props) => (
  <ul className="flex flex-col gap-3">
    {recipes.map(({ assignment, recipe }) => (
      <li key={assignment.id}>
        <Card>
          <CardContent className="flex flex-col gap-2">
            <Typography as="h3" size="sm" weight="medium">
              {recipe.title}
            </Typography>
            {recipe.body.trim() !== "" ? (
              <Typography size="sm" className="whitespace-pre-line">
                {recipe.body}
              </Typography>
            ) : null}
            {assignment.note.trim() !== "" ? (
              <Typography
                size="sm"
                tone="muted"
                className="whitespace-pre-line"
              >
                {content.recipeNoteLabel} : {assignment.note}
              </Typography>
            ) : null}
          </CardContent>
        </Card>
      </li>
    ))}
  </ul>
);
