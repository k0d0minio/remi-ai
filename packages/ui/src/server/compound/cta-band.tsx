import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Container } from "../container";
import { Section } from "../section";
import { Typography } from "../typography";

type Props = {
  title: ReactNode;
  body?: ReactNode;
  /** The buttons, rendered by the caller — `Button` is a client component. */
  actions?: ReactNode;
  className?: string;
};

/**
 * The closing call to action: the one inverted block on the page. It works
 * because it is the only one — a second would make both of them ordinary.
 */
export const CtaBand = ({ title, body, actions, className }: Props) => (
  <Section tone="inverted" spacing="md" className={className}>
    <Container
      size="narrow"
      className="flex flex-col items-center gap-6 text-center"
    >
      <Typography as="h2" variant="display" size="4xl" tone="inverted" balance>
        {title}
      </Typography>

      {body ? (
        <Typography size="lg" tone="inverted" balance className="opacity-90">
          {body}
        </Typography>
      ) : null}

      {actions ? (
        <div className={cn("mt-2 flex flex-col gap-3 sm:flex-row")}>
          {actions}
        </div>
      ) : null}
    </Container>
  </Section>
);
