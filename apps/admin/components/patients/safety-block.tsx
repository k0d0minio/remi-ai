import { ShieldAlert } from "lucide-react";
import {
  mandatoryQuestionnaireFieldLabels,
  noneKnownLabels,
  optionalQuestionnaireFieldLabels,
  safetyList,
  strictGlutenLabel,
  type SafetyList,
} from "@remi/services/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import type { QuestionnaireView } from "@/components/patients/questionnaire-answers";

type Props = {
  questionnaire: QuestionnaireView;
  /** The patient's text, as entered. Null or blank is no answer. */
  medications: string | null;
};

const NOT_ENTERED = "Non renseigné";

const NotEntered = () => (
  <Typography size="sm" tone="muted">
    {NOT_ENTERED}
  </Typography>
);

type ListProps = {
  kind: "allergy" | "intolerance";
  list: SafetyList;
};

/**
 * One list. « Non renseigné » is muted. « Aucune … connue » is the patient's
 * own answer and reads as a value. The two never share a text (D-30).
 */
const ListValue = ({ kind, list }: ListProps) => {
  if (list.state === "not_entered") {
    return <NotEntered />;
  }
  if (list.state === "none_known") {
    return <Typography size="sm">{noneKnownLabels[kind].fr}</Typography>;
  }
  return (
    <ul className="flex flex-col gap-0.5">
      {list.items.map((item) => (
        <li key={item}>
          <Typography size="sm" weight="medium" className="break-words">
            {item}
          </Typography>
        </li>
      ))}
    </ul>
  );
};

/**
 * « Sécurité » (story 6): what must not be missed, above the questionnaire.
 * Read only. It shows what the file holds and nothing else: no default, no
 * guess. « Aliments évités » joins with the directive fields (story 13).
 */
export const SafetyBlock = ({ questionnaire, medications }: Props) => {
  const { answers, allergens } = questionnaire;
  const celiac = answers.celiacDisease;
  const medicationText =
    medications === null || medications.trim() === "" ? null : medications;
  const rows = [
    {
      key: "allergies",
      label: mandatoryQuestionnaireFieldLabels.allergies.fr,
      value: (
        <ListValue
          kind="allergy"
          list={safetyList("allergy", answers.noKnownAllergies, allergens)}
        />
      ),
    },
    {
      key: "intolerances",
      label: mandatoryQuestionnaireFieldLabels.intolerances.fr,
      value: (
        <ListValue
          kind="intolerance"
          list={safetyList(
            "intolerance",
            answers.noKnownIntolerances,
            allergens,
          )}
        />
      ),
    },
    {
      key: "celiacDisease",
      label: optionalQuestionnaireFieldLabels.celiacDisease.fr,
      value:
        celiac === null ? (
          <NotEntered />
        ) : celiac ? (
          <Typography size="sm" weight="medium" className="text-warning-text">
            {strictGlutenLabel.fr}
          </Typography>
        ) : (
          <Typography size="sm">Non</Typography>
        ),
    },
    {
      key: "medications",
      label: optionalQuestionnaireFieldLabels.medications.fr,
      value:
        medicationText === null ? (
          <NotEntered />
        ) : (
          <Typography size="sm" className="whitespace-pre-line break-words">
            {medicationText}
          </Typography>
        ),
    },
  ];

  return (
    <section
      id="safety"
      data-segment="suivi"
      aria-labelledby="safety-title"
      className="scroll-mt-32"
    >
      <Card variant="warning">
        <CardHeader>
          <CardTitle id="safety-title" className="flex items-center gap-2">
            <ShieldAlert
              aria-hidden="true"
              className="text-warning-text size-5 shrink-0"
            />
            Sécurité
          </CardTitle>
          <CardDescription>
            Ce que la personne a déclaré. À vérifier avant toute recommandation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.key} className="flex min-w-0 flex-col gap-0.5">
                <dt>
                  <Typography size="xs" tone="muted">
                    {row.label}
                  </Typography>
                </dt>
                <dd className="min-w-0">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </section>
  );
};
