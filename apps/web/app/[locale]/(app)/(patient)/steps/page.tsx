import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Circle, ListChecks, Lock } from "lucide-react";
import type { StepStatus } from "@remi/services/shared";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Progress,
  Typography,
} from "@remi/ui/server";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content";
import { getActivePlan, listSteps } from "@/lib/queries/plans";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return { title: getContent(locale).steps.title };
};

const statusVariant: Record<
  StepStatus,
  "success" | "info" | "neutral" | "warning"
> = {
  done: "success",
  current: "info",
  upcoming: "neutral",
  skipped: "warning",
};

/**
 * The queue, shown as a queue. The upcoming steps are visible but dimmed and
 * locked — a patient should be able to see where this is going without feeling
 * they are already behind on four things at once.
 */
const Page = async ({ params }: { params: Promise<LocaleParams> }) => {
  const locale = await resolveLocale(params);
  const session = await getSession();
  if (!session?.personId) {
    notFound();
  }

  const content = getContent(locale).steps;
  const plan = await getActivePlan(session.personId);
  const steps = plan ? await listSteps(plan.id) : [];
  const held = steps.filter((step) => step.status === "done").length;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Typography as="h1" size="2xl" weight="semibold">
          {content.title}
        </Typography>
        <Typography tone="muted">{content.lead}</Typography>
      </div>

      {steps.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title={content.empty.title}
          body={content.empty.body}
        />
      ) : (
        <>
          <Card elevation="flat">
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <Typography as="span" size="sm" tone="muted">
                  {content.held}
                </Typography>
                <Typography as="span" size="sm" weight="medium">
                  {held} / {steps.length}
                </Typography>
              </div>
              <Progress
                value={(held / steps.length) * 100}
                label={content.held}
                intent="success"
              />
            </CardContent>
          </Card>

          <ol className="flex flex-col gap-3">
            {steps.map((step) => {
              const upcoming = step.status === "upcoming";

              return (
                <li key={step.id}>
                  <Card
                    variant={step.status === "current" ? "info" : "neutral"}
                    elevation="flat"
                    className={upcoming ? "opacity-60" : undefined}
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
                        <Badge
                          variant={statusVariant[step.status]}
                          tone="subtle"
                          size="sm"
                        >
                          {content.status[step.status]}
                        </Badge>
                      </div>
                      <CardTitle className="text-base">{step.title}</CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-3">
                      <Typography size="sm" tone="muted">
                        {step.why}
                      </Typography>

                      {upcoming ? null : (
                        <div className="flex items-center gap-3">
                          <Progress
                            value={(step.completedDays / step.targetDays) * 100}
                            label={`${content.progressLabel} ${step.title}`}
                            intent={step.status === "done" ? "success" : "info"}
                            size="sm"
                          />
                          <Typography
                            as="span"
                            size="xs"
                            tone="muted"
                            className="whitespace-nowrap"
                          >
                            {step.completedDays} / {step.targetDays}{" "}
                            {content.days}
                          </Typography>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
};

export default Page;
