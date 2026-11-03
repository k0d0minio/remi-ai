import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@remi/services/shared";
import { Typography, Wordmark } from "@remi/ui/server";
import { SignOutButton } from "@/components/patient-auth/sign-out-button";
import { getContent } from "@/lib/content";
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
    title: getContent(isLocale(locale) ? locale : "en").questionnaire.metaTitle,
  };
};

/**
 * Where a new patient lands after sign-up (story 2). A holding page behind the
 * patient session: `preparatory-questionnaire/questionnaire-flow` replaces it
 * with the questionnaire. Without a patient account, the visitor goes to the
 * sign-in page.
 */
const QuestionnairePage = async ({
  params,
}: {
  params: Promise<Params>;
}) => {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  await requirePatient(locale);
  const content = getContent(locale);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <Wordmark />
      <Typography as="h1" size="2xl" weight="semibold">
        {content.questionnaire.title}
      </Typography>
      <Typography size="sm" tone="muted">
        {content.questionnaire.comingSoon}
      </Typography>
      <SignOutButton locale={locale} label={content.signOut} />
    </main>
  );
};

export default QuestionnairePage;
