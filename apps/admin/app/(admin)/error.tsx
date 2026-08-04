"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@remi/ui";
import { Card, CardContent, Typography } from "@remi/ui/server";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Inside the route group rather than beside the root layout, for the same
 * reason `loading.tsx` is: a console that loses its nav on a failure gives an
 * operator no way out except the back button.
 *
 * The digest is shown and `error.message` is not. Admin is internal, so the
 * temptation is to print the whole thing — but this console renders customer
 * data, and a thrown query can carry a practitioner's id or a patient's name
 * into the string. The digest is what pairs a screenshot with the server log.
 */
const ErrorBoundary = ({ error, reset }: Props) => (
  <Card variant="error">
    <CardContent className="flex flex-col items-start gap-4">
      <div className="text-error-text flex items-center gap-2">
        <TriangleAlert aria-hidden="true" className="size-4" />
        <Typography variant="eyebrow" as="span">
          Error
        </Typography>
      </div>

      <div className="flex flex-col gap-2">
        <Typography as="h1" size="xl" weight="semibold" balance>
          This view could not be loaded
        </Typography>
        <Typography size="sm" tone="muted">
          Nothing was changed by the attempt. Retry the view; if it fails again,
          quote the reference below when you report it.
        </Typography>
        {error.digest ? (
          <Typography size="xs" tone="muted">
            {error.digest}
          </Typography>
        ) : null}
      </div>

      <Button size="sm" onClick={reset}>
        <RotateCcw aria-hidden="true" />
        Retry
      </Button>
    </CardContent>
  </Card>
);

export default ErrorBoundary;
