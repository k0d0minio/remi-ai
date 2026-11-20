import { Typography, Wordmark } from "@remi/ui/server";

/**
 * The invalid sign-up link: an unknown or malformed token (story 1). The
 * text is written here, as in `[locale]/not-found.tsx`: a not-found boundary
 * receives no params. The page writes nothing.
 */
const InvalidSignupLink = () => (
  <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
    <Wordmark />
    <Typography as="h1" size="2xl" weight="semibold">
      Ce lien n&apos;est pas valide
    </Typography>
    <Typography size="sm" tone="muted">
      Vérifie le lien reçu, ou demandes-en un nouveau à la personne qui te
      suit.
    </Typography>
  </main>
);

export default InvalidSignupLink;
