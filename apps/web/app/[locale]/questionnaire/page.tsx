import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  consentsOf,
  getPatient,
  getPatientQuestionnaire,
  missingQuestionnaireFields,
  patientActor,
  practitionerQuestionOf,
} from "@remi/services/server";
import { defaultLocale, isLocale } from "@remi/services/shared";
import { Wordmark } from "@remi/ui/server";
import { SignOutButton } from "@/components/patient-auth/sign-out-button";
import { getContent } from "@/lib/content";
import { requirePatient } from "@/lib/patient-auth/session";
import { geneticConsentText } from "@/lib/questionnaire/genetic-consent";
import { startStep, STEP_COOKIE } from "@/lib/questionnaire/sections";
import {
  QuestionnaireFlow,
  type QuestionnaireValues,
} from "./_components/questionnaire-flow";

/** Reads the session on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string };

type SearchParams = { section?: string | string[] };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: getContent(isLocale(locale) ? locale : defaultLocale).questionnaire
      .metaTitle,
  };
};

/** A kilogram value as the patient types it: with a comma. */
const kilograms = (value: number | null) =>
  value === null ? "" : String(value).replace(".", ",");

/**
 * The preparatory questionnaire (story 4), where a new patient lands after
 * sign-up. Behind the patient session: the patient's id comes from their
 * account, never from the URL. Without `?section`, it opens on the step the
 * patient looked at last (`startStep`).
 */
const QuestionnairePage = async ({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) => {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const account = await requirePatient(locale);
  const patientId = account.patientProfileId;
  const [patient, questionnaire, missing, consents, practitionerQuestion] =
    await Promise.all([
      getPatient(patientActor(patientId), patientId),
      getPatientQuestionnaire(patientActor(patientId), patientId),
      missingQuestionnaireFields(patientActor(patientId), patientId),
      consentsOf(patientActor(patientId), patientId),
      practitionerQuestionOf(patientActor(patientId), patientId),
    ]);
  if (!patient.ok || !questionnaire.ok || !missing.ok) {
    notFound();
  }
  const content = getContent(locale);
  const profile = patient.data;
  const answers = questionnaire.data.answers;
  const { section } = await searchParams;
  const lastStep = (await cookies()).get(STEP_COOKIE)?.value;

  const values: QuestionnaireValues = {
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    birthDate: profile.birthDate ?? "",
    email: profile.email ?? account.email,
    phone: profile.phone ?? "",
    sexForCalculation: answers.sexForCalculation ?? "",
    heightCm: profile.heightCm === null ? "" : String(profile.heightCm),
    weightKg: kilograms(profile.weightKg),
    activityLevel: answers.activityLevel ?? "",
    desiredWeightKg: kilograms(answers.desiredWeightKg),
    consultationReason: answers.consultationReason ?? "",
    consultationDate: answers.consultationDate ?? "",
    practitionerQuestionAnswer: answers.practitionerQuestionAnswer ?? "",
    diet: answers.diet ?? "",
    dietNote: answers.dietNote ?? "",
    pathologies: answers.pathologies ?? "",
    medications: profile.medications,
    supplements: profile.supplements,
    geneticTest: answers.geneticTest ?? "",
    geneticConsent: consents.genetic?.decision ?? null,
    apoe: answers.apoe ?? "",
    dio2: answers.dio2 ?? "",
    amy1a: answers.amy1a ?? "",
    noKnownAllergies: answers.noKnownAllergies,
    noKnownIntolerances: answers.noKnownIntolerances,
    allergens: questionnaire.data.allergens,
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6">
      <Wordmark />
      <QuestionnaireFlow
        locale={locale}
        text={content.questionnaire}
        dateText={content.dateEntry}
        values={values}
        practitionerQuestion={
          practitionerQuestion.ok ? practitionerQuestion.data : null
        }
        geneticConsent={geneticConsentText(locale)}
        initialMissing={missing.data}
        initialStep={startStep(section, lastStep, missing.data)}
      />
      {/* A discreet link at the page's foot (REM-156), on every step and on
          the end screen. */}
      <SignOutButton
        locale={locale}
        label={content.signOut}
        appearance="link"
        className="self-center"
      />
    </main>
  );
};

export default QuestionnairePage;
