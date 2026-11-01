import { Typography, Wordmark } from "@remi/ui/server";

/**
 * The invalid sign-up link: an unknown or malformed token (story 1). Bilingual
 * on one page, as `[locale]/not-found.tsx` is: a not-found boundary receives no
 * params, so the locale would be a guess. The page writes nothing.
 */
const InvalidSignupLink = () => (
  <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
    <Wordmark />
    <Typography as="h1" size="2xl" weight="semibold">
      Ce lien n&apos;est pas valide · This link is not valid
    </Typography>
    <Typography size="sm" tone="muted">
      Vérifiez le lien reçu, ou demandez-en un nouveau à la personne qui vous
      suit. · Check the link you received, or ask your practitioner for a new
      one.
    </Typography>
  </main>
);

export default InvalidSignupLink;
