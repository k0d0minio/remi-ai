import { notFound } from "next/navigation";
import { isLocale } from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { RecipeList } from "@/components/patient-link/recipe-list";
import { SegmentPage } from "@/components/patient-link/segment-page";
import { getContent } from "@/lib/content";
import { hasSegment, loadPatientLink } from "@/lib/patient-link/load";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

/**
 * Recettes: « Mes recettes préférées » first, then the active assignments
 * newest first — title, body as prose, her per-patient note, and § 7's four
 * answers.
 *
 * The shelf leads because it is the patient's own list: what they kept is what
 * they come back for, and what she is suggesting this week is underneath it,
 * where it reads as the new thing rather than as the whole page. It is absent
 * entirely until something is « à refaire » — an empty shelf teaches nothing
 * and pushes the recipes down for no reason.
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
      {data.favourites.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Typography as="h3" size="sm" weight="semibold">
              {content.recipeFeedback.favouritesTitle}
            </Typography>
            <Typography size="sm" tone="muted">
              {content.recipeFeedback.favouritesLead}
            </Typography>
          </div>
          <RecipeList
            recipes={data.favourites}
            content={content}
            markArchived
            titleAs="h4"
          />
        </section>
      ) : null}

      {data.recipes.length > 0 ? (
        <RecipeList
          recipes={data.recipes}
          content={content}
          answers={{ token, locale }}
        />
      ) : null}
    </SegmentPage>
  );
};

export default Segment;
