import { notFound } from "next/navigation";
import { isLocale } from "@remi/services/shared";
import { MealList } from "@/components/patient-link/meal-list";
import { SegmentPage } from "@/components/patient-link/segment-page";
import { getContent } from "@/lib/content";
import { hasSegment, loadPatientLink } from "@/lib/patient-link/load";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

/**
 * Repas: every non-archived entry newest first, with her feedback beneath one where she has written it. Learnings and observations stay in the console.
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
  if (!data || !hasSegment(data, "repas")) {
    notFound();
  }

  return (
    <SegmentPage title={content.mealsTitle}>
      <MealList meals={data.meals} locale={locale} content={content} />
    </SegmentPage>
  );
};

export default Segment;
