import type {
  AssignedRecipe,
  Locale,
  PatientDocument,
} from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import { DocumentList } from "@/components/patient-link/document-list";
import type { Content } from "@/lib/content/types";

type Props = {
  recipes: readonly AssignedRecipe[];
  content: Content["patientLink"];
  /** Titles only, for the home's preview — the segment carries the rest. */
  compact?: boolean;
  /**
   * The documents attached to these recipes, shown under the one each hangs
   * from — the segment passes them, the home's preview does not.
   */
  attached?: {
    documents: readonly PatientDocument[];
    locale: Locale;
    token: string;
  };
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
export const RecipeList = ({ recipes, content, compact, attached }: Props) => (
  <ul className="flex flex-col gap-3">
    {recipes.map(({ assignment, recipe }) => {
      const documents =
        attached?.documents.filter(
          (document) => document.recipeAssignmentId === assignment.id,
        ) ?? [];
      return (
        <li key={assignment.id}>
          <Card>
            <CardContent className="flex flex-col gap-2">
              <Typography as="h3" size="sm" weight="medium">
                {recipe.title}
              </Typography>
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
              {attached && documents.length > 0 ? (
                <div className="flex flex-col gap-1">
                  <Typography size="xs" tone="muted" weight="medium">
                    {content.attachedDocumentsLabel}
                  </Typography>
                  <DocumentList
                    documents={documents}
                    locale={attached.locale}
                    token={attached.token}
                    content={content}
                    inline
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </li>
      );
    })}
  </ul>
);
