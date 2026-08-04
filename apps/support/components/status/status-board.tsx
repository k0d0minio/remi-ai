import { CircleCheck } from "lucide-react";
import type { Locale } from "@remi/services/shared";
import { Badge, Card, Separator, Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import { UptimeBar } from "@/components/status/uptime-bar";
import type { Content } from "@/lib/content/types";
import { services, uptimeRatio, type DayState } from "@/lib/status";

type Props = {
  locale: Locale;
  content: Content["status"];
};

const legendTone: Record<DayState, string> = {
  up: "bg-success",
  degraded: "bg-warning",
  down: "bg-error",
};

/**
 * Every surface on one board, each with its badge and its ninety days.
 *
 * The shape of the column is the answer: six identical badges is what
 * "everything is fine" looks like, and anything that is not operational breaks
 * the pattern before a word of it is read. The page's own notice carries the
 * caveat that none of this is measured yet — that sentence belongs to the page,
 * not to a badge, because a badge nobody can read as false is not a caveat.
 */
export const StatusBoard = ({ locale, content }: Props) => {
  const percent = new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex flex-col gap-4">
      <Card elevation="flat" className="gap-0 py-0">
        <ul className="flex flex-col">
          {services.map((service, index) => {
            const { name, description } = content.services[service.id];
            const uptime = percent.format(uptimeRatio(service.days));

            return (
              <li
                key={service.id}
                className={cn(
                  "flex flex-col gap-4 p-6",
                  index > 0 && "border-border border-t",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="flex min-w-0 flex-col gap-1">
                    <Typography as="h2" weight="semibold">
                      {name}
                    </Typography>
                    <Typography size="sm" tone="muted">
                      {description}
                    </Typography>
                  </div>

                  <Badge
                    variant="success"
                    tone="subtle"
                    className="w-fit shrink-0"
                  >
                    <CircleCheck aria-hidden="true" />
                    {content.operational}
                  </Badge>
                </div>

                <div className="flex flex-col gap-2">
                  <UptimeBar
                    days={service.days}
                    label={`${name} — ${content.historyLabel}`}
                  />

                  <div className="text-muted-foreground flex items-center justify-between gap-4">
                    <Typography as="span" size="xs" tone="muted">
                      {content.rangeStart}
                    </Typography>
                    <Typography
                      as="span"
                      size="xs"
                      tone="muted"
                      className="tabular-nums"
                    >
                      {uptime} · {content.uptimeLabel}
                    </Typography>
                    <Typography as="span" size="xs" tone="muted">
                      {content.rangeEnd}
                    </Typography>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Separator tone="subtle" />

      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {(
          [
            ["up", content.legend.up],
            ["degraded", content.legend.degraded],
            ["down", content.legend.down],
          ] as const
        ).map(([state, label]) => (
          <li key={state} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn("size-2.5 rounded-[2px]", legendTone[state])}
            />
            <Typography as="span" size="xs" tone="muted">
              {label}
            </Typography>
          </li>
        ))}
      </ul>
    </div>
  );
};
