import { notFound } from "next/navigation";
import { isLocale } from "@remi/services/shared";
import { SupplementList } from "@/components/patient-link/supplement-list";
import { SegmentPage } from "@/components/patient-link/segment-page";
import { getContent } from "@/lib/content";
import { hasSegment, loadPatientLink } from "@/lib/patient-link/load";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

/**
 * Compléments: the validated supplement protocol (§ G). Nothing here comes from the profile free-text field the protocol replaced.
 *
 * A segment with nothing in it for this patient 404s here and appears in no
 * navigation: a reachable empty page and a nav entry leading to one are the
 * same broken product.
 */
const Segment = async ({ params }: { params: Promise<Params> }) => {
  const { locale, token } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const content = getContent(locale).patientLink;

  const data = await loadPatientLink(token);
  if (!data || !hasSegment(data, "complements")) {
    notFound();
  }

  return (
    <SegmentPage title={content.complementsTitle}>
      <SupplementList supplements={data.supplements} content={content} />
    </SegmentPage>
  );
};

export default Segment;
