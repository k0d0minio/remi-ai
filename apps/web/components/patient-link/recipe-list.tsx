import type { AssignedRecipe } from "@remi/services/shared";
import { Badge, Card, CardContent, Typography } from "@remi/ui/server";
import { RecipeResponseButtons } from "@/components/patient-link/recipe-response";
import type { Content } from "@/lib/content/types";

type Props = {
  recipes: readonly AssignedRecipe[];
  content: Content["patientLink"];
  /** Titles only, for the home's preview — the segment carries the rest. */
  compact?: boolean;
  /**
   * Present on the list of recipes the patient currently holds: the four
   * answers, which need the token they are written with. Absent on the
   * favourites shelf, where a giving that rotated out is a keepsake rather
   * than something to answer again.
   */
  answers?: { token: string; locale: string };
  /** On the shelf: say which favourites are no longer being suggested. */
  markArchived?: boolean;
  /**
   * The heading level of a recipe's title. `h3` when the list is the whole of
   * its section; `h4` under the shelf, which carries an `h3` of its own — a
   * card title that outranks the heading above it is a broken outline for
   * anyone reading the page by headings.
   */
  titleAs?: "h3" | "h4";
};

/**
 * The recipes she has given this patient, newest first: the title, the body
 * as she wrote it, and her per-patient « pourquoi pour toi » note.
 *
 * The body renders as prose with its line breaks preserved rather than parsed
 * into ingredients and steps — she writes it the way she writes it, and
 * inventing structure would be putting words in her mouth. The library's tags
 * are her filing vocabulary in the console and do not render here.
 *
 * `compact` is the same list with the bodies withheld: on the home a recipe is
 * a title to recognise and tap, and four recipes' worth of method would bury
 * everything under it.
 */
export const RecipeList = ({
  recipes,
  content,
  compact,
  answers,
  markArchived,
  titleAs = "h3",
}: Props) => (
  <ul className="flex flex-col gap-3">
    {recipes.map(({ assignment, recipe }) => (
      <li key={assignment.id}>
        <Card>
          <CardContent className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Typography as={titleAs} size="sm" weight="medium">
                {recipe.title}
              </Typography>
              {markArchived && assignment.archivedAt !== null ? (
                <Badge variant="neutral" tone="subtle" size="sm">
                  {content.recipeFeedback.archivedLabel}
                </Badge>
              ) : null}
            </div>
            {!compact && recipe.body.trim() !== "" ? (
              <Typography size="sm" className="whitespace-pre-line">
                {recipe.body}
              </Typography>
            ) : null}
            {!compact && assignment.note.trim() !== "" ? (
              <Typography
                size="sm"
                tone="muted"
                className="whitespace-pre-line"
              >
                {content.recipeNoteLabel} : {assignment.note}
              </Typography>
            ) : null}
            {!compact && answers ? (
              <RecipeResponseButtons
                assignmentId={assignment.id}
                answer={assignment.patientResponse}
                token={answers.token}
                locale={answers.locale}
                content={content.recipeFeedback}
              />
            ) : null}
          </CardContent>
        </Card>
      </li>
    ))}
  </ul>
);
