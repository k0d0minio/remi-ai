import { notFound } from "next/navigation";
import { isLocale } from "@remi/services/shared";
import { RecipeList } from "@/components/patient-link/recipe-list";
import { SegmentPage } from "@/components/patient-link/segment-page";
import { getContent } from "@/lib/content";
import { hasSegment, loadPatientLink } from "@/lib/patient-link/load";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

/**
 * Recettes: the active assignments newest first — title, body as prose, and her per-patient note. The library tags do not render.
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
  if (!data || !hasSegment(data, "recettes")) {
    notFound();
  }

  return (
    <SegmentPage title={content.recipesTitle}>
      <RecipeList recipes={data.recipes} content={content} />
    </SegmentPage>
  );
};

export default Segment;
