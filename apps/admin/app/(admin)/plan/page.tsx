import type { Metadata } from "next";
import { ItemCard } from "@/components/company/item-card";
import { ReportFooter } from "@/components/company/report-footer";
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

    <ReportFooter note={plan.footer} />
  </div>
);

export default Plan;
