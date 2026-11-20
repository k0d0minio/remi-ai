"use client";

import NextLink from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import type {
  MandatoryQuestionnaireField,
  PatientAllergen,
  PatientProfile,
  PatientQuestionnaire,
} from "@remi/services/shared";
import {
  cookingAffinities,
  cookingTimes,
  foodBudgets,
  formatDate,
  locales,
  mandatoryQuestionnaireFieldLabels,
  missingBySection,
  missingMandatoryFields,
  patientSexes,
  patientStatuses,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import {
  Alert,
  AlertDescription,
  Badge,
  Field,
  Input,
  Textarea,
  Typography,
} from "@remi/ui/server";
import {
  savePatientAction,
  type PatientFormState,
} from "@/lib/patients/actions";
import {
  changedGroups,
  formGroupTitles,
  snapshotOf,
  type FormGroupKey,
  type FormSnapshot,
} from "@/lib/patients/form-groups";
import { completenessFrom } from "@/lib/patients/questionnaire-form";
import {
  ChoiceCards,
  FormChangeContext,
} from "@/components/patients/choice-cards";
import {
  FormGroup,
  FormIndex,
  MandatoryLabel,
  type GroupStates,
} from "@/components/patients/form-groups";
import {
  EMPTY,
  QuestionnaireFields,
} from "@/components/patients/questionnaire-fields";
import {
  consentChannelLabels,
  cookingAffinityLabels,
  cookingTimeLabels,
  foodBudgetLabels,
  localeLabels,
  patientSexLabels,
  patientStatusLabels,
} from "@/components/patients/vocabulary";

const initial: PatientFormState = { error: null, saved: false };

type Props = {
  /** Present when editing; absent on `/patients/new`. */
  patient?: PatientProfile;
  /** The questionnaire's stored answers and boxes. Absent on a new file. */
  questionnaire?: {
    answers: PatientQuestionnaire;
    allergens: readonly PatientAllergen[];
  };
  /**
   * The patient gave the genetic consent (Morgane's question 5). False on a
   * new file: nobody has consented to anything yet.
   */
  genotypeOpen?: boolean;
  /**
   * The patient's latest `care` decision is `given`. Without it, médicaments
   * and compléments are locked (story 3): a new file holds no consent yet.
   */
  careConsentGiven?: boolean;
  /**
   * Called when the practitioner leaves the form after a save, with « Revenir
   * au dossier ». The profile page puts its read summary back with it.
   * `/patients/new` redirects instead and passes none.
   */
  onSaved?: () => void;
};

/** What the form holds now: the index and the group states read it. */
type Live = {
  missing: readonly MandatoryQuestionnaireField[];
  pseudonymMissing: boolean;
};

/** What the last submit did. */
type Outcome =
  | { kind: "idle" }
  | { kind: "refused"; message: string; existingId: string | null }
  | {
      kind: "saved";
      /** The time on the practitioner's device, as « 14:32 ». */
      at: string;
      changed: readonly FormGroupKey[];
      missing: readonly MandatoryQuestionnaireField[];
    };

/** The texts the questionnaire replaced in the form, shown when one is set. */
const legacyTexts = (patient: PatientProfile) =>
  [
    { label: "Objectif", value: patient.objective },
    { label: "Régime alimentaire (texte libre)", value: patient.dietaryRegime },
    { label: "Allergies (texte libre)", value: patient.allergies },
    { label: "Intolérances (texte libre)", value: patient.intolerances },
  ].filter((row) => row.value.trim() !== "");

/** The missing mandatory answers of the stored file, before the form mounts. */
const storedMissing = (
  patient: Props["patient"],
  questionnaire: Props["questionnaire"],
) => {
  const answers = questionnaire?.answers;
  const rows = questionnaire?.allergens ?? [];
  return missingMandatoryFields({
    sexForCalculation: answers?.sexForCalculation ?? null,
    heightCm: patient?.heightCm ?? null,
    weightKg: patient?.weightKg ?? null,
    activityLevel: answers?.activityLevel ?? null,
    consultationReason: answers?.consultationReason ?? null,
    noKnownAllergies: answers?.noKnownAllergies ?? null,
    noKnownIntolerances: answers?.noKnownIntolerances ?? null,
    allergyCount: rows.filter((row) => row.kind === "allergy").length,
    intoleranceCount: rows.filter((row) => row.kind === "intolerance").length,
  });
};

const sameFields = (a: readonly string[], b: readonly string[]) =>
  a.join("|") === b.join("|");

const fieldLabels = (fields: readonly MandatoryQuestionnaireField[]) =>
  fields.map((field) => mandatoryQuestionnaireFieldLabels[field].fr).join(", ");

/**
 * One form for creating and editing — the hidden `id` decides which, so the
 * two paths cannot drift apart field by field (story 1: the practitioner
 * creates and completes the whole file, exactly as the patient would).
 *
 * One page, not a wizard: the practitioner types during a consultation and
 * jumps to any field. The six groups of the patient's questionnaire come
 * first, in the patient's order, then the two groups that only the console
 * has. The index says how many mandatory answers each group misses. Only the
 * pseudonym is needed to save. A missing answer never blocks a save.
 *
 * The submit calls the action from a handler, not from the form's `action`.
 * React resets an uncontrolled form after each form action, also after a
 * refused one: every value typed since the last save went back to the stored
 * one, with only the error on screen. The handler keeps what was typed.
 */
export const PatientForm = ({
  patient,
  questionnaire,
  genotypeOpen = false,
  careConsentGiven = false,
  onSaved,
}: Props) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });
  const [live, setLive] = useState<Live>(() => ({
    missing: storedMissing(patient, questionnaire),
    pseudonymMissing: (patient?.pseudonym ?? "").trim() === "",
  }));

  // What the form posted at the last save, or at mount. A save reports the
  // groups that differ from it.
  const baseline = useRef<FormSnapshot | null>(null);
  useEffect(() => {
    if (formRef.current && baseline.current === null) {
      baseline.current = snapshotOf(new FormData(formRef.current));
    }
  }, []);

  /** Reads the form again. The state changes only when the answer does. */
  const refresh = useCallback(() => {
    const form = formRef.current;
    if (!form) {
      return;
    }
    const data = new FormData(form);
    const missing = missingMandatoryFields(completenessFrom(data));
    const pseudonymMissing = String(data.get("pseudonym") ?? "").trim() === "";
    setLive((current) =>
      current.pseudonymMissing === pseudonymMissing &&
      sameFields(current.missing, missing)
        ? current
        : { missing, pseudonymMissing },
    );
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      // A create redirects to the new file, so it never comes back here.
      const state = await savePatientAction(initial, data);
      if (!state.saved || state.error) {
        setOutcome({
          kind: "refused",
          message: state.error ?? "L'enregistrement a échoué.",
          existingId: state.existingId ?? null,
        });
        return;
      }
      const posted = snapshotOf(data);
      setOutcome({
        kind: "saved",
        at: new Intl.DateTimeFormat("fr-BE", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
        changed: changedGroups(baseline.current ?? posted, posted),
        missing: missingMandatoryFields(completenessFrom(data)),
      });
      baseline.current = posted;
    });
  };

  // Both halves or neither: a date with no channel says nothing about what the
  // patient actually agreed through, so it still reads as not recorded.
  const consent =
    patient?.consentDate && patient.consentChannel
      ? { date: patient.consentDate, channel: patient.consentChannel }
      : null;
  const legacy = patient ? legacyTexts(patient) : [];

  const bySection = missingBySection(live.missing);
  const states: GroupStates = {
    identite: null,
    profil: bySection.profil.length,
    consultation: bySection.consultation.length,
    alimentation: bySection.alimentation.length,
    sante: null,
    genetique: null,
    dossier: live.pseudonymMissing ? 1 : 0,
    suivi: null,
  };

  return (
    <FormChangeContext.Provider value={refresh}>
      <form
        ref={formRef}
        onSubmit={submit}
        onInput={refresh}
        className="@container"
      >
        {patient ? <input type="hidden" name="id" value={patient.id} /> : null}

        <div className="@3xl:grid-cols-[14rem_minmax(0,1fr)] @3xl:gap-8 grid gap-4">
          <FormIndex states={states} />

          <div className="flex min-w-0 flex-col gap-6">
            <QuestionnaireFields
              patient={patient}
              answers={questionnaire?.answers}
              allergens={questionnaire?.allergens}
              genotypeOpen={genotypeOpen}
              careConsentGiven={careConsentGiven}
              missing={{
                identite: 0,
                profil: bySection.profil.length,
                consultation: bySection.consultation.length,
                alimentation: bySection.alimentation.length,
                sante: 0,
                genetique: 0,
              }}
            />

            <FormGroup
              group="dossier"
              missing={states.dossier}
              note="Ce que seule la console tient : le patient ne le remplit pas."
            >
              <Field
                id="pseudonym"
                label={<MandatoryLabel>Pseudonyme</MandatoryLabel>}
                hint="Le nom de travail — le seul que l'IA de REMI pourra un jour voir. Le seul champ requis pour enregistrer."
              >
                <Input
                  id="pseudonym"
                  name="pseudonym"
                  required
                  defaultValue={patient?.pseudonym ?? ""}
                />
              </Field>

              <ChoiceCards
                name="locale"
                legend="Langue"
                hint="La langue dans laquelle s'affiche le lien patient."
                clearable={false}
                initial={patient?.locale ?? "fr"}
                options={locales.map((locale) => ({
                  value: locale,
                  label: localeLabels[locale],
                }))}
              />

              <ChoiceCards
                name="sex"
                legend="Sexe"
                hint="L'identité de la personne. Le calcul utilise la réponse du groupe « Profil »."
                emptyValue="unspecified"
                initial={patient?.sex}
                options={patientSexes
                  .filter((sex) => sex !== "unspecified")
                  .map((sex) => ({
                    value: sex,
                    label: patientSexLabels[sex],
                  }))}
              />

              {patient ? (
                <ChoiceCards
                  name="status"
                  legend="Statut"
                  clearable={false}
                  initial={patient.status}
                  options={patientStatuses.map((status) => ({
                    value: status,
                    label: patientStatusLabels[status],
                  }))}
                />
              ) : null}

              {patient ? (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Typography as="h4" size="sm" weight="medium">
                      Consentement
                    </Typography>
                    {consent ? (
                      <Badge variant="success" tone="subtle" size="sm">
                        {`Recueilli le ${formatDate(consent.date)} · ${consentChannelLabels[consent.channel]}`}
                      </Badge>
                    ) : (
                      <Badge variant="warning" tone="subtle" size="sm">
                        Pas encore enregistré
                      </Badge>
                    )}
                  </div>
                  <Typography size="sm" tone="muted">
                    Le consentement consigné à la main avant l&apos;inscription
                    en ligne. Il se lit ici et ne se modifie plus : le patient
                    donnera ses consentements lui-même à l&apos;inscription.
                  </Typography>
                </div>
              ) : null}
            </FormGroup>

            <FormGroup group="suivi" missing={null}>
              <Field
                id="practitionerQuestionAnswer"
                label="Question du praticien : réponse du patient"
              >
                <Textarea
                  id="practitionerQuestionAnswer"
                  name="practitionerQuestionAnswer"
                  rows={3}
                  placeholder={EMPTY}
                  defaultValue={
                    questionnaire?.answers.practitionerQuestionAnswer ?? ""
                  }
                />
              </Field>

              <Field
                id="referral"
                label="Orientation"
                hint="Qui a orienté la personne, ou le médecin qui suit en parallèle."
              >
                <Input
                  id="referral"
                  name="referral"
                  placeholder={EMPTY}
                  defaultValue={patient?.referral ?? ""}
                />
              </Field>

              <Field
                id="constraints"
                label="Contraintes médicales"
                hint="Ce qui n'est ni une allergie ni une intolérance. Visible sur le lien patient."
              >
                <Textarea
                  id="constraints"
                  name="constraints"
                  rows={3}
                  placeholder={EMPTY}
                  defaultValue={patient?.constraints ?? ""}
                />
              </Field>

              <Field
                id="preferences"
                label="Préférences"
                hint="Goûts, habitudes, contexte de vie. Visible sur le lien patient."
              >
                <Textarea
                  id="preferences"
                  name="preferences"
                  rows={3}
                  placeholder={EMPTY}
                  defaultValue={patient?.preferences ?? ""}
                />
              </Field>

              <ChoiceCards
                name="likesCooking"
                legend="Aime cuisiner"
                hint="Détermine à quel point une suggestion doit rester simple."
                initial={patient?.likesCooking}
                options={cookingAffinities.map((affinity) => ({
                  value: affinity,
                  label: cookingAffinityLabels[affinity],
                }))}
              />

              <ChoiceCards
                name="cookingTime"
                legend="Temps disponible pour cuisiner"
                hint="Détermine à quel point une recette doit rester courte."
                initial={patient?.cookingTime}
                options={cookingTimes.map((time) => ({
                  value: time,
                  label: cookingTimeLabels[time],
                }))}
              />

              <ChoiceCards
                name="foodBudget"
                legend="Budget alimentaire"
                hint="Ce qui garde les suggestions réalistes."
                initial={patient?.foodBudget}
                options={foodBudgets.map((budget) => ({
                  value: budget,
                  label: foodBudgetLabels[budget],
                }))}
              />

              <Field
                id="anamnesis"
                label="Anamnèse"
                hint="L'ancien bloc unique. À redistribuer dans les catégories d'anamnèse de la fiche, puis à vider. Ne s'affiche pas sur le lien patient."
              >
                <Textarea
                  id="anamnesis"
                  name="anamnesis"
                  rows={6}
                  placeholder={EMPTY}
                  defaultValue={patient?.anamnesis ?? ""}
                />
              </Field>

              {legacy.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <Typography as="h4" size="sm" weight="medium">
                    Anciennes notes, en lecture seule
                  </Typography>
                  <Typography size="sm" tone="muted">
                    Le questionnaire remplace ces textes libres. Ils restent
                    lisibles ici et sur le lien patient.
                  </Typography>
                  <dl className="@xl:grid-cols-2 grid gap-3">
                    {legacy.map((row) => (
                      <div key={row.label} className="flex flex-col gap-0.5">
                        <dt>
                          <Typography size="xs" tone="muted">
                            {row.label}
                          </Typography>
                        </dt>
                        <dd>
                          <Typography size="sm" className="whitespace-pre-line">
                            {row.value}
                          </Typography>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}
            </FormGroup>

            <div className="border-border bg-background sticky bottom-0 z-10 flex flex-col gap-3 border-t py-3">
              {outcome.kind === "refused" ? (
                <Alert variant="error" role="alert">
                  <AlertDescription>
                    Rien n&apos;a été enregistré. {outcome.message}
                    {outcome.existingId ? (
                      <>
                        {" "}
                        <NextLink
                          href={`/patients/${outcome.existingId}`}
                          className="underline underline-offset-2"
                        >
                          Ouvrir ce dossier
                        </NextLink>
                      </>
                    ) : null}{" "}
                    Vos réponses restent dans le formulaire.
                  </AlertDescription>
                </Alert>
              ) : null}

              {outcome.kind === "saved" && !pending ? (
                <Alert
                  variant={outcome.missing.length > 0 ? "warning" : "success"}
                  role="status"
                >
                  <AlertDescription>
                    {outcome.changed.length > 0
                      ? `Enregistré à ${outcome.at}. Modifié : ${outcome.changed
                          .map((group) => formGroupTitles[group])
                          .join(", ")}.`
                      : `Enregistré à ${outcome.at}. Aucune réponse n'a changé.`}{" "}
                    {outcome.missing.length > 0
                      ? `Réponses obligatoires encore manquantes : ${fieldLabels(outcome.missing)}.`
                      : "Toutes les réponses obligatoires sont renseignées."}
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={pending}>
                  {pending
                    ? "Enregistrement…"
                    : patient
                      ? "Enregistrer les modifications"
                      : "Créer le dossier"}
                </Button>
                {outcome.kind === "saved" && onSaved ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={onSaved}
                  >
                    Revenir au dossier
                  </Button>
                ) : null}
                {outcome.kind === "idle" && live.missing.length > 0 ? (
                  <Typography size="sm" tone="muted">
                    Le dossier s&apos;enregistre aussi incomplet.
                  </Typography>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormChangeContext.Provider>
  );
};
