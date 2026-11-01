import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { readSession } from "@remi/services/server";
import { isLocale, localePath } from "@remi/services/shared";
import { Typography, Wordmark } from "@remi/ui/server";
import { ensureAuthProvider } from "@/lib/auth/provider";
import { getContent } from "@/lib/content";
import { ensureDatabase } from "@/lib/database";

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
 * with the questionnaire. Without a patient account, the visitor goes back to
 * the entry screen.
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
  ensureDatabase();
  const session = ensureAuthProvider() ? await readSession() : null;
  if (session?.principal?.kind !== "patient") {
    redirect(localePath(locale, "/"));
  }
  const content = getContent(locale).questionnaire;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <Wordmark />
      <Typography as="h1" size="2xl" weight="semibold">
        {content.title}
      </Typography>
      <Typography size="sm" tone="muted">
        {content.comingSoon}
      </Typography>
    </main>
  );
};

export default QuestionnairePage;
