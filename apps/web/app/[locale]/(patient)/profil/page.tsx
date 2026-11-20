import type { Metadata } from "next";
import NextLink from "next/link";
import { localePath } from "@remi/services/shared";
import { Link, Typography } from "@remi/ui/server";
import { SignOutButton } from "@/components/patient-auth/sign-out-button";
import { getContent } from "@/lib/content";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";
import { RECOMMENDATIONS_PATH } from "@/lib/patient-auth/paths";
import { requireActivePatient } from "@/lib/patient-auth/session";

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
 * a menu. The entry « Mes recommandations » opens its own page (story 23).
 */
const PatientProfilePage = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}) => {
  const locale = await resolveLocale(params);
  // The space opens at the activation (story 19).
  await requireActivePatient(locale);
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
      <Link
        as={NextLink}
        href={localePath(locale, RECOMMENDATIONS_PATH)}
        className="bg-card flex min-h-14 flex-col justify-center gap-1 self-stretch rounded-2xl border px-4 py-3"
      >
        <Typography as="span" weight="semibold">
          {content.patientRecommendations.profileEntry}
        </Typography>
        <Typography as="span" size="sm" tone="muted">
          {content.patientRecommendations.profileEntryHint}
        </Typography>
      </Link>
      <SignOutButton locale={locale} label={content.signOut} />
    </div>
  );
};

export default PatientProfilePage;
