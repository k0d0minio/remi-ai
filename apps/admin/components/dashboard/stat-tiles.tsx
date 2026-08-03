import { Badge, Card, CardContent, Progress, Typography } from "@remi/ui/server";
import type { OperationsStat } from "@/lib/fixtures";

type Props = {
  stats: OperationsStat[];
};

/**
 * The four figures the pilot is judged on. Flat cards rather than raised — this
 * is a reading surface, and four shadows in a row read as four buttons.
 */
export const StatTiles = ({ stats }: Props) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {stats.map((stat) => (
      <Card key={stat.label} elevation="flat" className="gap-0 py-5">
        <CardContent className="flex flex-col gap-3">
          <Typography as="h2" variant="eyebrow" tone="muted" balance>
            {stat.label}
          </Typography>

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <Typography
              as="span"
              size="3xl"
              weight="semibold"
              className="tabular-nums"
            >
              {stat.value}
            </Typography>
            <Badge variant={stat.badge.intent} tone="subtle" size="sm">
              {stat.badge.label}
            </Badge>
          </div>

          {stat.progress === undefined ? null : (
            <Progress
              value={stat.progress}
              label={`${stat.label} — ${stat.value}`}
              intent="success"
              size="sm"
            />
          )}

          <Typography size="xs" tone="muted">
            {stat.detail}
          </Typography>
        </CardContent>
      </Card>
    ))}
  </div>
);
