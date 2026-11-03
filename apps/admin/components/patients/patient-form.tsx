"use client";

import NextLink from "next/link";
import { useActionState, useEffect } from "react";
import type {
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
  patientSexes,
  patientStatuses,
} from "@remi/services/shared";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import {
  Badge,
  Field,
  Input,
  Separator,
  Textarea,
  Typography,
} from "@remi/ui/server";
import {
  savePatientAction,
  type PatientFormState,
} from "@/lib/patients/actions";
import { UNSET, UNSET_LABEL } from "@/lib/patients/questionnaire-form";
import { QuestionnaireFields } from "@/components/patients/questionnaire-fields";
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

/**
 * A disabled field posts nothing, so the action leaves the stored value as it
 * is. The patient gives the care consent in REMI, never the console.
 */
const CARE_CONSENT_REQUIRED =
  "Consentement requis : enregistré une fois que la personne a donné son consentement aux soins dans REMI.";

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
   * Called once a save has succeeded. The profile page collapses the form back
   * to its read summary with it; `/patients/new` redirects instead and passes
   * none.
   */
  onSaved?: () => void;
};

/** The texts the questionnaire replaced in the form, shown when one is set. */
const legacyTexts = (patient: PatientProfile) =>
  [
    { label: "Objectif", value: patient.objective },
    { label: "Régime alimentaire (texte libre)", value: patient.dietaryRegime },
    { label: "Allergies (texte libre)", value: patient.allergies },
    { label: "Intolérances (texte libre)", value: patient.intolerances },
  ].filter((row) => row.value.trim() !== "");

/**
 * One form for creating and editing — the hidden `id` decides which, so the
 * two paths cannot drift apart field by field (story 1: the practitioner
 * creates and completes the whole file, exactly as the patient would).
 *
 * The order: identity, then every questionnaire field in the questionnaire's
 * order, then the console's own fields. Only the pseudonym is needed to save.
 * A missing field never blocks a save: the file page lists what is missing.
 * Status appears only once the profile exists: a patient is created active.
 */
export const PatientForm = ({
  patient,
  questionnaire,
  genotypeOpen = false,
  careConsentGiven = false,
  onSaved,
}: Props) => {
  const [state, action, pending] = useActionState(savePatientAction, initial);

  // A caller that swapped this form in has no other way to learn the save
  // landed. `saved` only ever goes false → true within one mount — the state
  // resets with the component, and a failed save leaves it false — so the
  // notification is once per successful save, not once per render.
  useEffect(() => {
    if (state.saved) {
      onSaved?.();
    }
  }, [state.saved, onSaved]);

  // Both halves or neither: a date with no channel says nothing about what the
  // patient actually agreed through, so it still reads as not recorded.
  const consent =
    patient?.consentDate && patient.consentChannel
      ? { date: patient.consentDate, channel: patient.consentChannel }
      : null;
  const legacy = patient ? legacyTexts(patient) : [];

  return (
    <form action={action} className="flex flex-col gap-6">
      {patient ? <input type="hidden" name="id" value={patient.id} /> : null}

      <div className="flex flex-col gap-4">
        <Typography as="h3" variant="eyebrow" tone="muted">
          Identité
        </Typography>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="pseudonym"
            label="Pseudonyme"
            hint="Le nom de travail — le seul que l'IA de REMI pourra un jour voir. Le seul champ requis pour enregistrer."
          >
            <Input
              id="pseudonym"
              name="pseudonym"
              required
              defaultValue={patient?.pseudonym ?? ""}
            />
          </Field>

          <Field
            id="email"
            label="Adresse email"
            optional
            hint="Aucun email ne part à la création. Une adresse déjà sur un de vos dossiers ouvre ce dossier."
          >
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={patient?.email ?? ""}
            />
          </Field>

          <Field
            id="firstName"
            label="Prénom"
            optional
            hint={
              patient?.fullName && !patient.firstName && !patient.lastName
                ? `Nom actuel : ${patient.fullName}. Vide, il reste tel quel.`
                : "Identité réelle — ne quitte jamais cette console et le lien patient."
            }
          >
            <Input
              id="firstName"
              name="firstName"
              defaultValue={patient?.firstName ?? ""}
            />
          </Field>

          <Field id="lastName" label="Nom" optional>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={patient?.lastName ?? ""}
            />
          </Field>

          <Field id="phone" label="Téléphone" optional>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              defaultValue={patient?.phone ?? ""}
            />
          </Field>

          <Field
            id="birthDate"
            label="Date de naissance"
            optional
            hint="L'âge en est déduit ; il n'est jamais stocké."
          >
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              defaultValue={patient?.birthDate ?? ""}
            />
          </Field>

          <Field
            id="locale"
            label="Langue"
            hint="La langue dans laquelle s'affiche le lien patient."
          >
            <Select name="locale" defaultValue={patient?.locale ?? "fr"}>
              <SelectTrigger id="locale">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locales.map((locale) => (
                  <SelectItem key={locale} value={locale}>
                    {localeLabels[locale]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field id="sex" label="Sexe">
            <Select name="sex" defaultValue={patient?.sex ?? "unspecified"}>
              <SelectTrigger id="sex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {patientSexes.map((sex) => (
                  <SelectItem key={sex} value={sex}>
                    {patientSexLabels[sex]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {patient ? (
            <Field id="status" label="Statut">
              <Select name="status" defaultValue={patient.status}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {patientStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {patientStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}
        </div>
      </div>

      {patient ? (
        <>
          <Separator tone="subtle" />
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Typography as="h3" variant="eyebrow" tone="muted">
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
              Le consentement consigné à la main avant l&apos;inscription en
              ligne. Il se lit ici et ne se modifie plus : le patient donnera
              ses consentements lui-même à l&apos;inscription.
            </Typography>
          </div>
        </>
      ) : null}

      <Separator tone="subtle" />

      <QuestionnaireFields
        answers={questionnaire?.answers}
        allergens={questionnaire?.allergens}
        heightCm={patient?.heightCm ?? null}
        weightKg={patient?.weightKg ?? null}
        genotypeOpen={genotypeOpen}
        careConsentGiven={careConsentGiven}
      />

      <Separator tone="subtle" />

      <div className="flex flex-col gap-4">
        <Typography as="h3" variant="eyebrow" tone="muted">
          Suivi en consultation
        </Typography>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="medications"
            label="Traitements en cours"
            optional
            hint={
              careConsentGiven
                ? "Séparés des contraintes pour rester lisibles d'un coup d'œil."
                : CARE_CONSENT_REQUIRED
            }
          >
            <Textarea
              id="medications"
              name="medications"
              rows={3}
              disabled={!careConsentGiven}
              defaultValue={patient?.medications ?? ""}
            />
          </Field>

          <Field
            id="supplements"
            label="Compléments déjà pris, hors protocole"
            optional
            hint={
              careConsentGiven
                ? "Ce que la personne prend déjà d'elle-même — le protocole prescrit se tient plus haut."
                : CARE_CONSENT_REQUIRED
            }
          >
            <Textarea
              id="supplements"
              name="supplements"
              rows={3}
              disabled={!careConsentGiven}
              defaultValue={patient?.supplements ?? ""}
            />
          </Field>
        </div>

        <Field
          id="referral"
          label="Orientation"
          optional
          hint="Qui a orienté la personne, ou le médecin qui suit en parallèle."
        >
          <Input
            id="referral"
            name="referral"
            defaultValue={patient?.referral ?? ""}
          />
        </Field>

        <Field
          id="constraints"
          label="Contraintes médicales"
          optional
          hint="Ce qui n'est ni une allergie ni une intolérance. Visible sur le lien patient."
        >
          <Textarea
            id="constraints"
            name="constraints"
            rows={3}
            defaultValue={patient?.constraints ?? ""}
          />
        </Field>

        <Field
          id="preferences"
          label="Préférences"
          optional
          hint="Goûts, habitudes, contexte de vie. Visible sur le lien patient."
        >
          <Textarea
            id="preferences"
            name="preferences"
            rows={3}
            defaultValue={patient?.preferences ?? ""}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="likesCooking"
            label="Aime cuisiner"
            optional
            hint="Détermine à quel point une suggestion doit rester simple."
          >
            <Select
              name="likesCooking"
              defaultValue={patient?.likesCooking ?? ""}
            >
              <SelectTrigger id="likesCooking">
                <SelectValue placeholder={UNSET_LABEL} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET}>{UNSET_LABEL}</SelectItem>
                {cookingAffinities.map((affinity) => (
                  <SelectItem key={affinity} value={affinity}>
                    {cookingAffinityLabels[affinity]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            id="cookingTime"
            label="Temps disponible pour cuisiner"
            optional
            hint="Détermine à quel point une recette doit rester courte."
          >
            <Select
              name="cookingTime"
              defaultValue={patient?.cookingTime ?? ""}
            >
              <SelectTrigger id="cookingTime">
                <SelectValue placeholder={UNSET_LABEL} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET}>{UNSET_LABEL}</SelectItem>
                {cookingTimes.map((time) => (
                  <SelectItem key={time} value={time}>
                    {cookingTimeLabels[time]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            id="foodBudget"
            label="Budget alimentaire"
            optional
            hint="Ce qui garde les suggestions réalistes."
          >
            <Select name="foodBudget" defaultValue={patient?.foodBudget ?? ""}>
              <SelectTrigger id="foodBudget">
                <SelectValue placeholder={UNSET_LABEL} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET}>{UNSET_LABEL}</SelectItem>
                {foodBudgets.map((budget) => (
                  <SelectItem key={budget} value={budget}>
                    {foodBudgetLabels[budget]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field
          id="anamnesis"
          label="Anamnèse"
          optional
          hint="L'ancien bloc unique. À redistribuer dans les catégories d'anamnèse de la fiche, puis à vider. Ne s'affiche pas sur le lien patient."
        >
          <Textarea
            id="anamnesis"
            name="anamnesis"
            rows={6}
            defaultValue={patient?.anamnesis ?? ""}
          />
        </Field>
      </div>

      {legacy.length > 0 ? (
        <>
          <Separator tone="subtle" />
          <div className="flex flex-col gap-3">
            <Typography as="h3" variant="eyebrow" tone="muted">
              Anciennes notes, en lecture seule
            </Typography>
            <Typography size="sm" tone="muted">
              Le questionnaire remplace ces textes libres. Ils restent lisibles
              ici et sur le lien patient.
            </Typography>
            <dl className="grid gap-3 sm:grid-cols-2">
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
        </>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Enregistrement…"
            : patient
              ? "Enregistrer les modifications"
              : "Créer le dossier"}
        </Button>
        {state.error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {state.error}
            {state.existingId ? (
              <>
                {" "}
                <NextLink
                  href={`/patients/${state.existingId}`}
                  className="underline underline-offset-2"
                >
                  Ouvrir ce dossier
                </NextLink>
              </>
            ) : null}
          </Typography>
        ) : null}
        {state.saved && !state.error && !pending ? (
          <Typography size="sm" tone="muted" role="status">
            Enregistré.
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
