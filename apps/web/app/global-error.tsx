"use client";

import "./globals.css";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * The page for an error that no other boundary catches, for example one in a
 * layout. Without this file the framework shows its own page, in English. It
 * replaces the root layout, so it has its own `html` and `body`, and it uses
 * no component that needs a provider.
 */
const GlobalError = ({ error, reset }: Props) => (
  <html lang="fr">
    <body className="bg-background text-foreground">
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-start justify-center gap-4 px-5 py-12">
        <h1 className="text-2xl font-extrabold">
          Cette page n&apos;a pas pu être chargée
        </h1>
        <p className="text-muted-foreground">Rien de ce que tu as saisi n&apos;est perdu. Réessaie dans un instant.</p>
        {error.digest ? (
          <p className="text-muted-foreground text-xs">{error.digest}</p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="bg-primary text-primary-foreground min-h-11 rounded-full px-6 font-semibold"
        >
          Réessayer
        </button>
      </main>
    </body>
  </html>
);

export default GlobalError;
