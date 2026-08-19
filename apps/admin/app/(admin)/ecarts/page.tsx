import type { Metadata } from "next";
import { ItemCard } from "@/components/company/item-card";
import { ReportFooter } from "@/components/company/report-footer";
import { ReportHeader } from "@/components/company/report-header";
import { ReportSection } from "@/components/company/report-section";
import { ecarts } from "@/lib/dossier/ecarts";

export const metadata: Metadata = {
  title: "Écarts constatés",
};

const Ecarts = () => (
  <div className="flex max-w-4xl flex-col gap-8">
    <ReportHeader header={ecarts.header} />

    <ItemCard
      title={ecarts.transfers.title}
      description={ecarts.transfers.lead}
      items={ecarts.transfers.items}
    />

    <ItemCard
      title={ecarts.diverges.title}
      description={ecarts.diverges.lead}
      items={ecarts.diverges.items}
    />

    <ReportSection title={ecarts.reset.title} body={ecarts.reset.body} />

    <ItemCard
      title={ecarts.facts.title}
      description={ecarts.facts.lead}
      items={ecarts.facts.items}
    />

    <ReportFooter note={ecarts.footer} />
  </div>
);

export default Ecarts;
