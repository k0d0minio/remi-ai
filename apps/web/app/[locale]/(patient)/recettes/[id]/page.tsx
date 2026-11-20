import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { getPatientRecipeCard, patientActor } from "@remi/services/server";
import { localePath } from "@remi/services/shared";
import { Link, Typography } from "@remi/ui/server";
import { RecipeCard } from "@/components/patient-recipes/recipe-card";
import { getContent } from "@/lib/content";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";
import { RECIPES_PATH } from "@/lib/patient-auth/paths";
import { requireActivePatient } from "@/lib/patient-auth/session";

type Params = LocaleParams & { id: string };

/**
 * The title names no recipe: the metadata is built before the page checks the
 * session and the gate.
 */
export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return { title: getContent(locale).patientRecipeCard.metaTitle };
};

/**
 * The page of one recipe of the patient (REM-94, story 25).
 *
 * The patient's id comes from the session, never from the address (D-26). The
 * id of the address names a recipe, and the service reads it as this patient:
 * a recipe of another patient, an archived one and an unknown id are the same
 * 404.
 *
 * The compatibility gate reads the recipe for this patient before anything
 * shows (D-16, D-30). A recipe that it does not confirm shows a message, and
 * no part of the recipe: no title, no ingredient.
 */
const PatientRecipePage = async ({ params }: { params: Promise<Params> }) => {
  const { id } = await params;
  const locale = await resolveLocale(params);
  // No recipe before the activation (story 19).
  const account = await requireActivePatient(locale);
  const patientId = account.patientProfileId;
  const content = getContent(locale).patientRecipeCard;

  const read = await getPatientRecipeCard(
    patientActor(patientId),
    patientId,
    id,
  );
  if (!read.ok && read.error === "not_found") {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        as={NextLink}
        href={localePath(locale, RECIPES_PATH)}
        variant="muted"
        className="inline-flex min-h-11 items-center self-start text-sm font-medium"
      >
        {content.back}
      </Link>
      {read.ok && read.data.status === "shown" ? (
        <RecipeCard card={read.data.card} content={content} />
      ) : (
        <div className="flex flex-col gap-2">
          <Typography as="h1" size="2xl" weight="semibold">
            {content.withheldTitle}
          </Typography>
          <Typography tone="muted">
            {read.ok ? content.withheld : content.unavailable}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default PatientRecipePage;
