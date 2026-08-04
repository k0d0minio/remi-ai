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
 * nearest boundary above sits outside this layout, so one failing panel would
 * take the whole shell with it. Here the nav and the header stay, and only the
 * page's own content is replaced — which is also the honest picture, because
 * the rest of the app still works.
 *
 * Bilingual on one page, and `error.message` deliberately not shown — see the
 * boundary at `[locale]/error.tsx`.
 */
const ErrorBoundary = ({ error, reset }: Props) => (
  <div className="flex flex-col items-start gap-4">
    <Alert variant="error">
      <TriangleAlert aria-hidden="true" />
      <AlertTitle>
        This page could not be loaded · Cette page n&apos;a pas pu être chargée
      </AlertTitle>
      <AlertDescription>
        <p>
          Nothing you entered was lost. Try again, and tell your practitioner if
          it keeps happening. · Rien de ce que vous avez saisi n&apos;est perdu.
          Réessayez, et prévenez votre praticien si cela se répète.
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
      Try again · Réessayer
    </Button>
  </div>
);

export default ErrorBoundary;
