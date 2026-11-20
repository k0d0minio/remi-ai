import type { Metadata } from "next";
import NextLink from "next/link";
import { localePath } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Typography, Wordmark } from "@remi/ui/server";
import { getContent } from "@/lib/content";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";
import { SIGN_IN_PATH } from "@/lib/patient-auth/paths";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return { title: getContent(locale).tokenLinkMoved.metaTitle };
};

/**
 * The one page of an old token link (story 31, REM-86). It answers
 * `/p/<token>` and each path below it, so an old bookmark of a segment shows
 * the same message.
 *
 * The page reads nothing: not the token, not the database, not the session.
 * Thus it shows the same text for a token that exists and for one that does
 * not, and no patient data can show here (D-26). The sign-in page sends a
 * patient who is signed in already to their own page.
 */
const TokenLinkMovedPage = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}) => {
  const locale = await resolveLocale(params);
  const content = getContent(locale).tokenLinkMoved;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <Wordmark />
      <Typography as="h1" size="2xl" weight="semibold">
        {content.title}
      </Typography>
      <Typography>{content.body}</Typography>
      <Button asChild className="self-start">
        <NextLink href={localePath(locale, SIGN_IN_PATH)}>
          {content.signIn}
        </NextLink>
      </Button>
      <Typography size="sm" tone="muted">
        {content.noAccount}
      </Typography>
    </main>
  );
};

export default TokenLinkMovedPage;
