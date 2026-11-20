import type { Metadata } from "next";
import NextLink from "next/link";
import {
  getPatient,
  getPatientQuestionnaire,
  getValidatedProtocol,
  patientActor,
} from "@remi/services/server";
import {
  activityLevelDetails,
  dateEntryFromIso,
  dietLabels,
  hasFoodRecommendations,
  localePath,
  noneKnownLabels,
  safetyList,
  todayAtPractice,
  validatedRecommendationsView,
  type AllergenKind,
  type Locale,
  type PatientAllergen,
} from "@remi/services/shared";
import { Link, Typography } from "@remi/ui/server";
import { SignOutButton } from "@/components/patient-auth/sign-out-button";
import { ConsentList } from "@/components/patient-consents/consent-list";
import { EditableField } from "@/components/patient-profile/editable-field";
import { FoodRecommendations } from "@/components/patient-recommendations/food-recommendations";
import { consentEntries } from "@/lib/consents/entries";
import { getContent } from "@/lib/content";
import { fill } from "@/lib/content/fill";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";
import {
  PROFILE_DATA_PATH,
  RECOMMENDATIONS_PATH,
} from "@/lib/patient-auth/paths";
import { requireActivePatient } from "@/lib/patient-auth/session";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return { title: getContent(locale).patientProfile.metaTitle };
};

/** A kilogram value as the patient types it: with a comma. `""` for none. */
const kilograms = (value: number | null) =>
  value === null ? "" : String(value).replace(".", ",");

/** One list as one line. `""` when the patient gave no answer. */
const listLine = (
  kind: AllergenKind,
  noneKnown: boolean | null,
  rows: readonly PatientAllergen[],
  locale: Locale,
) => {
  const list = safetyList(kind, noneKnown, rows, locale);
  if (list.state === "listed") {
    return list.items.join(", ");
  }
  return list.state === "none_known" ? noneKnownLabels[kind][locale] : "";
};

const entryClass =
  "bg-card flex min-h-14 flex-col justify-center gap-1 self-stretch rounded-2xl border px-4 py-3";

const groupClass = "bg-card flex flex-col gap-4 rounded-2xl border p-4";

type RowProps = {
  label: string;
  /** `""` shows as « Non renseigné »: no value is invented. */
  value: string;
  empty: string;
  /** A line below the value, in the same `dd`. */
  hint?: string;
};

/** A value with no edit control on this page. */
const Row = ({ label, value, empty, hint }: RowProps) => (
  <div className="flex flex-col gap-0.5">
    <Typography as="dt" size="sm" tone="muted">
      {label}
    </Typography>
    <dd className="flex flex-col gap-0.5">
      <Typography
        as="span"
        size="base"
        className="whitespace-pre-line break-words"
      >
        {value || empty}
      </Typography>
      {hint ? (
        <Typography as="span" size="sm" tone="muted">
          {hint}
        </Typography>
      ) : null}
    </dd>
  </div>
);

/**
 * The « Profil » tab (story 31, REM-85), in three parts and in this order:
 *
 * 1. The summary of « Mes recommandations » (story 23, REM-88): the food block
 *    of the validated version (the evictions with their period, « À
 *    favoriser », « À limiter »), then the entry to the full page. The block
 *    is the one of that page and renders from the view, so it makes no read
 *    of its own. It has no edit control: the practitioner's validated version
 *    is read-only, and no save of this tab writes it. With no validated
 *    version, or no food item in it, only the entry shows.
 * 2. « Mes informations personnelles », from the sign-up (REM-158). The phone
 *    has an edit control. The name, the birth date and the e-mail have none
 *    (the breakdown's question 2).
 * 3. The data that the patient keeps up to date (story 21): the weight is
 *    changed in place, the others on `/profil/mes-donnees`.
 *
 * Then the account: « Mes consentements » (REM-43), where the patient reads
 * each consent again and withdraws it, and the sign-out, visible and never in
 * a menu.
 *
 * The patient's id comes from the session, never from the address (D-26).
 */
const PatientProfilePage = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}) => {
  const locale = await resolveLocale(params);
  // The space opens at the activation (story 19).
  const account = await requireActivePatient(locale);
  const patientId = account.patientProfileId;
  const [patient, questionnaire, validated, consents] = await Promise.all([
    getPatient(patientActor(patientId), patientId),
    getPatientQuestionnaire(patientActor(patientId), patientId),
    // The validated version only: a change that the practitioner has not
    // validated is in no version (stories 19 and 20).
    getValidatedProtocol(patientActor(patientId), patientId),
    consentEntries(patientId, locale),
  ]);
  const content = getContent(locale);
  const text = content.patientPersonalData;
  const labels = content.questionnaire.labels;
  const errors = content.questionnaire.errors;
  const profile = patient.ok ? patient.data : null;
  const answers = questionnaire.ok ? questionnaire.data.answers : null;
  const boxes = questionnaire.ok ? questionnaire.data.allergens : [];
  const view =
    validated.ok && validated.data
      ? validatedRecommendationsView(validated.data, todayAtPractice())
      : null;
  const showsFood = view !== null && hasFoodRecommendations(view);

  const diet = answers?.diet ? dietLabels[answers.diet][locale] : "";
  const dietLine =
    answers?.diet === "other" && answers.dietNote
      ? fill(text.dietWithNote, { diet, note: answers.dietNote })
      : diet;
  const desiredWeight = kilograms(answers?.desiredWeightKg ?? null);

  return (
    <div className="flex flex-col gap-8">
      <Typography as="h1" size="2xl" weight="semibold">
        {content.patientProfile.title}
      </Typography>

      <section
        aria-labelledby={showsFood ? "profile-food" : undefined}
        className="flex flex-col gap-4"
      >
        {view && showsFood ? (
          <>
            <Typography as="h2" id="profile-food" size="lg" weight="semibold">
              {content.patientRecommendations.foodTitle}
            </Typography>
            <FoodRecommendations
              view={view}
              content={content.patientRecommendations}
            />
          </>
        ) : null}
        <Link
          as={NextLink}
          href={localePath(locale, RECOMMENDATIONS_PATH)}
          className={entryClass}
        >
          <Typography as="span" weight="semibold">
            {content.patientRecommendations.profileEntry}
          </Typography>
          <Typography as="span" size="sm" tone="muted">
            {content.patientRecommendations.profileEntryHint}
          </Typography>
        </Link>
      </section>

      <section
        aria-labelledby="profile-personal"
        className="flex flex-col gap-3"
      >
        <Typography as="h2" id="profile-personal" size="lg" weight="semibold">
          {text.personalTitle}
        </Typography>
        {profile ? (
          <>
            <Typography size="sm" tone="muted">
              {text.personalIntro}
            </Typography>
            <dl className={groupClass}>
              <Row
                label={labels.lastName}
                value={profile.lastName ?? ""}
                empty={text.empty}
              />
              <Row
                label={labels.firstName}
                value={profile.firstName ?? ""}
                empty={text.empty}
              />
              <Row
                label={labels.birthDate}
                value={dateEntryFromIso(profile.birthDate)}
                empty={text.empty}
              />
              <Row
                label={labels.email}
                value={profile.email ?? account.email}
                empty={text.empty}
                hint={content.questionnaire.hints.email}
              />
              <EditableField
                field="phone"
                label={labels.phone}
                inputLabel={labels.phone}
                hint={content.questionnaire.hints.phone}
                initial={profile.phone ?? ""}
                autoComplete="tel"
                savedMessage={text.phoneSaved}
                text={text}
                errors={errors}
              />
            </dl>
          </>
        ) : (
          <Typography tone="muted">{text.unavailable}</Typography>
        )}
      </section>

      <section aria-labelledby="profile-data" className="flex flex-col gap-3">
        <Typography as="h2" id="profile-data" size="lg" weight="semibold">
          {text.dataTitle}
        </Typography>
        {profile && answers ? (
          <>
            <Typography size="sm" tone="muted">
              {text.dataIntro}
            </Typography>
            <dl className={groupClass}>
              <EditableField
                field="weightKg"
                label={text.rows.weight}
                inputLabel={labels.mandatory.weightKg}
                hint={content.questionnaire.hints.weight}
                initial={kilograms(profile.weightKg)}
                valueTemplate={text.kilograms}
                decimal
                savedMessage={text.weightSaved}
                text={text}
                errors={errors}
              />
              <Row
                label={text.rows.desiredWeight}
                value={
                  desiredWeight
                    ? fill(text.kilograms, { value: desiredWeight })
                    : ""
                }
                empty={text.empty}
              />
              <Row
                label={text.rows.activityLevel}
                value={
                  answers.activityLevel
                    ? activityLevelDetails[answers.activityLevel].label[locale]
                    : ""
                }
                empty={text.empty}
              />
              <Row label={text.rows.diet} value={dietLine} empty={text.empty} />
              <Row
                label={text.rows.allergies}
                value={listLine(
                  "allergy",
                  answers.noKnownAllergies,
                  boxes,
                  locale,
                )}
                empty={text.empty}
              />
              <Row
                label={text.rows.intolerances}
                value={listLine(
                  "intolerance",
                  answers.noKnownIntolerances,
                  boxes,
                  locale,
                )}
                empty={text.empty}
              />
              <Row
                label={text.rows.medications}
                value={profile.medications}
                empty={text.empty}
              />
              <Row
                label={text.rows.supplements}
                value={profile.supplements}
                empty={text.empty}
              />
            </dl>
            <Link
              as={NextLink}
              href={localePath(locale, PROFILE_DATA_PATH)}
              className={entryClass}
            >
              <Typography as="span" weight="semibold">
                {text.dataLink}
              </Typography>
              <Typography as="span" size="sm" tone="muted">
                {text.dataLinkHint}
              </Typography>
            </Link>
          </>
        ) : (
          <Typography tone="muted">{text.unavailable}</Typography>
        )}
      </section>

      <section
        aria-labelledby="profile-account"
        className="flex flex-col items-start gap-4"
      >
        <Typography as="h2" id="profile-account" size="lg" weight="semibold">
          {text.accountTitle}
        </Typography>
        <div className="flex flex-col gap-3 self-stretch">
          <div className="flex flex-col gap-1">
            <Typography as="h3" size="base" weight="medium">
              {text.consentTitle}
            </Typography>
            <Typography size="sm" tone="muted">
              {content.patientConsents.intro}
            </Typography>
          </div>
          <ConsentList
            locale={locale}
            entries={consents}
            names={content.signupLink.consent.names}
            textLine={content.signupLink.consent.version}
            text={content.patientConsents}
          />
          <Typography size="sm" tone="muted">
            {content.patientConsents.deletion}
          </Typography>
        </div>
        <SignOutButton locale={locale} label={content.signOut} />
      </section>
    </div>
  );
};

export default PatientProfilePage;
