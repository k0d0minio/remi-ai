import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPractitionerBySignupToken } from "@remi/services/server";
import { isLocale } from "@remi/services/shared";
import { Typography, Wordmark } from "@remi/ui/server";
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
 * Where a practitioner's permanent sign-up link lands (stories 1 and 2). The
 * token only names a practitioner. It opens no data and no session.
 *
 * An unknown or malformed token is `notFound()`, which renders this route's
 * `not-found.tsx` with a 404, and nothing is written. A known one shows the
 * sign-up form. Its action resolves the token again and attaches the new
 * patient to that practitioner.
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
      <SignupForm token={token} locale={locale} content={content} />
    </main>
  );
};

export default SignupLinkPage;
