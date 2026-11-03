import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { patientLandingFor } from "@remi/services/server";
import { isLocale, localePath } from "@remi/services/shared";
import { Typography, Wordmark } from "@remi/ui/server";
import { SignOutButton } from "@/components/patient-auth/sign-out-button";
import { getContent } from "@/lib/content";
import { QUESTIONNAIRE_PATH } from "@/lib/patient-auth/paths";
import { requirePatient } from "@/lib/patient-auth/session";

/** Reads the session on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: getContent(isLocale(locale) ? locale : "en").patientHome.metaTitle,
  };
};

/**
 * Where an activated patient lands (story 2). A holding page behind the
 * patient session: `patient-home-navigation/app-shell-and-nav` replaces it.
 * A patient whose care is not active yet goes to the questionnaire: no recipe
 * before activation (story 2, criterion 5).
 */
const PatientHomePage = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const account = await requirePatient(locale);
  if (patientLandingFor(account) !== "home") {
    redirect(localePath(locale, QUESTIONNAIRE_PATH));
  }
  const content = getContent(locale);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <Wordmark />
      <Typography as="h1" size="2xl" weight="semibold">
        {content.patientHome.title}
      </Typography>
      <Typography size="sm" tone="muted">
        {content.patientHome.comingSoon}
      </Typography>
      <SignOutButton locale={locale} label={content.signOut} />
    </main>
  );
};

export default PatientHomePage;
