"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@remi/ui";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Typography,
} from "@remi/ui/server";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Inside the route group, for the reason `loading.tsx` beside it gives: the
 * chrome stays, so a stakeholder who hits this can still reach the other
 * screens rather than being stranded on a blank page mid-review.
 *
 * The reference is worth showing even here. Nothing in this app talks to a
 * backend, so a failure is a bug in the prototype itself — and a digest in the
 * screenshot is what points at the render that threw.
 */
const ErrorBoundary = ({ error, reset }: Props) => (
  <div className="flex flex-col items-start gap-4">
    <Alert variant="error">
      <TriangleAlert aria-hidden="true" />
      <AlertTitle>Cet écran n&apos;a pas pu s&apos;afficher</AlertTitle>
      <AlertDescription>
        <p>
          C&apos;est un défaut de la maquette, pas de vos données — il n&apos;y
          en a aucune ici. Réessayez, et signalez-le si cela se répète.
        </p>
        {error.digest ? (
          <Typography as="span" size="xs" tone="muted">
            {error.digest}
          </Typography>
        ) : null}
      </AlertDescription>
    </Alert>

    <Button size="sm" onClick={reset}>
      <RotateCcw aria-hidden="true" />
      Réessayer
    </Button>
  </div>
);

export default ErrorBoundary;
