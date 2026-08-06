import type { Metadata } from "next";
import { Separator, Typography } from "@remi/ui/server";
import { Prose } from "@/components/company/prose";
import { PhaseCard } from "@/components/roadmap/phase-card";
import { author, preparedOn, roadmap } from "@/lib/roadmap";

/**
 * The roadmap to first users, linked from the sidebar's Company section like
 * the offer: written to be reviewed, not operated. Amber badges are the items
 * the Questions ouvertes page unblocks — the two pages are meant to be read
 * side by side. What keeps it private is the console's access gate, not
 * obscurity.
 */
export const metadata: Metadata = {
  title: "Feuille de route",
};

const Roadmap = () => (
  <div className="flex max-w-4xl flex-col gap-8">
    <div className="flex flex-col gap-3">
      <Typography variant="eyebrow" tone="muted">
        {roadmap.header.eyebrow}
      </Typography>

      <Typography as="h1" size="2xl" weight="semibold">
        {roadmap.header.title}
      </Typography>

      <Typography size="sm" tone="muted" className="max-w-2xl">
        {roadmap.header.lead}
      </Typography>

      <Separator tone="subtle" />

      <div className="flex flex-wrap gap-x-8 gap-y-1">
        <Typography size="xs" tone="muted">
          {roadmap.header.preparedFor}
        </Typography>
        <Typography size="xs" tone="muted">
          {author} · {preparedOn}
        </Typography>
      </div>
    </div>

    <section className="flex flex-col gap-3">
      <Typography as="h2" size="lg" weight="semibold">
        {roadmap.standing.title}
      </Typography>
      <Prose body={roadmap.standing.body} />
    </section>

    {roadmap.phases.map((phase) => (
      <PhaseCard
        key={phase.title}
        title={phase.title}
        description={phase.lead}
        items={phase.items}
      />
    ))}

    <PhaseCard
      title={roadmap.parallel.title}
      description={roadmap.parallel.lead}
      items={roadmap.parallel.items}
    />

    <section className="flex flex-col gap-3">
      <Typography as="h2" size="lg" weight="semibold">
        {roadmap.outOfScope.title}
      </Typography>
      <Prose body={roadmap.outOfScope.body} />
      <Separator tone="subtle" />
      <Typography size="xs" tone="muted">
        {author} · {preparedOn}
      </Typography>
    </section>
  </div>
);

export default Roadmap;
