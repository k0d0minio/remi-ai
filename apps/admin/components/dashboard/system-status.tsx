import { ArrowUpRight } from "lucide-react";
import { appHref } from "@remi/services/shared";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Link,
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
 *
 * Each name is also the way in. Five separate deployments is five URLs an
 * operator would otherwise have to know by heart, and "is it up" and "let me
 * look at it" are the same question asked one second apart. New tab, because
 * this card is the console's map and closing the map to follow it is backwards.
 */
export const SystemStatus = ({ apps }: Props) => (
  <Card elevation="flat">
    <CardHeader>
      <CardTitle>System status</CardTitle>
      <CardDescription>
        Uptime over the last 30 days. Each name opens that deployment.
      </CardDescription>
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
                <Link
                  href={appHref(app.app)}
                  target="_blank"
                  rel="noreferrer"
                  variant="standalone"
                  aria-label={`Open ${app.name}`}
                >
                  {app.name}
                  <ArrowUpRight aria-hidden="true" />
                </Link>
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
