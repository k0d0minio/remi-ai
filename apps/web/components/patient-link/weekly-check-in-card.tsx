import type { PatientGoal, WeeklyCheckInState } from "@remi/services/shared";
import { formatDate } from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import { WeeklyCheckInForm } from "@/components/patient-link/weekly-check-in-form";
import type { Content } from "@/lib/content/types";

type Props = {
  goals: readonly PatientGoal[];
  state: WeeklyCheckInState;
  locale: string;
  /** The credential the form posts back with — never a patient id. */
  token: string;
  content: Content["patientLink"];
};

/**
 * The weekly « comment ça s'est passé ? » inside « Aujourd'hui » — her
 * 14 Sept § 1 (D-30). Whether it asks is computed at render from the date of
 * the patient's last answer; nothing schedules it (D-9).
 *
 * Once answered it shrinks to the date of the answer and the date the next
 * question opens, so the patient knows it was received and when to come back.
 * With no active goal there is nothing to ask, and nothing renders.
 */
export const WeeklyCheckInCard = ({
  goals,
  state,
  locale,
  token,
  content,
}: Props) => {
  if (goals.length === 0) {
    return null;
  }
  const copy = content.weeklyCheckIn;

  if (!state.due) {
    return (
      <Card variant="neutral">
        <CardContent className="flex flex-col gap-1">
          <Typography as="h3" size="sm" weight="semibold">
            {copy.title}
          </Typography>
          {state.lastOn ? (
            <Typography size="sm">
              {copy.answeredOn} {formatDate(state.lastOn, locale)}.
            </Typography>
          ) : null}
          {state.nextOn ? (
            <Typography size="sm" tone="muted">
              {copy.nextOn} {formatDate(state.nextOn, locale)}.
            </Typography>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="info">
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Typography as="h3" size="sm" weight="semibold">
            {copy.title}
          </Typography>
          <Typography size="sm" tone="muted">
            {copy.lead}
          </Typography>
        </div>
        <WeeklyCheckInForm
          goals={goals}
          token={token}
          locale={locale}
          content={content}
        />
      </CardContent>
    </Card>
  );
};
