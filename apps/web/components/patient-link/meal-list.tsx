import type { MealEntry } from "@remi/services/shared";
import { formatDate } from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";

type Props = {
  meals: readonly MealEntry[];
  locale: string;
  content: Content["patientLink"];
};

/**
 * The journal, newest meal first: the date, the slot when set, what was
 * eaten, the patient's own words where Morgane transcribed them, and her
 * feedback beneath the entry where she has written it.
 *
 * Every non-archived entry renders, not only the ones she has answered — an
 * entry without feedback is a meal that happened, and hiding it would make
 * the journal read as shorter than the patient's own week.
 *
 * What does not render: the per-entry learning and the standalone
 * observations. Her memorisation is the practitioner's record.
 */
export const MealList = ({ meals, locale, content }: Props) => (
  <ul className="flex flex-col gap-3">
    {meals.map((meal) => (
      <li key={meal.id}>
        <Card>
          <CardContent className="flex flex-col gap-2">
            <Typography size="xs" tone="muted">
              {[
                formatDate(meal.eatenOn, locale),
                meal.slot ? content.mealSlots[meal.slot] : null,
              ]
                .filter((entry) => entry !== null)
                .join(" · ")}
            </Typography>
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
            {meal.feedback.trim() !== "" ? (
              <div className="flex flex-col gap-1 border-l-2 pl-3">
                <Typography size="xs" weight="medium" tone="muted">
                  {content.mealFeedbackLabel}
                </Typography>
                <Typography size="sm" className="whitespace-pre-line">
                  {meal.feedback}
                </Typography>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </li>
    ))}
  </ul>
);
