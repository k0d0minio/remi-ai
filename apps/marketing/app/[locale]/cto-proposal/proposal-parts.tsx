import { Card, Separator, Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type { Clause, Objective, Point, Term } from "./content";

/**
 * Route-local building blocks for the proposal document. They stay here rather
 * than in `@remi/ui` because nothing else will ever render a numbered legal
 * clause or a terms table — a barrel export is a public-API commitment, and
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

export const TermsList = ({ terms }: { terms: readonly Term[] }) => (
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
        <div className="flex flex-col gap-1">
          <Typography>{term.value}</Typography>
          {term.note ? (
            <Typography size="sm" tone="muted">
              {term.note}
            </Typography>
          ) : null}
        </div>
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

export const ClauseList = ({ clauses }: { clauses: readonly Clause[] }) => (
  <div className="flex flex-col gap-10">
    {clauses.map((clause) => (
      <div key={clause.title} className="flex flex-col gap-3">
        <Typography as="h3" size="lg" weight="semibold">
          {clause.title}
        </Typography>
        <Prose body={clause.body} />
      </div>
    ))}
  </div>
);

export const RightsList = ({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) => (
  <Card elevation="flat" className="border-border h-full gap-4 p-6">
    <Typography as="h3" size="sm" weight="semibold">
      {title}
    </Typography>
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            aria-hidden
            className="bg-border mt-2.5 size-1 shrink-0 rounded-full"
          />
          <Typography size="sm" tone="muted" className="leading-relaxed">
            {item}
          </Typography>
        </li>
      ))}
    </ul>
  </Card>
);

export const ObjectiveList = ({ rows }: { rows: readonly Objective[] }) => (
  <div className="flex flex-col gap-4">
    {rows.map((row) => (
      <Card
        key={row.objective}
        elevation="flat"
        className="border-border gap-3 p-6"
      >
        <Typography variant="eyebrow" tone="muted">
          {row.horizon}
        </Typography>
        <Typography weight="medium">{row.objective}</Typography>
        <Typography size="sm" tone="muted" className="leading-relaxed">
          Judged by: {row.measure}
        </Typography>
      </Card>
    ))}
  </div>
);

type Figure = { label: string; value: string; body: string };

export const FigureGrid = ({ figures }: { figures: readonly Figure[] }) => (
  <div className="grid gap-4 md:grid-cols-3">
    {figures.map((figure) => (
      <Card
        key={figure.label}
        elevation="flat"
        className="border-border h-full gap-3 p-6"
      >
        <Typography variant="eyebrow" tone="muted">
          {figure.label}
        </Typography>
        <Typography variant="display" size="3xl">
          {figure.value}
        </Typography>
        <Typography size="sm" tone="muted" className="leading-relaxed">
          {figure.body}
        </Typography>
      </Card>
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
