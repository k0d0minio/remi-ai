import { Card, Container, Section, Typography } from "@remi/ui/server";
import type { StepContent } from "@/lib/content/types";

type Props = {
  eyebrow: string;
  title: string;
  /** For a sequence that needs its argument stated before it is read. */
  lead?: string;
  steps: StepContent[];
  tone?: "muted";
};

/**
 * A static numbered sequence, not tabs: the three moments are one loop and
 * should be read together, and a server component costs nothing.
 */
export const StepsSection = ({ eyebrow, title, lead, steps, tone }: Props) => (
  <Section tone={tone} spacing="lg">
    <Container className="flex flex-col gap-12">
      <div className="flex max-w-2xl flex-col gap-4">
        <Typography variant="eyebrow" tone="muted">
          {eyebrow}
        </Typography>
        <Typography as="h2" variant="display" size="4xl" balance>
          {title}
        </Typography>
        {lead ? (
          <Typography variant="lead" size="lg">
            {lead}
          </Typography>
        ) : null}
      </div>

      <ol className="grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="h-full">
            <Card elevation="flat" className="border-border h-full gap-4 p-8">
              <Typography
                as="span"
                variant="display"
                size="3xl"
                tone="muted"
                className="tabular-nums"
              >
                {index + 1}
              </Typography>
              <Typography as="h3" size="lg" weight="semibold" balance>
                {step.title}
              </Typography>
              <Typography tone="muted">{step.body}</Typography>
            </Card>
          </li>
        ))}
      </ol>
    </Container>
  </Section>
);
