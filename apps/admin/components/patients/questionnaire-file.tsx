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
import {
  listAnswer,
  type QuestionnaireView,
} from "@/components/patients/questionnaire-answers";

type FieldKey = MandatoryQuestionnaireField | OptionalQuestionnaireField;

/** One field as the file reads it. Null is « Non renseigné » (D-30). */
type Field = {
  /** Anchors the missing list's link: `#field-<key>`. */
  key: FieldKey | "firstName" | "lastName" | "email" | "practitionerAnswer";
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
  missingMandatory: readonly MandatoryQuestionnaireField[];
  missingOptional: readonly OptionalQuestionnaireField[];
};

const fieldAnchor = (key: string) => `field-${key}`;

const NOT_ENTERED = "Non renseigné";

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
 * The questionnaire half of the file (story 6): what is missing first, then
 * every answer in the order the patient met the questions. A field shows its
 * value or « Non renseigné ». Nothing here computes, defaults or guesses a
 * value (D-30): an age, a class or a total belongs to « Calculs ».
 */
export const QuestionnaireFile = ({
  patient,
  questionnaire,
  genotypeOpen,
  missingMandatory,
  missingOptional,
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
          label: optionalLabel("consultationDate"),
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
        // Without the genetic consent the service returns the genotype as
        // null. The rows are hidden: « Non renseigné » would be untrue.
        ...(genotypeOpen
          ? (["apoe", "dio2", "amy1a"] as const).map((key) => ({
              key,
              label: optionalLabel(key),
              value: answers[key],
            }))
          : []),
      ],
      note: genotypeOpen
        ? undefined
        : "Génotype masqué : le consentement génétique n'est pas donné.",
    },
    // The practitioner's own question joins with `practitioner-free-question`.
    // Its answer shows once the patient has given one.
    ...(text(answers.practitionerQuestionAnswer)
      ? [
          {
            id: "question-praticien",
            title: "Question du praticien",
            fields: [
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
      <MissingBlock mandatory={missingMandatory} optional={missingOptional} />
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
                className="flex min-w-0 scroll-mt-32 flex-col gap-0.5"
              >
                <dt>
                  <Typography size="xs" tone="muted">
                    {field.label}
                  </Typography>
                </dt>
                <dd className="min-w-0">
                  {field.value === null ? (
                    <Typography size="sm" tone="muted">
                      {NOT_ENTERED}
                    </Typography>
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

type MissingProps = {
  mandatory: readonly MandatoryQuestionnaireField[];
  optional: readonly OptionalQuestionnaireField[];
};

/**
 * « Informations manquantes »: the empty fields, mandatory apart from optional
 * (story 6, criterion 3). Each item jumps to its field below.
 */
const MissingBlock = ({ mandatory, optional }: MissingProps) => (
  <div
    role="group"
    aria-labelledby="missing-information"
    className="border-border flex flex-col gap-3 rounded-md border p-4"
  >
    <Typography as="h3" id="missing-information" size="sm" weight="semibold">
      Informations manquantes
    </Typography>
    <MissingList
      title="Obligatoires"
      items={mandatory.map((key) => ({ key, label: mandatoryLabel(key) }))}
    />
    <MissingList
      title="Facultatives"
      items={optional.map((key) => ({ key, label: optionalLabel(key) }))}
    />
  </div>
);

type MissingListProps = {
  title: string;
  items: readonly { key: FieldKey; label: string }[];
};

const MissingList = ({ title, items }: MissingListProps) => (
  <div className="flex flex-col gap-1">
    <Typography size="xs" tone="muted">
      {`${title} · ${items.length}`}
    </Typography>
    {items.length === 0 ? (
      <Typography size="sm">Rien ne manque.</Typography>
    ) : (
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {items.map((item) => (
          <li key={item.key}>
            <a
              href={`#${fieldAnchor(item.key)}`}
              className="text-sm underline underline-offset-2"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    )}
  </div>
);
