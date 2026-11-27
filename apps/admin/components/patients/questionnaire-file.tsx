import type {
  MandatoryQuestionnaireField,
  OptionalQuestionnaireField,
  PatientProfile,
} from "@remi/services/shared";
import {
  activityLevelDetails,
  dietLabels,
  formatDate,
  formatNumber,
  geneticTestAnswerLabels,
  mandatoryQuestionnaireFieldLabels,
  optionalQuestionnaireFieldLabels,
  sexForCalculationLabels,
} from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { fieldAnchor } from "@/components/patients/file/missing-information";
import { AbsentValue } from "@/components/patients/file/value";
import {
  listAnswer,
  type QuestionnaireView,
} from "@/components/patients/questionnaire-answers";

type FieldKey = MandatoryQuestionnaireField | OptionalQuestionnaireField;

/** One field as the file reads it. Null is « Non renseigné » (D-30). */
type Field = {
  /** Anchors the missing list's link: `#field-<key>`. */
  key:
    | FieldKey
    | "firstName"
    | "lastName"
    | "email"
    | "practitionerQuestion"
    | "practitionerAnswer";
  label: string;
  value: string | null;
};

type Section = {
  id: string;
  title: string;
  fields: readonly Field[];
  /** A line under the fields, for what the section hides on purpose. */
  note?: string;
};

type Props = {
  patient: PatientProfile;
  questionnaire: QuestionnaireView;
  /** The genetic consent is `given`. Without it the genotype stays hidden. */
  genotypeOpen: boolean;
};

const text = (value: string | null | undefined) =>
  value === null || value === undefined || value.trim() === "" ? null : value;

const kilograms = (value: number | null) =>
  value === null ? null : `${formatNumber(value, "fr-BE")} kg`;

const yesNo = (value: boolean | null) =>
  value === null ? null : value ? "Oui" : "Non";

const mandatoryLabel = (key: MandatoryQuestionnaireField) =>
  mandatoryQuestionnaireFieldLabels[key].fr;

const optionalLabel = (key: OptionalQuestionnaireField) =>
  optionalQuestionnaireFieldLabels[key].fr;

/**
 * The questionnaire half of the file (story 6): every answer in the order the
 * patient met the questions. A field shows its value or « Non renseigné ». What
 * is missing is in the action card (`MissingInformation`). Nothing here computes, defaults or guesses a
 * value (D-30): an age, a class or a total belongs to « Calculs ».
 */
export const QuestionnaireFile = ({
  patient,
  questionnaire,
  genotypeOpen,
}: Props) => {
  const answers = questionnaire.answers;
  const sections: Section[] = [
    {
      id: "identite",
      title: "Identité",
      fields: [
        { key: "firstName", label: "Prénom", value: text(patient.firstName) },
        { key: "lastName", label: "Nom", value: text(patient.lastName) },
        {
          key: "birthDate",
          label: optionalLabel("birthDate"),
          value: patient.birthDate ? formatDate(patient.birthDate) : null,
        },
        { key: "email", label: "Adresse e-mail", value: text(patient.email) },
        {
          key: "phone",
          label: optionalLabel("phone"),
          value: text(patient.phone),
        },
      ],
    },
    {
      id: "profil",
      title: "Profil",
      fields: [
        {
          key: "sexForCalculation",
          label: mandatoryLabel("sexForCalculation"),
          value: answers.sexForCalculation
            ? sexForCalculationLabels[answers.sexForCalculation].fr
            : null,
        },
        {
          key: "heightCm",
          label: mandatoryLabel("heightCm"),
          value: patient.heightCm === null ? null : `${patient.heightCm} cm`,
        },
        {
          key: "weightKg",
          label: mandatoryLabel("weightKg"),
          value: kilograms(patient.weightKg),
        },
        {
          key: "activityLevel",
          label: mandatoryLabel("activityLevel"),
          value: answers.activityLevel
            ? activityLevelDetails[answers.activityLevel].label.fr
            : null,
        },
        {
          key: "desiredWeightKg",
          label: optionalLabel("desiredWeightKg"),
          value: kilograms(answers.desiredWeightKg),
        },
      ],
    },
    {
      id: "consultation",
      title: "Consultation",
      fields: [
        {
          key: "consultationReason",
          label: mandatoryLabel("consultationReason"),
          value: text(answers.consultationReason),
        },
        {
          key: "consultationDate",
          label: mandatoryLabel("consultationDate"),
          value: answers.consultationDate
            ? formatDate(answers.consultationDate)
            : null,
        },
      ],
    },
    {
      id: "alimentation",
      title: "Alimentation",
      fields: [
        {
          key: "diet",
          label: optionalLabel("diet"),
          value: answers.diet ? dietLabels[answers.diet].fr : null,
        },
        // The note is asked only after « Autre », so it shows only then.
        ...(answers.diet === "other"
          ? [
              {
                key: "dietNote" as const,
                label: optionalLabel("dietNote"),
                value: text(answers.dietNote),
              },
            ]
          : []),
        {
          key: "allergies",
          label: mandatoryLabel("allergies"),
          value: listAnswer("allergy", questionnaire),
        },
        {
          key: "intolerances",
          label: mandatoryLabel("intolerances"),
          value: listAnswer("intolerance", questionnaire),
        },
      ],
    },
    {
      id: "sante",
      title: "Santé",
      fields: [
        {
          key: "celiacDisease",
          label: optionalLabel("celiacDisease"),
          value: yesNo(answers.celiacDisease),
        },
        {
          key: "pathologies",
          label: optionalLabel("pathologies"),
          value: text(answers.pathologies),
        },
        {
          key: "medications",
          label: optionalLabel("medications"),
          value: text(patient.medications),
        },
        {
          key: "supplements",
          label: optionalLabel("supplements"),
          value: text(patient.supplements),
        },
      ],
    },
    {
      id: "genetique",
      title: "Génétique",
      fields: [
        {
          key: "geneticTest",
          label: optionalLabel("geneticTest"),
          value: answers.geneticTest
            ? geneticTestAnswerLabels[answers.geneticTest].fr
            : null,
        },
        // Without the genetic consent, or under « Non / Je ne sais pas », the
        // service returns the genotype as null. The rows are hidden:
        // « Non renseigné » would be untrue.
        ...(genotypeOpen && answers.geneticTest === "yes"
          ? (["apoe", "dio2", "amy1a"] as const).map((key) => ({
              key,
              label: optionalLabel(key),
              value: answers[key],
            }))
          : []),
      ],
      note: !genotypeOpen
        ? "Génotype masqué : le consentement génétique n'est pas donné."
        : answers.geneticTest === "no_or_unknown"
          ? "Génotype non utilisé : la réponse au test génétique est « Non / Je ne sais pas »."
          : undefined,
    },
    // The practitioner's own question (REM-161). It shows once the patient
    // has answered, with the question as the patient read it.
    ...(text(answers.practitionerQuestionAnswer)
      ? [
          {
            id: "question-praticien",
            title: "Question du praticien",
            fields: [
              {
                key: "practitionerQuestion" as const,
                label: "Question posée",
                value: text(answers.practitionerQuestionText),
              },
              {
                key: "practitionerAnswer" as const,
                label: "Réponse",
                value: answers.practitionerQuestionAnswer,
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => (
        <div
          key={section.id}
          aria-labelledby={`questionnaire-${section.id}`}
          role="group"
          className="flex flex-col gap-2"
        >
          <Typography
            as="h3"
            id={`questionnaire-${section.id}`}
            variant="eyebrow"
            tone="muted"
          >
            {section.title}
          </Typography>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div
                key={field.key}
                id={fieldAnchor(field.key)}
                className="flex min-w-0 scroll-mt-60 flex-col gap-0.5"
              >
                <dt>
                  <Typography size="xs" tone="muted">
                    {field.label}
                  </Typography>
                </dt>
                <dd className="min-w-0">
                  {field.value === null ? (
                    <AbsentValue />
                  ) : (
                    <Typography
                      size="sm"
                      className="whitespace-pre-line break-words"
                    >
                      {field.value}
                    </Typography>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          {section.note ? (
            <Typography size="sm" tone="muted">
              {section.note}
            </Typography>
          ) : null}
        </div>
      ))}
    </div>
  );
};
