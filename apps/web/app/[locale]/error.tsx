"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@remi/ui";
import { Typography, Wordmark } from "@remi/ui/server";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Branded to match the entry screen and the 404 beside it, and written here, not in the
 * dictionary: an error boundary is a client component, so reading the content
 * would mean shipping the dictionary to the browser for a page almost nobody
 * sees.
 *
 * The message never quotes `error.message` — that string comes from the server
 * and can carry a query, a path or an id. The digest is the safe half: it is a
 * hash Next also writes to the server log, which is exactly what support needs
 * to find the trace behind a screenshot.
 */
const ErrorBoundary = ({ error, reset }: Props) => (
  <main className="relative flex min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden px-6 py-12">
    <div
      aria-hidden="true"
      className="bg-error/5 absolute -top-40 left-1/2 size-[32rem] -translate-x-1/2 rounded-full blur-3xl"
    />

    <div className="relative flex max-w-lg flex-col items-center gap-5 text-center">
      <Wordmark />
      <Typography variant="eyebrow" tone="muted">
        Erreur
      </Typography>
      <Typography as="h1" variant="display" size="4xl" balance>
        Quelque chose s&apos;est mal passé
      </Typography>
      <Typography variant="lead" balance>
        Rien de ce que tu as saisi n&apos;est perdu. Réessaie, et préviens ton
        praticien si cela se répète.
      </Typography>
      {error.digest ? (
        <Typography size="xs" tone="muted">
          {error.digest}
        </Typography>
      ) : null}
    </div>

    <div className="relative flex flex-wrap justify-center gap-3">
      <Button onClick={reset}>
        <RotateCcw aria-hidden="true" />
        Réessayer
      </Button>
    </div>
  </main>
);

export default ErrorBoundary;
