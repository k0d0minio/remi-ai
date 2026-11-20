import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  consentsOf,
  getPatient,
  getPatientQuestionnaire,
  missingQuestionnaireFields,
  patientActor,
} from "@remi/services/server";
import { isLocale, type Locale } from "@remi/services/shared";
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
    title: getContent(isLocale(locale) ? locale : "en").questionnaire.metaTitle,
  };
};

/** A kilogram value as the patient types it: a comma in French. */
const kilograms = (value: number | null, locale: Locale) => {
  if (value === null) {
    return "";
  }
  const typed = String(value);
  return locale === "fr" ? typed.replace(".", ",") : typed;
};

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
  const [patient, questionnaire, missing, consents] = await Promise.all([
    getPatient(patientActor(patientId), patientId),
    getPatientQuestionnaire(patientActor(patientId), patientId),
    missingQuestionnaireFields(patientActor(patientId), patientId),
    consentsOf(patientActor(patientId), patientId),
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
    weightKg: kilograms(profile.weightKg, locale),
    activityLevel: answers.activityLevel ?? "",
    desiredWeightKg: kilograms(answers.desiredWeightKg, locale),
    consultationReason: answers.consultationReason ?? "",
    consultationDate: answers.consultationDate ?? "",
    diet: answers.diet ?? "",
    dietNote: answers.dietNote ?? "",
    pathologies: answers.pathologies ?? "",
    celiacDisease: answers.celiacDisease,
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
    <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-10">
      <Wordmark />
      <QuestionnaireFlow
        locale={locale}
        text={content.questionnaire}
        values={values}
        geneticConsent={geneticConsentText(locale)}
        initialMissing={missing.data}
        initialStep={startStep(section, lastStep, missing.data)}
      />
      <SignOutButton locale={locale} label={content.signOut} />
    </main>
  );
};

export default QuestionnairePage;
