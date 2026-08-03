import type { Metadata } from "next";
import { Typography } from "@remi/ui/server";
import { PractitionerFilters } from "@/components/practitioners/practitioner-filters";
import { PractitionerTable } from "@/components/practitioners/practitioner-table";
import { practitioners } from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "Practitioners",
};

/**
 * Derived rather than listed: a hand-kept option list is one practitioner away
 * from offering a specialty nobody practises.
 */
const specialties = [
  ...new Set(practitioners.map((practitioner) => practitioner.specialty)),
].sort((a, b) => a.localeCompare(b, "fr"));

const onboarded = practitioners.filter(
  (practitioner) => practitioner.status === "onboarded",
).length;

const Practitioners = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-1">
      <Typography as="h1" size="2xl" weight="semibold">
        Practitioners
      </Typography>
      <Typography size="sm" tone="muted">
        Everyone in the founding cohort — {onboarded} onboarded of{" "}
        {practitioners.length} on the books.
      </Typography>
    </div>

    <PractitionerFilters specialties={specialties} />

    <PractitionerTable practitioners={practitioners} />
  </div>
);

export default Practitioners;
