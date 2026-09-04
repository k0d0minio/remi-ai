import { notFound } from "next/navigation";
import { isLocale } from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { GoalList } from "@/components/patient-link/goal-list";
import { SegmentPage } from "@/components/patient-link/segment-page";
import { getContent } from "@/lib/content";
import { loadPatientLink } from "@/lib/patient-link/load";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

/**
 * Home: the living summary and the priority goals, in her order.
 *
 * The § A profile extract the single page used to carry — the constraints,
 * the preferences, the medications, the free-text supplements field, the
 * objective and the age/height/weight line — comes off the patient's page
 * (Jamie, 2026-09-03). It stays in the console where it is hers to work from.
 * § C's living summary is the thing that says it better, and the priority
 * goals are § D's structured replacement for the objective: rendering both
 * would show the patient two competing statements of what they are working on.
 *
 * Home always renders, even when nothing is written yet — it carries the
 * greeting, and a patient whose record is still empty should reach a page
 * rather than a 404.
 */
const PatientLinkHome = async ({ params }: { params: Promise<Params> }) => {
  const { locale, token } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const content = getContent(locale).patientLink;

  const data = await loadPatientLink(token);
  if (!data) {
    notFound();
  }

  const { summary, goals } = data;

  if (summary === null && goals.length === 0) {
    return (
      <Typography size="sm" tone="muted">
        {content.empty}
      </Typography>
    );
  }

  return (
    <>
      {summary !== null ? (
        <SegmentPage title={content.summaryTitle}>
          <Typography size="sm" className="whitespace-pre-line">
            {summary.body}
          </Typography>
        </SegmentPage>
      ) : null}

      {goals.length > 0 ? (
        <SegmentPage title={content.goalsTitle}>
          <GoalList goals={goals} content={content} />
        </SegmentPage>
      ) : null}
    </>
  );
};

export default PatientLinkHome;
