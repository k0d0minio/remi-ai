import type { Metadata } from "next";
import NextLink from "next/link";
import { getValidatedProtocol, patientActor } from "@remi/services/server";
import {
  formatDate,
  localePath,
  todayAtPractice,
  validatedRecommendationsView,
} from "@remi/services/shared";
import { Link, Typography } from "@remi/ui/server";
import { RecommendationsView } from "@/components/patient-recommendations/recommendations-view";
import { getContent } from "@/lib/content";
import { fill } from "@/lib/content/fill";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";
import { PROFILE_PATH } from "@/lib/patient-auth/paths";
import { requireActivePatient } from "@/lib/patient-auth/session";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return { title: getContent(locale).patientRecommendations.metaTitle };
};

/**
 * « Mes recommandations » (story 23, REM-87 and REM-88). The page reads the
 * latest validated version as the patient, and nothing else: a change that
 * the practitioner has not validated is not in a version, so it cannot show
 * (stories 19 and 20). The next validation shows at the next request.
 *
 * The patient's id comes from the session, never from the address (D-26).
 */
const PatientRecommendationsPage = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}) => {
  const locale = await resolveLocale(params);
  // No recommendation before the activation (stories 19 and 22).
  const account = await requireActivePatient(locale);
  const patientId = account.patientProfileId;
  const content = getContent(locale).patientRecommendations;

  const validated = await getValidatedProtocol(
    patientActor(patientId),
    patientId,
  );
  const view =
    validated.ok && validated.data
      ? validatedRecommendationsView(validated.data, todayAtPractice())
      : null;

  return (
    <div className="flex flex-col gap-6">
      <Link
        as={NextLink}
        href={localePath(locale, PROFILE_PATH)}
        variant="muted"
        className="inline-flex min-h-11 items-center self-start text-sm font-medium"
      >
        {content.backToProfile}
      </Link>
      <div className="flex flex-col gap-1">
        <Typography as="h1" size="2xl" weight="semibold">
          {content.title}
        </Typography>
        {view ? (
          <Typography size="sm" tone="muted">
            {fill(content.updatedOn, {
              // Noon in UTC is the same calendar day at the practice.
              date: formatDate(`${view.updatedOn}T12:00:00Z`),
            })}
          </Typography>
        ) : null}
      </div>
      {view && !view.isEmpty ? (
        <RecommendationsView view={view} content={content} />
      ) : (
        <Typography tone="muted">
          {validated.ok ? content.empty : content.unavailable}
        </Typography>
      )}
    </div>
  );
};

export default PatientRecommendationsPage;
