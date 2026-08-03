import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarOff } from "lucide-react";
import type { Locale } from "@remi/services/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Progress,
  Typography,
} from "@remi/ui/server";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content";
import { getActivePlan, getCurrentStep } from "@/lib/queries/plans";

type Params = { locale: Locale };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return { title: getContent(locale).today.title };
};

const Page = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  const session = await getSession();
  if (!session?.personId) {
    notFound();
  }

  const content = getContent(locale).today;
  const plan = await getActivePlan(session.personId);
  const step = plan ? await getCurrentStep(plan.id) : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Typography as="h1" size="2xl" weight="semibold">
          {content.title}
        </Typography>
        <Typography tone="muted">{content.lead}</Typography>
      </div>

      {step ? (
        <Card variant="success">
          <CardHeader>
            <CardDescription>{content.currentStep}</CardDescription>
            <CardTitle>{step.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Typography tone="muted">{step.why}</Typography>
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <Typography as="span" size="sm" tone="muted">
                  {content.stepProgress}
                </Typography>
                <Typography as="span" size="sm" weight="medium">
                  {step.completedDays} / {step.targetDays}
                </Typography>
              </div>
              <Progress
                intent="success"
                label={content.stepProgress}
                value={(step.completedDays / step.targetDays) * 100}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={CalendarOff}
          title={content.noPlan.title}
          body={content.noPlan.body}
        />
      )}
    </div>
  );
};

export default Page;
