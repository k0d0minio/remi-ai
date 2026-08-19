import type { Metadata } from "next";
import { Typography } from "@remi/ui/server";
import { FlowDiagram } from "@/components/company/flow-diagram";
import { ItemCard } from "@/components/company/item-card";
import { PageIndex } from "@/components/company/page-index";
import { ReportHeader } from "@/components/company/report-header";
import { ReportSection } from "@/components/company/report-section";
import { dossierPages } from "@/lib/dossier/pages";
import { synthese } from "@/lib/dossier/synthese";

/**
 * The dossier's front page, linked from the sidebar's Dossier section: written
 * to be reviewed, not operated. What keeps it private is the console's access
 * gate, not obscurity.
 */
export const metadata: Metadata = {
  title: "Synthèse",
};

const Synthese = () => (
  <div className="flex max-w-4xl flex-col gap-8">
    <ReportHeader header={synthese.header} masthead />

    <ReportSection title={synthese.minute.title} body={synthese.minute.body} />

    <FlowDiagram
      title={synthese.loop.title}
      description={synthese.loop.description}
      nodes={synthese.loop.nodes}
      returnLabel={synthese.loop.returnLabel}
    />

    <ItemCard
      title={synthese.answers.title}
      description={synthese.answers.lead}
      items={synthese.answers.items}
    />

    <ItemCard
      title={synthese.agenda.title}
      description={synthese.agenda.lead}
      items={synthese.agenda.items}
    />

    <ReportSection title={synthese.index.title}>
      <Typography size="sm" tone="muted" className="max-w-2xl">
        {synthese.index.lead}
      </Typography>
      <PageIndex pages={dossierPages} />
    </ReportSection>

    <ReportSection
      title={synthese.closing.title}
      body={synthese.closing.body}
    />
  </div>
);

export default Synthese;
