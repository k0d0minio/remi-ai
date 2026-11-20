import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale, localePath } from "@remi/services/shared";
import { Link, Typography, Wordmark } from "@remi/ui/server";
import { NewPasswordForm } from "@/components/patient-auth/new-password-form";
import { getContent } from "@/lib/content";
import { FORGOT_PASSWORD_PATH } from "@/lib/patient-auth/paths";

/** The token comes from the query on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string };
type Search = { token?: string | string[]; error?: string | string[] };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: getContent(isLocale(locale) ? locale : defaultLocale).newPassword.metaTitle,
  };
};

/**
 * The page the reset link opens (story 2). The identity store checks the
 * link first and redirects here with `?token=`, or with `?error=` when the
 * link expired or was used. The token is checked again on submit.
 */
const NewPasswordPage = async ({
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
  const { token, error } = await searchParams;
  const content = getContent(locale).newPassword;
  const usable = typeof token === "string" && token !== "" && !error;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <Wordmark />
      <Typography as="h1" size="2xl" weight="semibold">
        {content.title}
      </Typography>
      {usable ? (
        <>
          <Typography size="sm" tone="muted">
            {content.intro}
          </Typography>
          <NewPasswordForm locale={locale} token={token} content={content} />
        </>
      ) : (
        <>
          <Typography size="sm" tone="muted">
            {content.invalidLink}
          </Typography>
          <Link
            as={NextLink}
            href={localePath(locale, FORGOT_PASSWORD_PATH)}
            variant="primary"
            className="inline-flex min-h-11 items-center self-start text-sm"
          >
            {content.requestAgain}
          </Link>
        </>
      )}
    </main>
  );
};

export default NewPasswordPage;
