import type { Metadata } from "next";
import { Alert, AlertDescription, AlertTitle } from "@remi/ui/server";
import { FactTable } from "@/components/company/fact-table";
import { ItemCard } from "@/components/company/item-card";
import { ReportFooter } from "@/components/company/report-footer";
import { ReportHeader } from "@/components/company/report-header";
import { ReportSection } from "@/components/company/report-section";
import { startupBoost } from "@/lib/dossier/startup-boost";

export const metadata: Metadata = {
  title: "Startup Boost",
};

const StartupBoost = () => (
  <div className="flex max-w-4xl flex-col gap-8">
    <ReportHeader header={startupBoost.header} />

    <FactTable
      title={startupBoost.gates.title}
      description={startupBoost.gates.description}
      columns={startupBoost.gates.columns}
      statusColumn={startupBoost.gates.statusColumn}
      rows={startupBoost.gates.rows}
      note={startupBoost.gates.note}
    />

    <FactTable
      title={startupBoost.criteria.title}
      description={startupBoost.criteria.description}
      columns={startupBoost.criteria.columns}
      statusColumn={startupBoost.criteria.statusColumn}
      rows={startupBoost.criteria.rows}
    />

    <ItemCard
      title={startupBoost.arguments.title}
      description={startupBoost.arguments.lead}
      items={startupBoost.arguments.items}
    />

    <ItemCard
      title={startupBoost.hardQuestions.title}
      description={startupBoost.hardQuestions.lead}
      items={startupBoost.hardQuestions.items}
    />

    {/*
     * An alert rather than a section: this is the one paragraph on the page
     * whose cost of being skimmed is the whole application.
     */}
    <Alert variant="warning" className="max-w-3xl">
      <AlertTitle>{startupBoost.redLine.title}</AlertTitle>
      <AlertDescription>
        <p>{startupBoost.redLine.body}</p>
      </AlertDescription>
    </Alert>

    <ReportSection
      title={startupBoost.conclusion.title}
      body={startupBoost.conclusion.body}
    />

    <ReportFooter note={startupBoost.footer} />
  </div>
);

export default StartupBoost;
