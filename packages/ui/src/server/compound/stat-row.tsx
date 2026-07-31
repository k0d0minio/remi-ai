import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Typography } from "../typography";

export type Stat = {
  /**
   * The figure. A ReactNode so the caller can pass `<CountUp value={…} />` from
   * @remi/ui/motion, or plain text where no animation is wanted.
   */
  value: ReactNode;
  label: string;
  /**
   * Where the number came from. Required by apps/marketing/AGENTS.md — a claim
   * on a medical product without a source is one nobody can check, which makes
   * it worse than no claim at all.
   */
  source?: string;
};

type Props = {
  stats: Stat[];
  className?: string;
};

export const StatRow = ({ stats, className }: Props) => (
  <dl
    className={cn(
      "sm:divide-border grid gap-8 sm:grid-cols-3 sm:gap-6 sm:divide-x",
      className,
    )}
  >
    {stats.map((stat, index) => (
      <div
        key={stat.label}
        className={cn(
          "flex flex-col items-center gap-1 text-center",
          index > 0 && "sm:pl-6",
        )}
      >
        <dt className="sr-only">{stat.label}</dt>
        <dd className="flex flex-col items-center gap-1">
          <Typography
            as="span"
            variant="display"
            size="4xl"
            className="tabular-nums"
          >
            {stat.value}
          </Typography>
          <Typography as="span" size="sm" tone="muted" balance>
            {stat.label}
          </Typography>
          {stat.source ? (
            <Typography as="span" size="xs" tone="muted" className="opacity-70">
              {stat.source}
            </Typography>
          ) : null}
        </dd>
      </div>
    ))}
  </dl>
);
