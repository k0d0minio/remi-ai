import type { MealEntry } from "@remi/services/shared";
import { formatDate } from "@remi/services/shared";
import { Badge, Card, CardContent, Typography } from "@remi/ui/server";
import { MealMarkEaten } from "@/components/patient-link/meal-mark-eaten";
import type { Content } from "@/lib/content/types";

type Props = {
  meals: readonly MealEntry[];
  locale: string;
  /** The credential the flip posts back with — never a patient id. */
  token: string;
  content: Content["patientLink"];
};

/**
 * The journal, newest meal first: the date, whether the meal is planned or
 * eaten, the slot when set, what was eaten, the patient's own words where
 * Morgane transcribed them, and the response beneath.
 *
 * Every non-archived entry renders, not only the ones she has answered — an
 * entry without feedback is a meal that happened, and hiding it would make
 * the journal read as shorter than the patient's own week. Entries she
 * transcribed sit in the same list as the patient's own, unattributed: it is
 * one history of one person's meals, and marking which of them she typed up
 * would answer a question nobody reading their own journal is asking.
 *
 * The response area is always there, answered or not (decision #6): the
 * instant suggestion lands in this exact slot once `ai-assist` exists, so a
 * patient who starts in November does not watch the page change shape under
 * them in December.
 *
 * What does not render: the per-entry learning and the standalone
 * observations. Her memorisation is the practitioner's record.
 */
export const MealList = ({ meals, locale, token, content }: Props) => (
  <ul className="flex flex-col gap-3">
    {meals.map((meal) => (
      <li key={meal.id}>
        <Card>
          <CardContent className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={meal.intent === "planned" ? "info" : "neutral"}
                tone="subtle"
                size="sm"
              >
                {content.mealIntentLabels[meal.intent]}
              </Badge>
              <Typography size="xs" tone="muted">
                {[
                  formatDate(meal.eatenOn, locale),
                  meal.slot ? content.mealSlots[meal.slot] : null,
                ]
                  .filter((entry) => entry !== null)
                  .join(" · ")}
              </Typography>
            </div>
            <Typography
              as="h3"
              size="sm"
              weight="medium"
              className="whitespace-pre-line"
            >
              {meal.description}
            </Typography>
            {meal.patientComment.trim() !== "" ? (
              <Typography
                size="sm"
                tone="muted"
                className="whitespace-pre-line"
              >
                {content.mealCommentLabel} : {meal.patientComment}
              </Typography>
            ) : null}
            <div className="flex flex-col gap-1 border-l-2 pl-3">
              <Typography size="xs" weight="medium" tone="muted">
                {content.mealFeedbackLabel}
              </Typography>
              {meal.feedback.trim() !== "" ? (
                <Typography size="sm" className="whitespace-pre-line">
                  {meal.feedback}
                </Typography>
              ) : (
                <Typography size="sm" tone="muted">
                  {content.mealAwaitingResponse}
                </Typography>
              )}
            </div>
            {meal.intent === "planned" ? (
              <MealMarkEaten
                mealId={meal.id}
                token={token}
                locale={locale}
                content={content}
              />
            ) : null}
          </CardContent>
        </Card>
      </li>
    ))}
  </ul>
);
