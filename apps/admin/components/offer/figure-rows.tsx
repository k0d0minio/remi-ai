import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type { Row } from "@/lib/offer";

type Props = {
  title: string;
  description?: string;
  rows: readonly Row[];
  /**
   * Flags the card whose figures are the argument rather than the supporting
   * evidence, so the eye lands on it first in a page of otherwise equal cards.
   */
  intent?: "neutral" | "info";
};

/**
 * A figure, what it is, and the working behind it — the only shape this page
 * needs, used once for the argument and once for the evidence under it. The
 * detail line sits below rather than beside the number because these are read
 * aloud in a conversation, and a reader following along needs the working in
 * the order it is spoken.
 */
export const FigureRows = ({
  title,
  description,
  rows,
  intent = "neutral",
}: Props) => (
  <Card elevation="flat" variant={intent}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>

    <CardContent>
      <dl className="flex flex-col">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={cn(
              "flex flex-col gap-1.5 py-4",
              index > 0 && "border-border border-t",
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <Typography as="dt" size="sm" weight="medium">
                {row.label}
              </Typography>
              <Typography
                as="dd"
                size="lg"
                weight="semibold"
                className="tabular-nums"
              >
                {row.value}
              </Typography>
            </div>
            <Typography size="sm" tone="muted" className="max-w-2xl">
              {row.detail}
            </Typography>
          </div>
        ))}
      </dl>
    </CardContent>
  </Card>
);
