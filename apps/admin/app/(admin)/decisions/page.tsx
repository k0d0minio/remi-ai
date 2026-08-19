import type { Metadata } from "next";
import { DecisionList } from "@/components/company/decision-list";
import { ReportFooter } from "@/components/company/report-footer";
import { ReportHeader } from "@/components/company/report-header";
import { ReportSection } from "@/components/company/report-section";
import { decisions } from "@/lib/dossier/decisions";

export const metadata: Metadata = {
  title: "Décisions attendues",
};

/**
 * Numbering runs across both sections so an answer can name its decision —
 * « la 3 » — without also naming a section.
 */
const openStartsAt = decisions.needed.decisions.length + 1;

const Decisions = () => (
  <div className="flex max-w-4xl flex-col gap-8">
    <ReportHeader header={decisions.header} />

    <DecisionList
      title={decisions.needed.title}
      description={decisions.needed.lead}
      startAt={1}
      decisions={decisions.needed.decisions}
    />

    <DecisionList
      title={decisions.open.title}
      description={decisions.open.lead}
      startAt={openStartsAt}
      decisions={decisions.open.decisions}
      openNote={decisions.open.openNote}
    />

    <ReportSection
      title={decisions.closing.title}
      body={decisions.closing.body}
    />

    <ReportFooter note={decisions.footer} />
  </div>
);

export default Decisions;
