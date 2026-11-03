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
 * `error.message` is never rendered — a public page is the last place to leak a
 * server string. The digest is the safe half: Next writes the same hash to the
 * server log, so it turns a screenshot into a trace.
 */
const ErrorBoundary = ({ error, reset }: Props) => (
  <Section spacing="lg">
    <Container size="narrow" className="flex flex-col items-start gap-6">
      <Typography variant="eyebrow" tone="muted">
        Erreur
      </Typography>
      <Typography as="h1" size="4xl" weight="bold" balance>
        Quelque chose s&apos;est mal passé
      </Typography>
      <Typography variant="lead" size="lg">
        La page n&apos;a pas pu se charger. Réessayez — et si cela se répète,
        dites-le-nous et nous le corrigerons.
      </Typography>
      {error.digest ? (
        <Typography size="xs" tone="muted">
          {error.digest}
        </Typography>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button onClick={reset}>
          <RotateCcw aria-hidden="true" />
          Réessayer
        </Button>
        <Button asChild variant="outline">
          <NextLink href="/fr">Retour au site</NextLink>
        </Button>
      </div>
    </Container>
  </Section>
);

export default ErrorBoundary;
