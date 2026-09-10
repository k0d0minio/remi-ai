import { Badge, Typography } from "@remi/ui/server";
import { formatDate } from "@remi/services/shared";
import type { PatientMealEntry } from "@remi/services/shared";
import { mealSlotLabels } from "@/components/patients/vocabulary";

type Props = {
  entries: readonly PatientMealEntry[];
  /** Already loaded for the journal card — re-read here, not listed again. */
  awaitingFeedback: number;
};

/** How many recent meals fit in the glance: the five most recent, newest first. */
const MAX_VISIBLE = 5;

/**
 * The working view's answer to "que s'est-il passé depuis la dernière fois ?":
 * the five most recent journal entries, read-only, plus the awaiting-feedback
 * count. The full journal — with its edits and feedback forms — stays in the
 * secondary sections.
 */
export const WorkingMeals = ({ entries, awaitingFeedback }: Props) => {
  if (entries.length === 0) {
    return (
      <Typography size="sm" tone="muted">
        Aucun repas noté pour le moment.
      </Typography>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {awaitingFeedback > 0 ? (
        <Typography size="sm" tone="muted">
          {awaitingFeedback === 1
            ? "1 repas attend un retour."
            : `${awaitingFeedback} repas attendent un retour.`}
        </Typography>
      ) : null}

      <ol className="flex flex-col gap-2">
        {entries.slice(0, MAX_VISIBLE).map((entry) => {
          const answered = entry.feedbackWrittenAt !== null;
          return (
            <li
              key={entry.id}
              className="border-border flex flex-col gap-1 border-b pb-2 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <Typography size="sm" tone="muted">
                  {formatDate(entry.eatenOn)}
                </Typography>
                <Badge variant="neutral" tone="subtle" size="sm">
                  {mealSlotLabels[entry.slot]}
                </Badge>
                {!answered ? (
                  <Badge variant="warning" tone="subtle" size="sm">
                    sans retour
                  </Badge>
                ) : null}
              </div>
              {entry.description ? (
                <Typography size="sm" className="line-clamp-2">
                  {entry.description}
                </Typography>
              ) : null}
              {entry.patientComment ? (
                <Typography size="sm" tone="muted" className="line-clamp-2">
                  {`« ${entry.patientComment} »`}
                </Typography>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
