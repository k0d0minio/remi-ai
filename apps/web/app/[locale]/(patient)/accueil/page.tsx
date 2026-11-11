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
  return { title: getContent(locale).patientHome.metaTitle };
};

/**
 * Where an activated patient lands (stories 2 and 31). The layout checks the
 * session and the activation. `patient-home-navigation/home-meal-block` fills
 * this page.
 */
const PatientHomePage = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}) => {
  const content = getContent(await resolveLocale(params)).patientHome;

  return (
    <div className="flex flex-col gap-4">
      <Typography as="h1" size="2xl" weight="semibold">
        {content.title}
      </Typography>
      <Typography tone="muted">{content.comingSoon}</Typography>
    </div>
  );
};

export default PatientHomePage;
