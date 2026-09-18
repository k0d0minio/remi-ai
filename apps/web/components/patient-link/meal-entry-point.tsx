import { Card, CardContent, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";

type Props = { content: Content["patientLink"] };

/**
 * The way in to the meal loop — « Je vais manger » / « J'ai mangé », her § 6's
 * fifth item and the reason the home exists at all.
 *
 * **The slot, not the loop.** `meal-entry` wires these two to the journal; here
 * they carry their final wording in their final place and do nothing, which is
 * why the card says so rather than leaving a patient tapping a dead control.
 * They are not buttons yet for the same reason: a `<button>` that ignores a tap
 * is worse than a label, and making them real is that run's first commit —
 * the geometry is already right, including the 44px targets.
 *
 * It renders for every patient, empty record included: it is the invitation,
 * not a view of data.
 */
export const MealEntryPoint = ({ content }: Props) => (
  <Card variant="info">
    <CardContent className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Typography as="h2" size="lg" weight="semibold">
          {content.mealEntry.title}
        </Typography>
        <Typography size="sm" tone="muted">
          {content.mealEntry.lead}
        </Typography>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {[content.mealEntry.willEat, content.mealEntry.haveEaten].map(
          (label) => (
            <div
              key={label}
              className="border-border bg-card flex min-h-11 flex-1 items-center justify-center rounded-md border px-4 py-2"
            >
              <Typography size="sm" weight="medium">
                {label}
              </Typography>
            </div>
          ),
        )}
      </div>

      <Typography size="xs" tone="muted">
        {content.mealEntry.comingSoon}
      </Typography>
    </CardContent>
  </Card>
);
