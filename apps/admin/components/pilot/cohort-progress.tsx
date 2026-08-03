import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Typography,
} from "@remi/ui/server";
import type { PilotCohort } from "@/lib/fixtures";

type Props = {
  cohort: PilotCohort;
};

/**
 * The one figure the pilot is steered by. A bar rather than a fraction because
 * the seats are a fixed ceiling — "11 / 15" needs arithmetic to feel like four
 * spots left, and a bar does not.
 *
 * The three figures underneath account for the gap between the bar and the
 * ceiling, which is the question the bar always provokes: of the four open
 * seats, three have an invite out and one was given back by a suspension.
 */
export const CohortProgress = ({ cohort }: Props) => {
  const remaining = cohort.target - cohort.onboarded;
  const percent = (cohort.onboarded / cohort.target) * 100;

  const seats = [
    { label: "Seats open", value: remaining },
    { label: "Invites out", value: cohort.invitesOut },
    { label: "Suspended", value: cohort.suspended },
  ];

  return (
    <Card elevation="flat">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Founding cohort</CardTitle>
          <CardDescription>
            {remaining === 0
              ? "Every seat is taken."
              : `${remaining} of ${cohort.target} seats still open.`}
          </CardDescription>
        </div>
        <Badge variant="success" tone="subtle" size="sm">
          on track
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <Typography
              as="span"
              size="3xl"
              weight="semibold"
              className="tabular-nums"
            >
              {cohort.onboarded} / {cohort.target}
            </Typography>
            <Typography as="span" size="sm" tone="muted">
              practitioners onboarded
            </Typography>
          </div>

          <Progress
            value={percent}
            label={`Founding cohort — ${cohort.onboarded} of ${cohort.target} practitioners onboarded`}
            intent="success"
          />
        </div>

        <dl className="grid grid-cols-3 gap-4">
          {seats.map((seat) => (
            <div key={seat.label} className="flex flex-col gap-0.5">
              <Typography as="dt" variant="eyebrow" tone="muted" balance>
                {seat.label}
              </Typography>
              <Typography
                as="dd"
                size="lg"
                weight="semibold"
                className="tabular-nums"
              >
                {seat.value}
              </Typography>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
};
