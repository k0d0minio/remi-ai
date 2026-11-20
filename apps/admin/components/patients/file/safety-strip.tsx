import { ShieldAlert } from "lucide-react";
import {
  mandatoryQuestionnaireFieldLabels,
  mentionsCeliacDisease,
  noneKnownLabels,
  optionalQuestionnaireFieldLabels,
  safetyList,
  type SafetyList,
} from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { NOT_ENTERED } from "@/components/patients/file/value";
import type { QuestionnaireView } from "@/components/patients/questionnaire-answers";

type Props = {
  questionnaire: QuestionnaireView;
  /** The patient's text, as entered. Null or blank is no answer. */
  medications: string | null;
};

/** A value in short form. Null is no answer: it reads « Non renseigné ». */
type Short = string | null;

/** How many items of a list the strip names before « +n ». */
const SHOWN = 2;

/**
 * A list in one line. « Non renseigné » and « Aucune … connue » stay two
 * different states (D-30): a missing answer is not a safe answer.
 */
const shortList = (kind: "allergy" | "intolerance", list: SafetyList): Short => {
  if (list.state === "not_entered") {
    return null;
  }
  if (list.state === "none_known") {
    return noneKnownLabels[kind].fr;
  }
  const rest = list.items.length - SHOWN;
  const shown = list.items.slice(0, SHOWN).join(", ");
  return rest > 0 ? `${shown} +${rest}` : shown;
};

/**
 * The safety items of the header (story 6), in short form: allergies,
 * intolerances, coeliac disease and medication. It reads the same data as
 * `SafetyBlock`, which keeps the full lists, and it links to that block.
 */
export const SafetyStrip = ({ questionnaire, medications }: Props) => {
  const { answers, allergens } = questionnaire;
  const celiac = answers.celiacDisease;
  const items: { key: string; label: string; value: Short }[] = [
    {
      key: "allergies",
      label: mandatoryQuestionnaireFieldLabels.allergies.fr,
      value: shortList(
        "allergy",
        safetyList("allergy", answers.noKnownAllergies, allergens),
      ),
    },
    {
      key: "intolerances",
      label: mandatoryQuestionnaireFieldLabels.intolerances.fr,
      value: shortList(
        "intolerance",
        safetyList("intolerance", answers.noKnownIntolerances, allergens),
      ),
    },
    {
      key: "celiacDisease",
      label: optionalQuestionnaireFieldLabels.celiacDisease.fr,
      // A mention in the free text asks for a confirmation (REM-165).
      value:
        celiac !== true && mentionsCeliacDisease(answers.pathologies)
          ? "À confirmer"
          : celiac === null
            ? null
            : celiac
              ? "Oui"
              : "Non",
    },
    {
      key: "medications",
      label: optionalQuestionnaireFieldLabels.medications.fr,
      value:
        medications === null || medications.trim() === "" ? null : medications,
    },
  ];

  return (
    <div className="flex items-start gap-2">
      <ShieldAlert
        aria-hidden="true"
        className="text-warning-text mt-0.5 size-4 shrink-0"
      />
      <dl
        aria-label="Sécurité"
        className="grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-0.5 lg:grid-cols-4"
      >
        {items.map((item) => (
          <div key={item.key} className="flex min-w-0 flex-col">
            <dt>
              <Typography
                as="span"
                size="xs"
                tone="muted"
                className="block truncate"
              >
                {item.label}
              </Typography>
            </dt>
            <dd className="min-w-0">
              <Typography
                size="xs"
                weight={item.value === null ? "normal" : "medium"}
                tone={item.value === null ? "muted" : "default"}
                className="truncate"
                title={item.value ?? undefined}
              >
                {item.value ?? NOT_ENTERED}
              </Typography>
            </dd>
          </div>
        ))}
      </dl>
      <a
        href="#safety"
        className="text-muted-foreground hover:text-foreground shrink-0 text-xs underline underline-offset-2 max-sm:-my-3 max-sm:inline-flex max-sm:min-h-11 max-sm:items-center"
      >
        Détail
      </a>
    </div>
  );
};
