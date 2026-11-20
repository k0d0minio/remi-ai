import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound, redirect } from "next/navigation";
import { getPatientWaitingView, patientActor } from "@remi/services/server";
import { isLocale, localePath, type Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Card, CardContent, Typography, Wordmark } from "@remi/ui/server";
import { SignOutButton } from "@/components/patient-auth/sign-out-button";
import { getContent } from "@/lib/content";
import { landingPaths, QUESTIONNAIRE_PATH } from "@/lib/patient-auth/paths";
import { patientLanding, requirePatient } from "@/lib/patient-auth/session";

/** Reads the session and the file status on every hit: never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: getContent(isLocale(locale) ? locale : "en").patientWaiting
      .metaTitle,
  };
};

/**
 * A `YYYY-MM-DD` day in words. The day has no timezone, so it is read and
 * written in UTC: the server's clock cannot move it to the day before.
 */
const dayInWords = (day: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "fr" ? "fr-BE" : "en-GB", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));

/**
 * The waiting screen (story 22, REM-81): what a signed-in patient sees from a
 * complete questionnaire to the activation. It says that the practitioner
 * prepares the care, and it shows no recommendation and no recipe. The
 * questionnaire stays open from here.
 *
 * It sits beside `questionnaire/`, outside the shell of `(patient)/`: the tab
 * bar belongs to the active space. Each hit reads the status again, so the
 * request after the activation opens the home with the same account
 * (REM-83).
 */
const WaitingPage = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const account = await requirePatient(locale);
  const landing = await patientLanding(account);
  if (landing !== "waiting") {
    redirect(localePath(locale, landingPaths[landing]));
  }
  const patientId = account.patientProfileId;
  const waiting = await getPatientWaitingView(
    patientActor(patientId),
    patientId,
  );
  const practitionerName = waiting.ok ? waiting.data.practitionerName : null;
  const appointmentDate = waiting.ok ? waiting.data.appointmentDate : null;
  const content = getContent(locale);
  const text = content.patientWaiting;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-5 py-10">
      <Wordmark />
      <section aria-labelledby="waiting-title" className="flex flex-col gap-4">
        <Typography as="h1" id="waiting-title" size="2xl" weight="semibold">
          {text.title}
        </Typography>
        <Typography as="p" size="base">
          {text.body}
        </Typography>
      </section>

      {practitionerName || appointmentDate ? (
        <Card elevation="flat">
          <CardContent>
            <dl className="flex flex-col gap-4">
              {practitionerName ? (
                <div className="flex flex-col gap-1">
                  <Typography as="dt" size="sm" tone="muted">
                    {text.practitionerLabel}
                  </Typography>
                  <Typography as="dd" size="base" weight="semibold">
                    {practitionerName}
                  </Typography>
                </div>
              ) : null}
              {appointmentDate ? (
                <div className="flex flex-col gap-1">
                  <Typography as="dt" size="sm" tone="muted">
                    {text.appointmentLabel}
                  </Typography>
                  <Typography as="dd" size="base" weight="semibold">
                    {dayInWords(appointmentDate, locale)}
                  </Typography>
                </div>
              ) : null}
            </dl>
          </CardContent>
        </Card>
      ) : null}

      <section className="flex flex-col items-start gap-3">
        <Typography as="p" size="sm" tone="muted">
          {text.questionnaireHint}
        </Typography>
        <Button asChild variant="outline" size="lg" className="min-h-11">
          <NextLink href={localePath(locale, QUESTIONNAIRE_PATH)}>
            {text.questionnaireLink}
          </NextLink>
        </Button>
      </section>

      <SignOutButton locale={locale} label={content.signOut} />
    </main>
  );
};

export default WaitingPage;
