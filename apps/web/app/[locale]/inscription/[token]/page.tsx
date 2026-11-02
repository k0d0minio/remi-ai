import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  currentConsentText,
  getPractitionerBySignupToken,
} from "@remi/services/server";
import {
  consentTextLocaleFor,
  formatDate,
  isLocale,
  mandatoryConsentKeys,
  type Locale,
} from "@remi/services/shared";
import { Markdown, Typography, Wordmark } from "@remi/ui/server";
import type { ConsentStepText } from "@/components/signup/consent-step";
import { SignupForm } from "@/components/signup/signup-form";
import { getContent } from "@/lib/content";
import { fill } from "@/lib/content/fill";
import { ensureDatabase } from "@/lib/database";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: getContent(isLocale(locale) ? locale : "en").signupLink.metaTitle,
  };
};

/**
 * The mandatory consent texts in the page's language, or in French when that
 * language has no text yet. The body renders here, on the server: `Markdown`
 * is a server component, and the client step only places it.
 */
const consentTexts = (locale: Locale): ConsentStepText[] =>
  mandatoryConsentKeys.map((key) => {
    const text = currentConsentText(key, consentTextLocaleFor(locale));
    return {
      key,
      version: text.version,
      locale: text.locale,
      // Noon UTC: the same calendar day in every time zone of Europe.
      date: formatDate(
        `${text.date}T12:00:00Z`,
        locale === "fr" ? "fr-BE" : "en-GB",
      ),
      lang: text.locale === "fr-BE" ? "fr" : "en",
      body: <Markdown>{text.body}</Markdown>,
    };
  });

/**
 * Where a practitioner's permanent sign-up link lands (stories 1 and 2). The
 * token only names a practitioner. It opens no data and no session.
 *
 * An unknown or malformed token is `notFound()`, which renders this route's
 * `not-found.tsx` with a 404, and nothing is written. A known one shows the
 * sign-up form. Its action resolves the token again and attaches the new
 * patient to that practitioner. The form opens on the consent step: the
 * patient reads and accepts the data notice before any account exists.
 */
const SignupLinkPage = async ({ params }: { params: Promise<Params> }) => {
  const { locale, token } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  ensureDatabase();
  const found = await getPractitionerBySignupToken(token);
  if (!found.ok) {
    notFound();
  }
  const content = getContent(locale).signupLink;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <Wordmark />
      <Typography as="h1" size="2xl" weight="semibold">
        {fill(content.title, { name: found.data.name })}
      </Typography>
      <Typography size="sm" tone="muted">
        {content.intro}
      </Typography>
      <SignupForm
        token={token}
        locale={locale}
        content={content}
        consents={consentTexts(locale)}
      />
    </main>
  );
};

export default SignupLinkPage;
