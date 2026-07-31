import {
  Container,
  Section,
  StatRow,
  Typography,
  type Stat,
} from "@remi/ui/server";

type Props = {
  eyebrow: string;
  title: string;
  /** The honesty line: these figures describe the problem, not REMI's results. */
  note: string;
  stats: Stat[];
};

/**
 * These figures describe the problem, never REMI's performance — the product
 * has no track record to cite, and the `note` says so in the visitor's own
 * language rather than leaving it to a code comment.
 */
export const StatsSection = ({ eyebrow, title, note, stats }: Props) => (
  <Section tone="muted" spacing="md">
    <Container className="flex flex-col gap-10">
      <div className="flex max-w-2xl flex-col gap-3">
        <Typography variant="eyebrow" tone="muted">
          {eyebrow}
        </Typography>
        <Typography as="h2" variant="display" size="3xl" balance>
          {title}
        </Typography>
      </div>

      <StatRow stats={stats} />

      <Typography size="xs" tone="muted" className="max-w-2xl opacity-80">
        {note}
      </Typography>
    </Container>
  </Section>
);
