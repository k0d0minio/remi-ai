import type { Metadata } from "next";
import { Check, Circle, Lock } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Typography,
} from "@remi/ui/server";
import { steps } from "@/lib/mock/steps";

export const metadata: Metadata = { title: "Étapes" };

const statusBadge = {
  done: { label: "Tenue", variant: "success" },
  current: { label: "En cours", variant: "info" },
  upcoming: { label: "À venir", variant: "neutral" },
  skipped: { label: "Passée", variant: "warning" },
} as const;

/**
 * The queue, shown as a queue. The upcoming steps are visible but dimmed and
 * locked — a person should be able to see where this is going without feeling
 * they are already behind on four things at once.
 */
const Page = () => {
  const done = steps.filter((step) => step.status === "done").length;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Typography as="h1" size="2xl" weight="semibold">
          Vos étapes
        </Typography>
        <Typography tone="muted">
          Une seule à la fois. La suivante attend que celle-ci tienne.
        </Typography>
      </div>

      <Card elevation="flat" className="border-border">
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <Typography as="span" size="sm" tone="muted">
              Étapes tenues
            </Typography>
            <Typography as="span" size="sm" weight="medium">
              {done} / {steps.length}
            </Typography>
          </div>
          <Progress
            value={(done / steps.length) * 100}
            label="Étapes tenues"
            intent="success"
          />
        </CardContent>
      </Card>

      <ol className="flex flex-col gap-3">
        {steps.map((step) => {
          const badge = statusBadge[step.status];
          const upcoming = step.status === "upcoming";

          return (
            <li key={step.id}>
              <Card
                variant={step.status === "current" ? "info" : "neutral"}
                elevation="flat"
                className={
                  upcoming ? "border-border opacity-60" : "border-border"
                }
              >
                <CardHeader className="gap-2">
                  <div className="flex items-center gap-2">
                    {step.status === "done" ? (
                      <Check
                        aria-hidden="true"
                        className="text-success-text size-4"
                      />
                    ) : upcoming ? (
                      <Lock
                        aria-hidden="true"
                        className="text-muted-foreground size-4"
                      />
                    ) : (
                      <Circle
                        aria-hidden="true"
                        className="text-info-text size-4"
                      />
                    )}
                    <Badge variant={badge.variant} tone="subtle" size="sm">
                      {badge.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{step.title}</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                  <Typography size="sm" tone="muted">
                    {step.why}
                  </Typography>

                  {step.status !== "upcoming" ? (
                    <div className="flex items-center gap-3">
                      <Progress
                        value={(step.completedDays / step.targetDays) * 100}
                        label={`Progression de « ${step.title} »`}
                        intent={step.status === "done" ? "success" : "info"}
                        size="sm"
                      />
                      <Typography
                        as="span"
                        size="xs"
                        tone="muted"
                        className="whitespace-nowrap"
                      >
                        {step.completedDays} / {step.targetDays} jours
                      </Typography>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default Page;
