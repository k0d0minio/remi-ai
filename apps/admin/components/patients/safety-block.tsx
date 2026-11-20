import { ShieldAlert } from "lucide-react";
import {
  mandatoryQuestionnaireFieldLabels,
  celiacToConfirm,
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
import { AbsentValue } from "@/components/patients/file/value";
import type { QuestionnaireView } from "@/components/patients/questionnaire-answers";

type Props = {
  questionnaire: QuestionnaireView;
  /** The patient's text, as entered. Null or blank is no answer. */
  medications: string | null;
};

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
    return <AbsentValue />;
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
  // The patient writes their pathologies as free text (REM-165). A mention of
  // the disease asks the practitioner to confirm. The practitioner's « Oui »
  // or « Non » ends it.
  const toConfirm = celiacToConfirm(answers);
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
      value: toConfirm ? (
        <Typography size="sm" weight="medium" className="text-warning-text">
          À confirmer : la personne cite une maladie cœliaque dans ses
          pathologies. Par précaution, le gluten est exclu strictement tant
          que vous n&apos;avez pas répondu « Oui » ou « Non » dans le profil.
          Sans réponse, la validation et l&apos;activation sont refusées.
        </Typography>
      ) : celiac === null ? (
        <AbsentValue />
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
          <AbsentValue />
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
      className="scroll-mt-60"
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
