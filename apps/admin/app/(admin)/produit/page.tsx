import type { Metadata } from "next";
import { FactTable } from "@/components/company/fact-table";
import { ItemCard } from "@/components/company/item-card";
import { PullQuote } from "@/components/company/pull-quote";
import { ReportFooter } from "@/components/company/report-footer";
import { ReportHeader } from "@/components/company/report-header";
import { ReportSection } from "@/components/company/report-section";
import { produit } from "@/lib/dossier/produit";

export const metadata: Metadata = {
  title: "Le produit",
};

const Produit = () => (
  <div className="flex max-w-4xl flex-col gap-8">
    <ReportHeader header={produit.header} />

    <PullQuote
      quote={produit.positioning.quote}
      source={produit.positioning.source}
    />

    <ReportSection title={produit.gap.title} body={produit.gap.body} />

    <ItemCard
      title={produit.principles.title}
      description={produit.principles.lead}
      items={produit.principles.items}
    />

    <ItemCard
      title={produit.patient.title}
      description={produit.patient.lead}
      items={produit.patient.items}
    />

    <ItemCard
      title={produit.practitioner.title}
      description={produit.practitioner.lead}
      items={produit.practitioner.items}
    />

    <FactTable
      title={produit.numbers.title}
      description={produit.numbers.description}
      columns={produit.numbers.columns}
      statusColumn={produit.numbers.statusColumn}
      rows={produit.numbers.rows}
      note={produit.numbers.note}
    />

    <ReportSection title={produit.tests.title} body={produit.tests.body} />

    <ReportFooter note={produit.footer} />
  </div>
);

export default Produit;
