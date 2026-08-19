import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";

export type TrackStep = {
  /** A…F — the same letter the detail card further down carries. */
  letter: string;
  label: string;
  note: string;
};

type Props = {
  title: string;
  description?: string;
  steps: readonly TrackStep[];
};

/**
 * The whole plan on one line, before any of it is argued. A reader who meets
 * six stacked cards has to hold the sequence in their head to know where they
 * are; a track hands them the sequence first and lets the cards be detail.
 *
 * The rail is drawn from `lg`, where the steps sit on a single row. Below that
 * the grid wraps, and a rail across a wrap would join steps that are not next
 * to each other. Its legs are decided by index rather than by `first:`/`last:`
 * so the rule cannot be lost to variant ordering.
 */
export const PhaseTrack = ({ title, description, steps }: Props) => (
  <Card elevation="flat">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>

    <CardContent>
      <ol className="grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map((step, index) => (
          <li
            key={step.letter}
            className="flex flex-col items-center gap-2 text-center"
          >
            <div className="relative flex w-full items-center justify-center">
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className="bg-border absolute left-0 top-1/2 hidden h-px w-1/2 lg:block"
                />
              ) : null}
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="bg-border absolute right-0 top-1/2 hidden h-px w-1/2 lg:block"
                />
              ) : null}

              <span className="border-primary-border bg-primary-subtle text-primary relative flex size-9 items-center justify-center rounded-full border text-sm font-medium">
                {step.letter}
              </span>
            </div>

            <Typography
              as="h3"
              size="sm"
              weight="medium"
              className="text-balance"
            >
              {step.label}
            </Typography>
            <Typography size="xs" tone="muted" className="text-balance">
              {step.note}
            </Typography>
          </li>
        ))}
      </ol>
    </CardContent>
  </Card>
);
