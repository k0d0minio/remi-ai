import type { Metadata } from "next";
import { Typography } from "@remi/ui/server";
import { MealForm } from "@/components/patient-home/meal-form";
import { getContent } from "@/lib/content";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return { title: getContent(locale).patientHome.metaTitle };
};

const QUESTION_ID = "planned-meal-question";

/**
 * Where an activated patient lands (stories 2 and 31). The meal question is
 * the first content and the page's one dominant action (charter, 8.1). The
 * layout checks the session and the activation. The page reads no patient
 * data: the save checks the session again in its action.
 *
 * « Je suis au restaurant » is absent until `restaurant-menu` ships.
 */
const PatientHomePage = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}) => {
  const locale = await resolveLocale(params);
  const content = getContent(locale).patientMeal;

  return (
    <div className="flex flex-col gap-3">
      <Typography
        as="h1"
        id={QUESTION_ID}
        size="2xl"
        weight="semibold"
        className="text-[1.625rem] leading-8"
      >
        {content.question}
      </Typography>
      <MealForm locale={locale} labelledBy={QUESTION_ID} content={content} />
    </div>
  );
};

export default PatientHomePage;
