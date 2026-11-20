"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import {
  foodDirectiveFaults,
  foodDirectiveTermKey,
  foodLimitLevels,
  joinFoodDirectiveTerms,
  splitFoodDirectiveTerms,
  type FoodDirectiveDraft,
  type FoodDirectiveKind,
  type FoodLimitLevel,
  type PatientFoodDirective,
} from "@remi/services/shared";
import {
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Badge, Field, Input, Typography } from "@remi/ui/server";
import {
  LIMIT_LEVEL_NOT_SET,
  TERM_NOT_RECOGNISED,
  foodDirectiveFaultReason,
  foodDirectiveKindLabels,
  foodLimitLevelLabels,
} from "@/components/patients/food-directive-labels";
import { SectionEditFrame } from "@/components/patients/section-edit-frame";
import { saveFoodDirectivesAction } from "@/lib/patients/food-directives";

type Props = {
  patientId: string;
  pseudonym: string;
  /** The directives in force, in the order of the service. */
  directives: readonly PatientFoodDirective[];
  /** The read view, rendered by the server until edit mode opens. */
  children: ReactNode;
};

type Period = { startsOn: string; endsOn: string; durable: boolean };

type Texts = Record<FoodDirectiveKind, string>;

const NO_LEVEL = "none";

const noPeriod: Period = { startsOn: "", endsOn: "", durable: false };

const textOf = (
  directives: readonly PatientFoodDirective[],
  kind: FoodDirectiveKind,
) =>
  joinFoodDirectiveTerms(
    directives.filter((row) => row.kind === kind).map((row) => row.term),
  );

const textsOf = (directives: readonly PatientFoodDirective[]): Texts => ({
  favour: textOf(directives, "favour"),
  limit: textOf(directives, "limit"),
  exclude: textOf(directives, "exclude"),
});

/** By the key of the term. A term with no entry has no value yet. */
type Levels = Partial<Record<string, FoodLimitLevel>>;
type Periods = Partial<Record<string, Period>>;

const levelsOf = (directives: readonly PatientFoodDirective[]): Levels =>
  Object.fromEntries(
    directives.flatMap((row): [string, FoodLimitLevel][] =>
      row.kind === "limit" && row.limitLevel !== null
        ? [[foodDirectiveTermKey(row.term), row.limitLevel]]
        : [],
    ),
  );

const periodsOf = (directives: readonly PatientFoodDirective[]): Periods =>
  Object.fromEntries(
    directives
      .filter((row) => row.kind === "exclude")
      .map((row): [string, Period] => [
        foodDirectiveTermKey(row.term),
        {
          startsOn: row.startsOn ?? "",
          endsOn: row.endsOn ?? "",
          durable: row.durable,
        },
      ]),
  );

const placeholders: Texts = {
  favour: "ex. brocoli ; magnésium ; crucifères",
  limit: "ex. sucre ajouté ; café",
  exclude: "ex. kiwi ; porc",
};

/**
 * The three fields of the food directives, edited whole (REM-54, story 13).
 *
 * Each field is one line. The terms split on « ; » as she types. Each term of
 * « À limiter » has a level under the field, and each term of « Éviction
 * totale » has its period: an end date, or the durable status. The editor
 * fills no value for her. A save that the server refuses keeps the editor
 * open with what she typed.
 *
 * To disable a directive, she removes its term from the field. The row keeps
 * its history in the fold under the section.
 */
export const FoodDirectiveEditor = ({
  patientId,
  pseudonym,
  directives,
  children,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [seeded, setSeeded] = useState<readonly string[]>([]);
  const [texts, setTexts] = useState<Texts>(() => textsOf(directives));
  const [levels, setLevels] = useState(() => levelsOf(directives));
  const [periods, setPeriods] = useState(() => periodsOf(directives));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    setTexts(textsOf(directives));
    setLevels(levelsOf(directives));
    setPeriods(periodsOf(directives));
    setSeeded(directives.map((row) => row.id));
    setError(null);
    setEditing(true);
  };

  const save = (formData: FormData) => {
    startTransition(async () => {
      const result = await saveFoodDirectivesAction(formData);
      setError(result.error);
      if (result.saved) {
        setEditing(false);
      }
    });
  };

  const limitTerms = splitFoodDirectiveTerms(texts.limit);
  const evictionTerms = splitFoodDirectiveTerms(texts.exclude);
  const periodOf = (term: string) =>
    periods[foodDirectiveTermKey(term)] ?? noPeriod;
  const setPeriod = (term: string, patch: Partial<Period>) => {
    const key = foodDirectiveTermKey(term);
    setPeriods((current) => ({
      ...current,
      [key]: { ...(current[key] ?? noPeriod), ...patch },
    }));
  };

  // The same checks as the save, shown while she types. The server decides.
  const none = { limitLevel: null, startsOn: null, endsOn: null, durable: false };
  const drafts: FoodDirectiveDraft[] = [
    ...splitFoodDirectiveTerms(texts.favour).map(
      (term): FoodDirectiveDraft => ({ kind: "favour", term, ...none }),
    ),
    ...limitTerms.map(
      (term): FoodDirectiveDraft => ({ kind: "limit", term, ...none }),
    ),
    ...evictionTerms.map((term): FoodDirectiveDraft => {
      const period = periodOf(term);
      return {
        kind: "exclude",
        term,
        limitLevel: null,
        startsOn: period.startsOn === "" ? null : period.startsOn,
        endsOn: period.endsOn === "" ? null : period.endsOn,
        durable: period.durable,
      };
    }),
  ];
  const faults = foodDirectiveFaults(drafts);

  const textField = (kind: FoodDirectiveKind) => (
    <Field
      id={`food-directives-${kind}`}
      label={foodDirectiveKindLabels[kind]}
      hint="Un terme par consigne, séparés par « ; »."
    >
      <Input
        id={`food-directives-${kind}`}
        name={kind}
        value={texts[kind]}
        onChange={(event) =>
          setTexts((current) => ({ ...current, [kind]: event.target.value }))
        }
        placeholder={placeholders[kind]}
        autoComplete="off"
      />
    </Field>
  );

  const termLabel = (term: string) => (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <Typography size="sm" weight="medium" className="break-words">
        {term}
      </Typography>
      <Badge variant="warning" tone="subtle" size="sm">
        {TERM_NOT_RECOGNISED}
      </Badge>
    </div>
  );

  return (
    <SectionEditFrame
      editing={editing}
      onEdit={open}
      onCancel={() => setEditing(false)}
      pending={pending}
      error={error}
      patientId={patientId}
      pseudonym={pseudonym}
      action={save}
      editLabel="Modifier les consignes"
      readView={children}
    >
      <div className="flex flex-col gap-5">
        {seeded.map((id) => (
          <input key={id} type="hidden" name="seeded-id" value={id} />
        ))}

        {textField("favour")}

        <div className="flex flex-col gap-3">
          {textField("limit")}
          {limitTerms.map((term, index) => {
            const key = foodDirectiveTermKey(term);
            const level = levels[key];
            return (
              <div
                key={`limit-${index}-${term}`}
                className="border-border flex flex-wrap items-center justify-between gap-2 border-l-2 pl-3"
              >
                <input type="hidden" name="limit-term" value={term} />
                <input type="hidden" name="limit-level" value={level ?? ""} />
                {termLabel(term)}
                <Select
                  value={level ?? NO_LEVEL}
                  onValueChange={(value) =>
                    setLevels((current) => {
                      const next = { ...current };
                      if ((foodLimitLevels as readonly string[]).includes(value)) {
                        next[key] = value as FoodLimitLevel;
                      } else {
                        delete next[key];
                      }
                      return next;
                    })
                  }
                >
                  <SelectTrigger
                    aria-label={`Niveau de limitation de ${term}`}
                    className="min-h-11 w-48"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_LEVEL}>{LIMIT_LEVEL_NOT_SET}</SelectItem>
                    {foodLimitLevels.map((option) => (
                      <SelectItem key={option} value={option}>
                        {foodLimitLevelLabels[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          {textField("exclude")}
          {evictionTerms.length > 0 ? (
            <Typography size="sm" tone="muted">
              Chaque éviction a une date de fin ou le statut durable. Sans date
              de début, elle s&apos;applique dès l&apos;enregistrement.
            </Typography>
          ) : null}
          {evictionTerms.map((term, index) => {
            const period = periodOf(term);
            const id = `eviction-${index}`;
            return (
              <div
                key={`exclude-${index}-${term}`}
                className="border-border flex flex-col gap-2 border-l-2 pl-3"
              >
                <input type="hidden" name="exclude-term" value={term} />
                <input
                  type="hidden"
                  name="exclude-start"
                  value={period.startsOn}
                />
                <input type="hidden" name="exclude-end" value={period.endsOn} />
                <input
                  type="hidden"
                  name="exclude-durable"
                  value={period.durable ? "1" : ""}
                />
                {termLabel(term)}
                <div className="flex flex-wrap items-end gap-3">
                  <Field id={`${id}-start`} label="Début (facultatif)">
                    <Input
                      id={`${id}-start`}
                      type="date"
                      value={period.startsOn}
                      onChange={(event) =>
                        setPeriod(term, { startsOn: event.target.value })
                      }
                      className="w-44"
                    />
                  </Field>
                  <Field id={`${id}-end`} label="Fin">
                    <Input
                      id={`${id}-end`}
                      type="date"
                      value={period.endsOn}
                      disabled={period.durable}
                      onChange={(event) =>
                        setPeriod(term, { endsOn: event.target.value })
                      }
                      className="w-44"
                    />
                  </Field>
                  <label className="flex min-h-11 items-center gap-2">
                    <Checkbox
                      checked={period.durable}
                      onCheckedChange={(checked) =>
                        setPeriod(
                          term,
                          checked === true
                            ? { durable: true, endsOn: "" }
                            : { durable: false },
                        )
                      }
                    />
                    <Typography size="sm">Exclusion durable</Typography>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {faults.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {faults.map((fault, index) => (
              <li key={`${index}-${fault.code}-${fault.term}`}>
                <Typography size="sm" className="text-warning-text">
                  {foodDirectiveFaultReason(fault)}
                </Typography>
              </li>
            ))}
          </ul>
        ) : null}

        <Typography size="sm" tone="muted">
          Pour désactiver une consigne, retirez son terme du champ. Elle reste
          dans l&apos;historique.
        </Typography>
      </div>
    </SectionEditFrame>
  );
};
