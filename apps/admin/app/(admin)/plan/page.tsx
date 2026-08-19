import type { Metadata } from "next";
import { FactTable } from "@/components/company/fact-table";
import { ItemCard } from "@/components/company/item-card";
import { ReportHeader } from "@/components/company/report-header";
import { ReportSection } from "@/components/company/report-section";
import { plan } from "@/lib/dossier/plan";

export const metadata: Metadata = {
  title: "Plan V2",
};

/** The six phases, in dependency order — the page is their only reader. */
const phases = [
  plan.phaseA,
  plan.phaseB,
  plan.phaseC,
  plan.phaseD,
  plan.phaseE,
  plan.phaseF,
];

const Plan = () => (
  <div className="flex max-w-4xl flex-col gap-8">
    <ReportHeader header={plan.header} />

    <ReportSection title={plan.retired.title} body={plan.retired.body} />

    <ItemCard
      title={plan.survives.title}
      description={plan.survives.lead}
      items={plan.survives.items}
    />

    <FactTable
      title={plan.frame.title}
      description={plan.frame.description}
      columns={plan.frame.columns}
      statusColumn={plan.frame.statusColumn}
      rows={plan.frame.rows}
    />

    {phases.map((phase) => (
      <ItemCard
        key={phase.title}
        title={phase.title}
        description={phase.lead}
        items={phase.items}
      />
    ))}

    <ReportSection title={plan.boost.title} body={plan.boost.body} />

    <ReportSection title={plan.backlog.title} body={plan.backlog.body} />
  </div>
);

export default Plan;
