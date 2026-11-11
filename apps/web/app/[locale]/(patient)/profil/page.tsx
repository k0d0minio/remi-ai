import type { Metadata } from "next";
import { Typography } from "@remi/ui/server";
import { SignOutButton } from "@/components/patient-auth/sign-out-button";
import { getContent } from "@/lib/content";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return { title: getContent(locale).patientProfile.metaTitle };
};

/**
 * The « Profil » tab. `patient-home-navigation/profile-tab` fills it and keeps
 * the sign-out in the account settings. Sign-out stays visible here, never in
 * a menu.
 */
const PatientProfilePage = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}) => {
  const locale = await resolveLocale(params);
  const content = getContent(locale);

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="flex flex-col gap-4">
        <Typography as="h1" size="2xl" weight="semibold">
          {content.patientProfile.title}
        </Typography>
        <Typography tone="muted">
          {content.patientProfile.comingSoon}
        </Typography>
      </div>
      <SignOutButton locale={locale} label={content.signOut} />
    </div>
  );
};

export default PatientProfilePage;
