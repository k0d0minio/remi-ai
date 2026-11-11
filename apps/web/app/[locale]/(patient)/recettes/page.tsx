import type { Metadata } from "next";
import { Typography } from "@remi/ui/server";
import { getContent } from "@/lib/content";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return { title: getContent(locale).patientRecipes.metaTitle };
};

/** The « Recettes » tab. `recipe-space/patient-recipes-today` replaces it. */
const PatientRecipesPage = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}) => {
  const content = getContent(await resolveLocale(params)).patientRecipes;

  return (
    <div className="flex flex-col gap-4">
      <Typography as="h1" size="2xl" weight="semibold">
        {content.title}
      </Typography>
      <Typography tone="muted">{content.comingSoon}</Typography>
    </div>
  );
};

export default PatientRecipesPage;
