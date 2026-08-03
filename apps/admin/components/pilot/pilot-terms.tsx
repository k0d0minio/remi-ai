import { Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type { PilotTerm } from "@/lib/fixtures";

type Props = {
  terms: PilotTerm[];
};

/**
 * Read-only by design, not by omission. Every line is fixed by a signed
 * agreement, so the console shows what was agreed and offers no control to
 * change it — an operator who could edit the price from a table is one mis-click
 * from a term nobody signed.
 */
export const PilotTerms = ({ terms }: Props) => (
  <Card elevation="flat">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Lock aria-hidden="true" className="text-muted-foreground size-4" />
        Pilot terms
      </CardTitle>
      <CardDescription>
        Set by the pilot agreement. Changing any of it means a new agreement,
        not an edit here.
      </CardDescription>
    </CardHeader>

    <CardContent>
      <dl className="flex flex-col">
        {terms.map((term, index) => (
          <div
            key={term.label}
            className={cn(
              "flex flex-col gap-1 py-3",
              index > 0 && "border-border border-t",
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <Typography as="dt" size="sm" tone="muted">
                {term.label}
              </Typography>
              <Typography
                as="dd"
                size="sm"
                weight="medium"
                className="tabular-nums"
              >
                {term.value}
              </Typography>
            </div>
            <Typography size="xs" tone="muted">
              {term.detail}
            </Typography>
          </div>
        ))}
      </dl>
    </CardContent>
  </Card>
);
