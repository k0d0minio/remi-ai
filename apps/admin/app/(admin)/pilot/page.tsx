import type { Metadata } from "next";
import { Typography } from "@remi/ui/server";
import { ApplicationTable } from "@/components/pilot/application-table";
import { CohortProgress } from "@/components/pilot/cohort-progress";
import { PilotTerms } from "@/components/pilot/pilot-terms";
import { pilotApplications, pilotCohort, pilotTerms } from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "Pilot",
};

/** Derived, so the sentence under the heading cannot drift from the table. */
const unanswered = pilotApplications.filter(
  (application) => application.status === "applied",
).length;

const Pilot = () => (
  <div className="flex flex-col gap-8">
    <div className="flex flex-col gap-1">
      <Typography as="h1" size="2xl" weight="semibold">
        Pilot
      </Typography>
      <Typography size="sm" tone="muted">
        How far the founding cohort has filled, and who is waiting on an answer.
      </Typography>
    </div>

    <div className="grid items-start gap-6 xl:grid-cols-[1.4fr_1fr]">
      <CohortProgress cohort={pilotCohort} />
      <PilotTerms terms={pilotTerms} />
    </div>

    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Typography as="h2" size="lg" weight="semibold">
          Applications
        </Typography>
        <Typography size="sm" tone="muted">
          All {pilotApplications.length} since the window opened, unanswered
          first — {unanswered} of them are still waiting on an operator. The
          onboarded and invited rows are the same people as the practitioners
          list.
        </Typography>
      </div>

      <ApplicationTable applications={pilotApplications} />
    </section>
  </div>
);

export default Pilot;
