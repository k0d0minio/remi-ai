import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, ClipboardList, Stethoscope } from "lucide-react";
import { formatDate } from "@remi/services/shared";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  IconTile,
  Separator,
  Typography,
} from "@remi/ui/server";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content";
import { getConsultation } from "@/lib/queries/consultations";
import { getPerson } from "@/lib/queries/people";
import { getPractitioner } from "@/lib/queries/practitioners";
import { getActivePlan, listRecommendations } from "@/lib/queries/plans";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return { title: getContent(locale).plan.title };
};

/**
 * The same recommendations the practitioner confirmed, read from the person's
 * side. Only the confirmed ones arrive — `listRecommendations` drops the drafts
 * — so this screen is the proof that what REMI suggests all week traces back to
 * a decision a human made in a consultation.
 */
const Page = async ({ params }: { params: Promise<LocaleParams> }) => {
  const locale = await resolveLocale(params);
  const session = await getSession();
  if (!session?.personId) {
    notFound();
  }

  const content = getContent(locale).plan;
  const plan = await getActivePlan(session.personId);
  const person = await getPerson(session.personId);
  const practitioner = await getPractitioner(session.practitionerId);
  const consultation = plan ? await getConsultation(plan.consultationId) : null;
  const recommendations = plan ? await listRecommendations(plan.id) : [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Typography as="h1" size="2xl" weight="semibold">
          {content.title}
        </Typography>
        <Typography tone="muted">{content.lead}</Typography>
      </div>

      {recommendations.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={content.empty.title}
          body={content.empty.body}
        />
      ) : (
        <>
          {practitioner ? (
            <Card elevation="flat">
              <CardContent className="flex items-center gap-4">
                <IconTile intent="primary">
                  <Stethoscope />
                </IconTile>
                <div className="flex flex-col gap-0.5">
                  <Typography as="span" weight="medium">
                    {practitioner.name}
                  </Typography>
                  <Typography size="sm" tone="muted">
                    {practitioner.clinic}
                    {consultation
                      ? ` · ${content.consultationOn} ${formatDate(consultation.heldAt, locale)}`
                      : null}
                  </Typography>
                </div>
                {person?.nextConsultationAt ? (
                  <Badge
                    variant="neutral"
                    tone="subtle"
                    size="sm"
                    className="ml-auto shrink-0"
                  >
                    <CalendarDays aria-hidden="true" />
                    {content.nextReview}{" "}
                    {formatDate(person.nextConsultationAt, locale)}
                  </Badge>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Separator />

          <ul className="flex flex-col gap-3">
            {recommendations.map((recommendation) => (
              <li key={recommendation.id}>
                <Card elevation="flat">
                  <CardHeader className="gap-2">
                    <Badge
                      variant="neutral"
                      tone="subtle"
                      size="sm"
                      className="w-fit"
                    >
                      {content.categories[recommendation.category]}
                    </Badge>
                    <CardTitle className="text-base">
                      {recommendation.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Typography size="sm" tone="muted">
                      {recommendation.detail}
                    </Typography>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          <Alert variant="info">
            <AlertTitle>{content.disclaimer.title}</AlertTitle>
            <AlertDescription>{content.disclaimer.body}</AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
};

export default Page;
