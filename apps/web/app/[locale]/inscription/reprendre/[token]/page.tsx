import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { checkFileTakeover } from "@remi/services/server";
import { defaultLocale, isLocale, localePath } from "@remi/services/shared";
import { Link, Typography, Wordmark } from "@remi/ui/server";
import { TakeoverForm } from "@/components/takeover/takeover-form";
import { getContent } from "@/lib/content";
import { fill } from "@/lib/content/fill";
import { ensureDatabase } from "@/lib/database";
import { SIGN_IN_PATH } from "@/lib/patient-auth/paths";
import { consentTexts, salesTermsDocument } from "@/lib/signup/consent-texts";

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
    title: getContent(isLocale(locale) ? locale : defaultLocale).takeover
      .metaTitle,
    // A one-time credential lives in the URL: no other site it links to reads
    // it. Not "no-referrer": that policy sends `Origin: null` on the form's
    // POST, and Next.js then refuses the server action.
    referrer: "same-origin",
  };
};

/**
 * Where a one-time takeover link lands (`patient-takes-over-file`): the link
 * of the activation e-mail and the claim link of the sign-up page open the
 * same page. Rendering writes nothing.
 *
 * - An unknown token is `notFound()`, a 404.
 * - A link that served once or expired shows why, and the sign-in link.
 * - A file or an e-mail that holds an account shows the sign-in link.
 * - An open link shows the consent step, then the password.
 */
const TakeoverPage = async ({ params }: { params: Promise<Params> }) => {
  const { locale, token } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  ensureDatabase();
  const target = await checkFileTakeover(token);
  if (!target.ok && target.error === "not_found") {
    notFound();
  }
  const all = getContent(locale);
  const content = all.takeover;
  const signIn = (
    <Link
      as={NextLink}
      href={localePath(locale, SIGN_IN_PATH)}
      variant="primary"
      className="inline-flex min-h-11 items-center self-start text-sm"
    >
      {content.signIn}
    </Link>
  );

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <Wordmark />
      <Typography as="h1" size="2xl" weight="semibold">
        {content.title}
      </Typography>
      {target.ok ? (
        <>
          {target.data.firstName ? (
            <Typography size="sm">
              {fill(content.greeting, { name: target.data.firstName })}
            </Typography>
          ) : null}
          <Typography size="sm" tone="muted">
            {content.intro}
          </Typography>
          <TakeoverForm
            token={token}
            locale={locale}
            content={content}
            consentContent={all.signupLink.consent}
            consents={consentTexts(locale)}
            terms={salesTermsDocument(locale)}
          />
        </>
      ) : (
        <>
          <Typography size="sm" tone="muted">
            {target.error === "has_account"
              ? content.hasAccount
              : content.spent}
          </Typography>
          {signIn}
        </>
      )}
    </main>
  );
};

export default TakeoverPage;
