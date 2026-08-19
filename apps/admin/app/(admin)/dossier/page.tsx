import type { Metadata } from "next";
import { Alert, AlertDescription, AlertTitle } from "@remi/ui/server";
import { DecisionList } from "@/components/company/decision-list";
import { FactTable } from "@/components/company/fact-table";
import { FlowDiagram } from "@/components/company/flow-diagram";
import { ItemCard } from "@/components/company/item-card";
import { PageNav } from "@/components/company/page-nav";
import { PhaseTrack } from "@/components/company/phase-track";
import { ReportHeader } from "@/components/company/report-header";
import { ReportSection } from "@/components/company/report-section";
import { dossier, sections } from "@/lib/dossier/dossier";

/**
 * The whole dossier, on one route: written to be reviewed, not operated. What
 * keeps it private is the console's access gate, not obscurity.
 */
export const metadata: Metadata = {
  title: "Dossier",
};

/** Numbering runs across both lists so an answer can name its decision. */
const openStartsAt = dossier.needed.decisions.length + 1;

const Dossier = () => (
  <div className="flex max-w-4xl flex-col gap-10">
    <div className="flex flex-col gap-5">
      <ReportHeader header={dossier.header} masthead />
      <PageNav anchors={sections} />
    </div>

    <ReportSection title={dossier.brief.title} body={dossier.brief.body} />

    <ReportSection title="Le produit" id="produit">
      <FlowDiagram
        title={dossier.loop.title}
        description={dossier.loop.description}
        nodes={dossier.loop.nodes}
        returnLabel={dossier.loop.returnLabel}
      />
    </ReportSection>

    <ReportSection title="Le plan" id="plan">
      <PhaseTrack
        title={dossier.track.title}
        description={dossier.track.description}
        steps={dossier.track.steps}
      />
      <ItemCard
        title={dossier.phases.title}
        description={dossier.phases.lead}
        items={dossier.phases.items}
      />
      <FactTable
        title={dossier.numbers.title}
        description={dossier.numbers.description}
        columns={dossier.numbers.columns}
        statusColumn={dossier.numbers.statusColumn}
        rows={dossier.numbers.rows}
      />
    </ReportSection>

    <ReportSection title="Startup Boost" id="boost">
      <FactTable
        title={dossier.gates.title}
        description={dossier.gates.description}
        columns={dossier.gates.columns}
        statusColumn={dossier.gates.statusColumn}
        rows={dossier.gates.rows}
        note={dossier.gates.note}
      />
      <FactTable
        title={dossier.criteria.title}
        description={dossier.criteria.description}
        columns={dossier.criteria.columns}
        statusColumn={dossier.criteria.statusColumn}
        rows={dossier.criteria.rows}
      />
      <ItemCard
        title={dossier.arguments.title}
        description={dossier.arguments.lead}
        items={dossier.arguments.items}
      />

      {/*
       * An alert rather than a card: this is the one paragraph on the page
       * whose cost of being skimmed is the whole application.
       */}
      <Alert variant="warning" className="max-w-3xl">
        <AlertTitle>{dossier.redLine.title}</AlertTitle>
        <AlertDescription>
          <p>{dossier.redLine.body}</p>
        </AlertDescription>
      </Alert>
    </ReportSection>

    <ReportSection title="Outils et souveraineté" id="outils">
      <FactTable
        title={dossier.stack.title}
        description={dossier.stack.description}
        columns={dossier.stack.columns}
        statusColumn={dossier.stack.statusColumn}
        rows={dossier.stack.rows}
      />
      <ItemCard
        title={dossier.sovereignty.title}
        description={dossier.sovereignty.lead}
        items={dossier.sovereignty.items}
      />
      <FactTable
        title={dossier.legacy.title}
        description={dossier.legacy.description}
        columns={dossier.legacy.columns}
        statusColumn={dossier.legacy.statusColumn}
        rows={dossier.legacy.rows}
      />

      {/* The one item with a legal clock on it. */}
      <Alert variant="error" className="max-w-3xl">
        <AlertTitle>{dossier.dataQuestion.title}</AlertTitle>
        <AlertDescription>
          <p>{dossier.dataQuestion.body}</p>
        </AlertDescription>
      </Alert>
    </ReportSection>

    <ReportSection title="Décisions attendues" id="decisions">
      <DecisionList
        title={dossier.needed.title}
        description={dossier.needed.lead}
        startAt={1}
        decisions={dossier.needed.decisions}
      />
      <DecisionList
        title={dossier.open.title}
        description={dossier.open.lead}
        startAt={openStartsAt}
        decisions={dossier.open.decisions}
        openNote={dossier.open.openNote}
      />
    </ReportSection>

    <ReportSection title="L'appel" id="appel">
      <ItemCard
        title={dossier.agenda.title}
        description={dossier.agenda.lead}
        items={dossier.agenda.items}
      />
    </ReportSection>
  </div>
);

export default Dossier;
