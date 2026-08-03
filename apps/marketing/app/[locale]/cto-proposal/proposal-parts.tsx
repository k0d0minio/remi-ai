import { Card, Separator, Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type { Point } from "./content";

/**
 * Route-local building blocks for the proposal document. They stay here rather
 * than in `@remi/ui` because nothing else will ever render a terms table or a
 * numbered condition list — a barrel export is a public-API commitment, and
 * this document is a one-off.
 */

type HeadingProps = {
  index: number;
  title: string;
  lead?: string;
};

export const ProposalHeading = ({ index, title, lead }: HeadingProps) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-baseline gap-4">
      <Typography
        variant="eyebrow"
        tone="muted"
        className="tabular-nums"
        aria-hidden
      >
        {String(index).padStart(2, "0")}
      </Typography>
      <Separator className="flex-1" tone="subtle" />
    </div>
    <Typography as="h2" variant="display" size="3xl" balance>
      {title}
    </Typography>
    {lead ? (
      <Typography variant="lead" size="lg" className="max-w-2xl">
        {lead}
      </Typography>
    ) : null}
  </div>
);

export const Prose = ({ body }: { body: readonly string[] }) => (
  <div className="flex max-w-2xl flex-col gap-4">
    {body.map((paragraph) => (
      <Typography key={paragraph} className="leading-relaxed">
        {paragraph}
      </Typography>
    ))}
  </div>
);

export const TermsList = ({ terms }: { terms: readonly Point[] }) => (
  <Card elevation="flat" className="border-border gap-0 p-0">
    {terms.map((term, index) => (
      <div
        key={term.label}
        className={cn(
          "border-border grid gap-1 px-6 py-5 md:grid-cols-[14rem_1fr] md:gap-8",
          index > 0 && "border-t",
        )}
      >
        <Typography size="sm" weight="medium" className="md:pt-0.5">
          {term.label}
        </Typography>
        <Typography className="leading-relaxed">{term.body}</Typography>
      </div>
    ))}
  </Card>
);

export const PointList = ({ points }: { points: readonly Point[] }) => (
  <div className="flex flex-col gap-6">
    {points.map((point) => (
      <div
        key={point.label}
        className="grid gap-2 md:grid-cols-[16rem_1fr] md:gap-8"
      >
        <Typography weight="medium">{point.label}</Typography>
        <Typography tone="muted" className="max-w-2xl leading-relaxed">
          {point.body}
        </Typography>
      </div>
    ))}
  </div>
);

export const StepList = ({ steps }: { steps: readonly string[] }) => (
  <ol className="flex flex-col gap-5">
    {steps.map((step, index) => (
      <li key={step} className="grid grid-cols-[2rem_1fr] gap-4">
        <Typography
          variant="eyebrow"
          tone="muted"
          className="pt-1 tabular-nums"
          aria-hidden
        >
          {String(index + 1).padStart(2, "0")}
        </Typography>
        <Typography className="max-w-2xl leading-relaxed">{step}</Typography>
      </li>
    ))}
  </ol>
);
