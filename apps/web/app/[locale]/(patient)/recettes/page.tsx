import type { Metadata } from "next";
import { listPatientRecipeCards, patientActor } from "@remi/services/server";
import { recipeSummaryOf } from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { RecipeLinks } from "@/components/patient-recipes/recipe-links";
import { getContent } from "@/lib/content";
import { fill } from "@/lib/content/fill";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";
import { requireActivePatient } from "@/lib/patient-auth/session";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return { title: getContent(locale).patientRecipes.metaTitle };
};

/**
 * The « Recettes » tab. Until `recipe-space/patient-recipes-today` (REM-92)
 * replaces it, it lists the recipes of the patient that the compatibility
 * gate confirms for them now (REM-94): each one opens its page.
 *
 * The patient's id comes from the session, never from the address (D-26). A
 * recipe that the gate does not confirm is not in the list (D-30): the page
 * says how many do not show, and names none.
 */
const PatientRecipesPage = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}) => {
  const locale = await resolveLocale(params);
  // No recipe before the activation (story 19).
  const account = await requireActivePatient(locale);
  const patientId = account.patientProfileId;
  const dictionary = getContent(locale);
  const content = dictionary.patientRecipes;
  const texts = dictionary.patientRecipeCard;

  const list = await listPatientRecipeCards(patientActor(patientId), patientId);
  const recipes = list.ok ? list.data.cards.map(recipeSummaryOf) : [];
  const withheld = list.ok ? list.data.withheld : 0;

  return (
    <div className="flex flex-col gap-4">
      <Typography as="h1" size="2xl" weight="semibold">
        {content.title}
      </Typography>
      {recipes.length > 0 ? (
        <RecipeLinks recipes={recipes} locale={locale} content={texts} />
      ) : null}
      {!list.ok ? (
        <Typography tone="muted">{texts.list.unavailable}</Typography>
      ) : null}
      {list.ok && recipes.length === 0 && withheld === 0 ? (
        <Typography tone="muted">{content.comingSoon}</Typography>
      ) : null}
      {withheld > 0 ? (
        <Typography size="sm" tone="muted">
          {withheld === 1
            ? texts.list.withheldOne
            : fill(texts.list.withheldMany, { count: withheld })}
        </Typography>
      ) : null}
    </div>
  );
};

export default PatientRecipesPage;
