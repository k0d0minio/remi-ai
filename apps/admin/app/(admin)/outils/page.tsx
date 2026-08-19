import type { Metadata } from "next";
import { Alert, AlertDescription, AlertTitle } from "@remi/ui/server";
import { FactTable } from "@/components/company/fact-table";
import { ReportHeader } from "@/components/company/report-header";
import { ReportSection } from "@/components/company/report-section";
import { outils } from "@/lib/dossier/outils";

export const metadata: Metadata = {
  title: "Outils et coûts",
};

const Outils = () => (
  <div className="flex max-w-4xl flex-col gap-8">
    <ReportHeader header={outils.header} />

    <FactTable
      title={outils.current.title}
      description={outils.current.description}
      columns={outils.current.columns}
      statusColumn={outils.current.statusColumn}
      rows={outils.current.rows}
    />

    <FactTable
      title={outils.unfound.title}
      description={outils.unfound.description}
      columns={outils.unfound.columns}
      rows={outils.unfound.rows}
    />

    <FactTable
      title={outils.legacy.title}
      description={outils.legacy.description}
      columns={outils.legacy.columns}
      statusColumn={outils.legacy.statusColumn}
      rows={outils.legacy.rows}
    />

    {/*
     * The one item on this page with a legal clock on it, so it gets the
     * treatment a row in a table cannot give it.
     */}
    <Alert variant="error" className="max-w-3xl">
      <AlertTitle>{outils.dataQuestion.title}</AlertTitle>
      <AlertDescription>
        <p>{outils.dataQuestion.body}</p>
      </AlertDescription>
    </Alert>

    <ReportSection title={outils.costs.title} body={outils.costs.body} />
  </div>
);

export default Outils;
