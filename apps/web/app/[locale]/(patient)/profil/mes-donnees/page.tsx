import type { Metadata } from "next";
import NextLink from "next/link";
import {
  getPatient,
  getPatientQuestionnaire,
  patientActor,
} from "@remi/services/server";
import { localePath } from "@remi/services/shared";
import { Link, Typography } from "@remi/ui/server";
import {
  ProfileDataEditor,
  type ProfileDataValues,
} from "@/components/patient-profile/data-editor";
import { getContent } from "@/lib/content";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";
import { PROFILE_PATH } from "@/lib/patient-auth/paths";
import { requireActivePatient } from "@/lib/patient-auth/session";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return {
    title: getContent(locale).patientPersonalData.dataPage.metaTitle,
  };
};

/**
 * « Mes données de suivi » (story 21, REM-85): the diet, the allergies, the
 * intolerances, the activity level, the desired weight, the medications and
 * the supplements. The patient changes them at any time. Each save records
 * the change for the practitioner and writes no recommendation.
 *
 * The patient's id comes from the session, never from the address (D-26).
 */
const PatientProfileDataPage = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}) => {
  const locale = await resolveLocale(params);
  const account = await requireActivePatient(locale);
  const patientId = account.patientProfileId;
  const [patient, questionnaire] = await Promise.all([
    getPatient(patientActor(patientId), patientId),
    getPatientQuestionnaire(patientActor(patientId), patientId),
  ]);
  const content = getContent(locale);
  const text = content.patientPersonalData;

  const values: ProfileDataValues | null =
    patient.ok && questionnaire.ok
      ? {
          activityLevel: questionnaire.data.answers.activityLevel ?? "",
          desiredWeightKg:
            questionnaire.data.answers.desiredWeightKg === null
              ? ""
              : String(questionnaire.data.answers.desiredWeightKg).replace(
                  ".",
                  ",",
                ),
          diet: questionnaire.data.answers.diet ?? "",
          dietNote: questionnaire.data.answers.dietNote ?? "",
          noKnownAllergies: questionnaire.data.answers.noKnownAllergies,
          noKnownIntolerances: questionnaire.data.answers.noKnownIntolerances,
          allergens: questionnaire.data.allergens,
          medications: patient.data.medications,
          supplements: patient.data.supplements,
        }
      : null;

  return (
    <div className="flex flex-col gap-6">
      <Link
        as={NextLink}
        href={localePath(locale, PROFILE_PATH)}
        variant="muted"
        className="inline-flex min-h-11 items-center self-start text-sm font-medium"
      >
        {content.patientRecommendations.backToProfile}
      </Link>
      <Typography as="h1" size="2xl" weight="semibold">
        {text.dataPage.title}
      </Typography>
      {values ? (
        <>
          <Typography tone="muted">{text.dataPage.intro}</Typography>
          <ProfileDataEditor
            locale={locale}
            questionnaire={content.questionnaire}
            text={text.dataPage}
            values={values}
          />
        </>
      ) : (
        <Typography tone="muted">{text.unavailable}</Typography>
      )}
    </div>
  );
};

export default PatientProfileDataPage;
