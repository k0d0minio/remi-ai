import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale, localePath } from "@remi/services/shared";
import { Link, Typography, Wordmark } from "@remi/ui/server";
import { ForgotPasswordForm } from "@/components/patient-auth/forgot-password-form";
import { getContent } from "@/lib/content";
import { SIGN_IN_PATH } from "@/lib/patient-auth/paths";

type Params = { locale: string };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const content = getContent(isLocale(locale) ? locale : defaultLocale);
  return { title: content.forgotPassword.metaTitle };
};

/** « Mot de passe oublié » (story 2): the patient asks for a reset link. */
const ForgotPasswordPage = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const content = getContent(locale).forgotPassword;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <Wordmark />
      <Typography as="h1" size="2xl" weight="semibold">
        {content.title}
      </Typography>
      <Typography size="sm" tone="muted">
        {content.intro}
      </Typography>
      <ForgotPasswordForm locale={locale} content={content} />
      <Link
        as={NextLink}
        href={localePath(locale, SIGN_IN_PATH)}
        variant="primary"
        className="inline-flex min-h-11 items-center self-start text-sm"
      >
        {content.back}
      </Link>
    </main>
  );
};

export default ForgotPasswordPage;
