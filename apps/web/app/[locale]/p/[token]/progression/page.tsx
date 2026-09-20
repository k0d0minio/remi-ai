import { notFound } from "next/navigation";
import { isLocale } from "@remi/services/shared";
import { ProgressionView } from "@/components/patient-link/progression-view";
import { SegmentPage } from "@/components/patient-link/segment-page";
import { getContent } from "@/lib/content";
import { hasSegment, loadPatientLink } from "@/lib/patient-link/load";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

/**
 * « Ma progression » — the check-ins over time, the current consigne and the
 * week's meals. Decision D-9's patient-side view, and the page the old version
 * promised without building.
 *
 * Like every other segment it 404s and stays out of the navigation when this
 * patient has nothing to show: a reachable empty page and a nav entry leading
 * to one are the same broken product.
 */
const Segment = async ({ params }: { params: Promise<Params> }) => {
  const { locale, token } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const content = getContent(locale).patientLink;

  const data = await loadPatientLink(token);
  if (!data || !hasSegment(data, "progression")) {
    notFound();
  }

  return (
    <SegmentPage title={content.checkIn.progressionTitle}>
      <ProgressionView data={data} locale={locale} content={content} />
    </SegmentPage>
  );
};

export default Segment;
