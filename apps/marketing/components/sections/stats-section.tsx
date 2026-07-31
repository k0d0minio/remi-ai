import { Container, Section, StatRow } from "@remi/ui/server";
import { stats } from "@/lib/content/landing";

/**
 * These figures describe the problem, not Remi's performance — the product has
 * no track record to cite yet, and inventing one would be the exact thing
 * apps/marketing/AGENTS.md forbids. Each carries its source.
 */
export const StatsSection = () => (
  <Section tone="muted" spacing="sm">
    <Container>
      <StatRow stats={stats} />
    </Container>
  </Section>
);
