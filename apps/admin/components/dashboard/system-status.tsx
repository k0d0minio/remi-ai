import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type { SystemApp } from "@/lib/fixtures";

type Props = {
  apps: SystemApp[];
};

/**
 * Every surface in the ecosystem on one card. The whole point is the shape of
 * the column: five identical badges is the answer, and anything that is not
 * `operational` breaks the pattern before it is read.
 */
export const SystemStatus = ({ apps }: Props) => (
  <Card elevation="flat">
    <CardHeader>
      <CardTitle>System status</CardTitle>
      <CardDescription>Uptime over the last 30 days.</CardDescription>
    </CardHeader>

    <CardContent>
      <ul className="flex flex-col">
        {apps.map((app, index) => (
          <li
            key={app.name}
            className={cn(
              "flex items-center justify-between gap-4 py-3",
              index > 0 && "border-border border-t",
            )}
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <Typography as="h3" size="sm" weight="medium">
                {app.name}
              </Typography>
              <Typography size="xs" tone="muted">
                {app.description}
              </Typography>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Typography
                as="span"
                size="xs"
                tone="muted"
                className="hidden tabular-nums sm:inline"
              >
                {app.uptime}
              </Typography>
              <Badge variant={app.status.intent} tone="subtle" size="sm">
                {app.status.label}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);
