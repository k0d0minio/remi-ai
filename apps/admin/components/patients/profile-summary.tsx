"use client";

import { Pencil } from "lucide-react";
import { useCallback, useState } from "react";
import type {
  PatientAllergen,
  PatientEditableProfileField,
  PatientProfile,
  PatientQuestionnaire,
} from "@remi/services/shared";
import {
  activityLevelDetails,
  ageInYears,
  ALL_SUB_KEY,
  allergenLabels,
  allergenSubLabels,
  allSubKeyLabel,
  dietLabels,
  geneticTestAnswerLabels,
  intoleranceLabels,
  noneKnownLabels,
  sexForCalculationLabels,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Badge, Separator, Typography } from "@remi/ui/server";
import { PatientForm } from "@/components/patients/patient-form";
import {
  cookingAffinityLabels,
  cookingTimeLabels,
  foodBudgetLabels,
  localeLabels,
  patientSexLabels,
  patientStatusLabels,
} from "@/components/patients/vocabulary";

type Props = {
  patient: PatientProfile;
  /**
   * Both dates arrive formatted. `Intl` resolves against the runtime's
   * timezone, so formatting here would render one day in Brussels and another
   * in the browser of anyone east or west of it — and disagree with the server
   * markup on hydration. The server is the one clock.
   */
  lastEditedAt: string;
  /** « Recueilli le … · WhatsApp », or `null` when it is not recorded. */
  consent: string | null;
  /** The latest `care` decision is `given`: the form unlocks the care fields. */
  careConsentGiven: boolean;
  /**
   * Per field the patient last changed from « Mon profil », the day they did —
   * formatted on the server for the same reason as the two dates above.
   */
  patientEditedOn: Partial<Record<PatientEditableProfileField, string>>;
  /** The questionnaire's answers and boxes, read and handed to the form. */
  questionnaire: {
    answers: PatientQuestionnaire;
    allergens: readonly PatientAllergen[];
  };
  /** `consultationDate`, formatted on the server like the dates above. */
  consultationDate: string | null;
  /** The patient gave the genetic consent. The form unlocks the genotype. */
  genotypeOpen: boolean;
};

/** One line of the read summary. `null` reads as an em dash. */
type Row = {
  label: string;
  value: string | null;
  /** « modifié par la patiente le … » — the value on screen is theirs. */
  patientEditedOn?: string;
};

/**
 * The profile as something to read, with the form one click behind it.
 *
 * Reading a consent date used to mean opening a five-hundred-line form and
 * scrolling past every field to find two. The summary answers the questions she
 * asks between consultations; « Modifier » swaps in the form itself, whole and
 * unchanged, for the times she is actually encoding.
 *
 * The way back is a successful save, and only that. A « Fermer » sat at the top
 * of five hundred fields — the one control reachable without scrolling — and it
 * unmounted the form, dropping whatever had been typed below it. She opens
 * « Modifier » to encode, not to look, so the control is gone rather than
 * guarded: the save collapses the form, and the revalidated summary with its new
 * « Modifié le … » says it landed where the form's own « Enregistré. » used to.
 */
export const ProfileSummary = ({
  patient,
  lastEditedAt,
  consent,
  careConsentGiven,
  patientEditedOn,
  questionnaire,
  consultationDate,
  genotypeOpen,
}: Props) => {
  const [editing, setEditing] = useState(false);

  // Stable, so the form's save notification does not re-fire on every render of
  // the page around it.
  const close = useCallback(() => setEditing(false), []);

  if (editing) {
    return (
      <PatientForm
        patient={patient}
        questionnaire={questionnaire}
        genotypeOpen={genotypeOpen}
        careConsentGiven={careConsentGiven}
        onSaved={close}
      />
    );
  }

  const age = ageInYears(patient.birthDate);

  const identity: Row[] = [
    { label: "Pseudonyme", value: patient.pseudonym },
    { label: "Nom complet", value: patient.fullName },
    { label: "Adresse email", value: patient.email },
    { label: "Téléphone", value: patient.phone },
    { label: "Langue", value: localeLabels[patient.locale] },
    { label: "Statut", value: patientStatusLabels[patient.status] },
  ];

  const measures: Row[] = [
    { label: "Âge", value: age === null ? null : `${age} ans` },
    {
      label: "Sexe",
      value:
        patient.sex === "unspecified" ? null : patientSexLabels[patient.sex],
    },
    {
      label: "Taille",
      value: patient.heightCm === null ? null : `${patient.heightCm} cm`,
    },
    {
      label: "Poids",
      value: patient.weightKg === null ? null : `${patient.weightKg} kg`,
    },
  ];

  const answers = questionnaire.answers;
  const questionnaireRows: Row[] = [
    {
      label: "Sexe utilisé pour le calcul",
      value: answers.sexForCalculation
        ? sexForCalculationLabels[answers.sexForCalculation].fr
        : null,
    },
    {
      label: "Niveau d'activité physique",
      value: answers.activityLevel
        ? activityLevelDetails[answers.activityLevel].label.fr
        : null,
    },
    {
      label: "Poids souhaité",
      value:
        answers.desiredWeightKg === null
          ? null
          : `${answers.desiredWeightKg} kg`,
    },
    { label: "Motif de consultation", value: answers.consultationReason },
    { label: "Date de consultation", value: consultationDate },
    {
      label: "Régime",
      value: answers.diet
        ? [dietLabels[answers.diet].fr, answers.dietNote]
            .filter(Boolean)
            .join(" — ")
        : null,
    },
    {
      label: "Allergies déclarées",
      value: listAnswer("allergy", answers.noKnownAllergies, questionnaire),
    },
    {
      label: "Intolérances déclarées",
      value: listAnswer(
        "intolerance",
        answers.noKnownIntolerances,
        questionnaire,
      ),
    },
    { label: "Pathologies", value: answers.pathologies },
    {
      label: "Maladie cœliaque",
      value:
        answers.celiacDisease === null
          ? null
          : answers.celiacDisease
            ? "Oui"
            : "Non",
    },
    {
      label: "Test génétique",
      value: answers.geneticTest
        ? geneticTestAnswerLabels[answers.geneticTest].fr
        : null,
    },
    {
      label: "Réponse à la question du praticien",
      value: answers.practitionerQuestionAnswer,
    },
  ];

  // The seven fields the patient also writes, each carrying the day they last
  // changed it — absent once Morgane has changed that field herself.
  const food: Row[] = [
    {
      label: "Régime alimentaire",
      value: patient.dietaryRegime,
      patientEditedOn: patientEditedOn.dietaryRegime,
    },
    {
      label: "Allergies",
      value: patient.allergies,
      patientEditedOn: patientEditedOn.allergies,
    },
    {
      label: "Intolérances",
      value: patient.intolerances,
      patientEditedOn: patientEditedOn.intolerances,
    },
    {
      label: "Aliments aimés / non aimés",
      value: patient.preferences,
      patientEditedOn: patientEditedOn.preferences,
    },
    {
      label: "Aime cuisiner",
      value:
        patient.likesCooking === null
          ? null
          : cookingAffinityLabels[patient.likesCooking],
      patientEditedOn: patientEditedOn.likesCooking,
    },
    {
      label: "Temps disponible pour cuisiner",
      value:
        patient.cookingTime === null
          ? null
          : cookingTimeLabels[patient.cookingTime],
      patientEditedOn: patientEditedOn.cookingTime,
    },
    {
      label: "Budget alimentaire",
      value:
        patient.foodBudget === null
          ? null
          : foodBudgetLabels[patient.foodBudget],
      patientEditedOn: patientEditedOn.foodBudget,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Typography size="sm" tone="muted">
          {`Modifié le ${lastEditedAt}`}
        </Typography>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setEditing(true)}
        >
          <Pencil aria-hidden="true" />
          Modifier
        </Button>
      </div>

      <SummaryGroup title="Identité" rows={identity} />
      <Separator tone="subtle" />
      <SummaryGroup title="Mesures" rows={measures} />
      <Separator tone="subtle" />
      <SummaryGroup title="Questionnaire" rows={questionnaireRows} />
      <Separator tone="subtle" />
      <SummaryGroup title="Alimentation" rows={food} />
      <Separator tone="subtle" />

      <div className="flex flex-col gap-2">
        <Typography as="h3" variant="eyebrow" tone="muted">
          Consentement
        </Typography>
        <div className="flex flex-wrap gap-2">
          {consent ? (
            <Badge variant="success" tone="subtle" size="sm">
              {consent}
            </Badge>
          ) : (
            <Badge variant="warning" tone="subtle" size="sm">
              Pas encore enregistré
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

/** One box as it reads: « Poissons : Saumon », « Autre : kiwi ». */
const boxLabel = (row: PatientAllergen) => {
  const labels: Record<string, { fr: string }> =
    row.kind === "allergy" ? allergenLabels : intoleranceLabels;
  const name = labels[row.key]?.fr ?? row.key;
  if (row.subKey === null) {
    return row.otherText ? `${name} : ${row.otherText}` : name;
  }
  const subLabels = allergenSubLabels[
    row.key as keyof typeof allergenSubLabels
  ] as Record<string, { fr: string }> | undefined;
  const sub =
    row.subKey === ALL_SUB_KEY
      ? allSubKeyLabel.fr
      : (subLabels?.[row.subKey]?.fr ?? row.subKey);
  return row.otherText
    ? `${name} : ${sub} (${row.otherText})`
    : `${name} : ${sub}`;
};

/** A list's answer as one line, or null when the list has no answer. */
const listAnswer = (
  kind: "allergy" | "intolerance",
  noneKnown: boolean | null,
  questionnaire: Props["questionnaire"],
) => {
  if (noneKnown === true) {
    return noneKnownLabels[kind].fr;
  }
  const boxes = questionnaire.allergens.filter((row) => row.kind === kind);
  return boxes.length > 0 ? boxes.map(boxLabel).join(", ") : null;
};

type GroupProps = {
  title: string;
  rows: readonly Row[];
};

const hasValue = (row: Row) => row.value !== null && row.value.trim() !== "";

/**
 * A group with nothing encoded still shows its rows when the patient touched
 * one: an allergy the patient removed is an empty field Morgane has to see.
 */
const hasContent = (row: Row) =>
  hasValue(row) || row.patientEditedOn !== undefined;

const SummaryGroup = ({ title, rows }: GroupProps) => (
  <div className="flex flex-col gap-2">
    <Typography as="h3" variant="eyebrow" tone="muted">
      {title}
    </Typography>
    {rows.some(hasContent) ? (
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5">
            <dt>
              <Typography size="xs" tone="muted">
                {row.label}
              </Typography>
            </dt>
            <dd className="flex flex-col items-start gap-1">
              <Typography size="sm" className="whitespace-pre-line">
                {hasValue(row) ? row.value : "—"}
              </Typography>
              {row.patientEditedOn ? (
                <Badge variant="info" tone="subtle" size="sm">
                  {`Modifié par la patiente le ${row.patientEditedOn}`}
                </Badge>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    ) : (
      <Typography size="sm" tone="muted">
        Rien d&apos;encodé.
      </Typography>
    )}
  </div>
);
