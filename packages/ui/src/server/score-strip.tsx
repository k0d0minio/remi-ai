import type { ComponentProps } from "react";
import { cn } from "../lib/utils";
import { Typography } from "./typography";
import { VisuallyHidden } from "./visually-hidden";

type ScoreStripItem = {
  /** Stable React key — a row id. */
  key: string;
  /** The score, 0…`max`. Values outside the range are clamped. */
  value: number;
  /** What sits under the mark — a formatted date. */
  label: string;
};

type Props = Omit<ComponentProps<"ol">, "children"> & {
  items: readonly ScoreStripItem[];
  /** The top of the scale — the mark is full at this value. */
  max: number;
  /** What the strip is about, for assistive technology. */
  label: string;
};

/**
 * A row of small scored marks on a timeline, oldest first — a score over time
 * without a chart library. Each mark is a column filled to its value, the
 * number written under it and the label under that, so the strip reads as
 * text as well as a shape: a screen reader hears "3 out of 5, 12 Oct".
 *
 * Domain-free on purpose. The patient link and the console both render a
 * goal's weekly scores with it, and each supplies its own dates and wording.
 */
export const ScoreStrip = ({
  items,
  max,
  label,
  className,
  ...props
}: Props) => (
  <ol
    data-slot="score-strip"
    aria-label={label}
    className={cn("flex items-end gap-2 overflow-x-auto pb-1", className)}
    {...props}
  >
    {items.map((item) => {
      const clamped = Math.min(max, Math.max(0, item.value));
      return (
        <li key={item.key} className="flex min-w-9 flex-col items-center gap-1">
          <span
            aria-hidden="true"
            className="bg-muted flex h-10 w-3 items-end overflow-hidden rounded-full"
          >
            <span
              className="bg-primary w-full rounded-full"
              // A zero keeps a sliver, so the week reads as answered, not missing.
              style={{ height: `${Math.max(8, (clamped / max) * 100)}%` }}
            />
          </span>
          <Typography as="span" size="sm" weight="medium">
            {clamped}
            <VisuallyHidden>{` / ${max},`}</VisuallyHidden>
          </Typography>
          <Typography
            as="span"
            size="xs"
            tone="muted"
            className="whitespace-nowrap"
          >
            {item.label}
          </Typography>
        </li>
      );
    })}
  </ol>
);
