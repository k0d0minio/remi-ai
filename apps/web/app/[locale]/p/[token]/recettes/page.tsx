import { notFound } from "next/navigation";
import { isLocale } from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { DocumentList } from "@/components/patient-link/document-list";
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
 * Her recipe PDFs and links live here too (her 14 Sept § 3, option 2, beside
 * option 1): a document attached to one of these recipes sits under it, and
 * one she classed as a recipe that hangs from none of them is listed after.
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

  const shown = new Set(data.recipes.map(({ assignment }) => assignment.id));
  const recipeDocuments = data.documents.filter(
    (document) =>
      document.tag === "recipe" &&
      !(document.recipeAssignmentId && shown.has(document.recipeAssignmentId)),
  );

  return (
    <SegmentPage title={content.recipesTitle}>
      {data.recipes.length > 0 ? (
        <RecipeList
          recipes={data.recipes}
          content={content}
          attached={{ documents: data.documents, locale, token }}
        />
      ) : null}
      {recipeDocuments.length > 0 ? (
        <div className="flex flex-col gap-3">
          <Typography as="h3" size="base" weight="semibold">
            {content.recipeDocumentsTitle}
          </Typography>
          <DocumentList
            documents={recipeDocuments}
            locale={locale}
            token={token}
            content={content}
          />
        </div>
      ) : null}
    </SegmentPage>
  );
};

export default Segment;
