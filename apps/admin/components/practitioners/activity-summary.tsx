import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import type { PractitionerActivity } from "@/lib/fixtures";

type Props = {
  activity: PractitionerActivity;
};

/**
 * Four counters and the date they were last added to. The sign-in line is the
 * one that matters most on a support call — every other figure can look healthy
 * on an account nobody has opened in a fortnight.
 */
export const ActivitySummary = ({ activity }: Props) => {
  const counters = [
    { label: "Plans published", value: activity.plansPublished },
    { label: "Consultations logged", value: activity.consultations },
    { label: "Signals reviewed", value: activity.signalsReviewed },
  ];

  return (
    <Card elevation="flat">
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Since the account was opened.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {counters.map((counter) => (
            <div key={counter.label} className="flex flex-col gap-1">
              <Typography variant="eyebrow" tone="muted" balance>
                {counter.label}
              </Typography>
              <Typography
                as="span"
                size="2xl"
                weight="semibold"
                className="tabular-nums"
              >
                {counter.value}
              </Typography>
            </div>
          ))}
        </div>

        <Typography
          size="xs"
          tone="muted"
          className="border-border border-t pt-3"
        >
          Last sign-in {activity.lastSignIn}.
        </Typography>
      </CardContent>
    </Card>
  );
};
