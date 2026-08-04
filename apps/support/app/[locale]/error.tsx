"use client";

import { RotateCcw } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@remi/ui";
import { Container, Section, Typography } from "@remi/ui/server";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Shaped like the 404 beside it, and bilingual for the same reason: an error
 * boundary is a client component, so reading the locale here would mean sending
 * both dictionaries to the browser for a page almost nobody sees.
 *
 * `error.message` is never rendered — a public page is the last place to leak a
 * server string. The digest is the safe half: Next writes the same hash to the
 * server log, so it turns a screenshot into a trace.
 */
const ErrorBoundary = ({ error, reset }: Props) => (
  <Section spacing="lg">
    <Container size="narrow" className="flex flex-col items-start gap-6">
      <Typography variant="eyebrow" tone="muted">
        Error · Erreur
      </Typography>
      <Typography as="h1" variant="display" size="5xl" balance>
        This answer did not load · Cette réponse ne s&apos;est pas chargée
      </Typography>
      <Typography variant="lead" size="lg">
        The article is still there — something on our side failed on the way to
        it. · L&apos;article est toujours là — quelque chose a échoué de notre
        côté en chemin.
      </Typography>
      {error.digest ? (
        <Typography size="xs" tone="muted">
          {error.digest}
        </Typography>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button onClick={reset}>
          <RotateCcw aria-hidden="true" />
          Try again · Réessayer
        </Button>
        <Button asChild variant="outline">
          <NextLink href="/en">
            Back to the help centre · Retour au centre d&apos;aide
          </NextLink>
        </Button>
      </div>
    </Container>
  </Section>
);

export default ErrorBoundary;
