import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { defaultLocale, isLocale, localePath } from "@remi/services/shared";
import { Alert, AlertDescription, Typography, Wordmark } from "@remi/ui/server";
import { PatientSignInForm } from "@/components/patient-auth/patient-sign-in-form";
import { getContent } from "@/lib/content";
import { isSignInNotice, landingPaths } from "@/lib/patient-auth/paths";
import { currentPatient, patientLanding } from "@/lib/patient-auth/session";

/** Reads the session on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string };
type Search = { notice?: string | string[] };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const content = getContent(isLocale(locale) ? locale : defaultLocale);
  return { title: content.patientSignIn.metaTitle };
};

/**
 * The patient's sign-in (story 2). A patient who is signed in already goes
 * straight to their current page: the questionnaire or the waiting screen
 * before activation, the home after it. A `notice` in the query opens the
 * page with one message.
 */
const SignInPage = async ({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) => {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const account = await currentPatient();
  if (account) {
    redirect(localePath(locale, landingPaths[await patientLanding(account)]));
  }
  const { notice } = await searchParams;
  const content = getContent(locale).patientSignIn;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <Wordmark />
      <Typography as="h1" size="2xl" weight="semibold">
        {content.title}
      </Typography>
      <Typography size="sm" tone="muted">
        {content.intro}
      </Typography>
      {isSignInNotice(notice) ? (
        <Alert
          variant={notice === "password_changed" ? "success" : "info"}
          role="status"
        >
          <AlertDescription>{content.notices[notice]}</AlertDescription>
        </Alert>
      ) : null}
      <PatientSignInForm locale={locale} content={content} />
      <Typography size="sm" tone="muted">
        {content.noAccount}
      </Typography>
    </main>
  );
};

export default SignInPage;
