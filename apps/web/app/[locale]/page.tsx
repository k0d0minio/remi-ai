import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { appHref, localePath } from "@remi/services/shared";
import {
  BRAND_TAGLINE,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Link,
  Separator,
  Typography,
  Wordmark,
} from "@remi/ui/server";
import { SignInForm } from "@/components/auth/sign-in-form";
import { landingPath } from "@/lib/auth/landing";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return { title: getContent(locale).signIn.title };
};

/**
 * The only route outside the `(app)` group, and the one thing the group's auth
 * boundary can redirect to without looping back into itself.
 *
 * It also answers `/[locale]` for someone who is already signed in, which is why
 * the redirect by role lives here rather than in a page of its own: two sibling
 * pages cannot both own this path.
 */
const Page = async ({ params }: { params: Promise<LocaleParams> }) => {
  const locale = await resolveLocale(params);
  const session = await getSession();

  if (session) {
    redirect(localePath(locale, landingPath(session.role)));
  }

  const content = getContent(locale);

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section className="bg-primary-subtle relative hidden flex-col justify-center gap-10 overflow-hidden border-r p-12 lg:flex xl:p-16">
        {/* The brand tint, as light as it goes and still read as colour. */}
        <div
          aria-hidden="true"
          className="bg-primary/10 absolute inset-y-0 left-0 w-1.5"
        />
        <div
          aria-hidden="true"
          className="bg-primary/5 absolute -right-32 top-1/4 size-96 rounded-full blur-3xl"
        />

        <Wordmark size="lg" />

        <div className="relative flex max-w-lg flex-col gap-5">
          <Typography variant="eyebrow" tone="muted">
            {content.signIn.eyebrow}
          </Typography>
          <Typography as="h2" variant="display" size="5xl" balance>
            {content.signIn.headline}
          </Typography>
          <Typography variant="lead" size="lg" balance>
            {BRAND_TAGLINE[locale]}
          </Typography>
        </div>
      </section>

      <main className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <Wordmark className="lg:hidden" />

          <Card elevation="floating">
            <CardHeader className="gap-2">
              <Typography as="h1" size="xl" weight="semibold">
                {content.signIn.title}
              </Typography>
              <Typography size="sm" tone="muted">
                {content.signIn.lead}
              </Typography>
            </CardHeader>

            <CardContent>
              <SignInForm locale={locale} content={content} />
            </CardContent>

            <CardFooter className="flex-col items-start gap-4">
              <Separator tone="subtle" />
              <Typography size="xs" tone="muted" balance>
                {content.signIn.pilotNote}
              </Typography>
              {/* The note above tells someone without an account that they
                  cannot sign in; without these two, that is where they stop.
                  Plain anchors — both are separate deployments. */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <Link
                  href={appHref("marketing", "/", locale)}
                  variant="muted"
                  className="text-xs"
                >
                  {content.signIn.aboutLink}
                </Link>
                <Link
                  href={appHref("support", "/", locale)}
                  variant="muted"
                  className="text-xs"
                >
                  {content.signIn.helpLink}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Page;
