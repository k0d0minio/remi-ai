import NextLink from "next/link";
import { Button } from "@remi/ui";
import { Typography, Wordmark } from "@remi/ui/server";

/**
 * Branded to match the entry screen, and bilingual on one page: a not-found
 * boundary receives no params, so a locale here would be a guess — and a guess
 * in the wrong language serves a lost visitor worse than both.
 */
const NotFound = () => (
  <main className="relative flex min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden px-6 py-12">
    <div
      aria-hidden="true"
      className="bg-primary/5 absolute -top-40 left-1/2 size-[32rem] -translate-x-1/2 rounded-full blur-3xl"
    />

    <div className="relative flex max-w-lg flex-col items-center gap-5 text-center">
      <Wordmark />
      <Typography variant="eyebrow" tone="muted">
        404
      </Typography>
      <Typography as="h1" variant="display" size="4xl" balance>
        This page does not exist · Cette page n'existe pas
      </Typography>
      <Typography variant="lead" balance>
        The address may have changed, or it never existed. · L'adresse a
        peut-être changé, ou elle n'a jamais existé.
      </Typography>
    </div>

    <div className="relative flex flex-wrap justify-center gap-3">
      <Button asChild>
        <NextLink href="/en">Back to sign in</NextLink>
      </Button>
      <Button asChild variant="outline">
        <NextLink href="/fr">Retour à la connexion</NextLink>
      </Button>
    </div>
  </main>
);

export default NotFound;
