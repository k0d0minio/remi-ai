"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Badge, Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import {
  formGroupKeys,
  formGroupTitles,
  groupAnchor,
  type FormGroupKey,
} from "@/lib/patients/form-groups";

/**
 * How many mandatory answers a group still misses. Null for a group that asks
 * nothing mandatory.
 */
export type GroupStates = Readonly<Record<FormGroupKey, number | null>>;

const missingText = (count: number) =>
  count === 1
    ? "1 réponse obligatoire manquante"
    : `${count} réponses obligatoires manquantes`;

/** The short state of one group. A word, never a colour alone. */
const GroupState = ({
  missing,
  short,
}: {
  missing: number | null;
  short?: boolean;
}) => {
  if (missing === null) {
    return (
      <Typography as="span" size="xs" tone="muted">
        Facultatif
      </Typography>
    );
  }
  if (missing === 0) {
    return (
      <Badge variant="success" tone="subtle" size="sm">
        <Check aria-hidden="true" />
        Complet
      </Badge>
    );
  }
  return (
    <Badge variant="warning" tone="subtle" size="sm">
      {short
        ? `${missing} manquante${missing === 1 ? "" : "s"}`
        : missingText(missing)}
    </Badge>
  );
};

/**
 * The label of a mandatory answer: one of `mandatoryQuestionnaireFields`, the
 * answers a file needs for « Prêt pour consultation ». A missing one never
 * blocks a save.
 */
export const MandatoryLabel = ({ children }: { children: ReactNode }) => (
  <>
    {children}{" "}
    <Typography as="span" size="xs" tone="muted">
      · obligatoire
    </Typography>
  </>
);

type GroupProps = {
  group: FormGroupKey;
  missing: number | null;
  /** One line under the title. */
  note?: ReactNode;
  children: ReactNode;
};

/**
 * One group of the patient form: its title, its state and its fields. The
 * `id` is the index's target. The top margin of the scroll keeps the title
 * clear of the console's header and of the phone's index.
 */
export const FormGroup = ({ group, missing, note, children }: GroupProps) => {
  const titleId = `${groupAnchor(group)}-titre`;
  return (
    <section
      id={groupAnchor(group)}
      aria-labelledby={titleId}
      className="border-border flex scroll-mt-32 flex-col gap-4 border-t pt-5 first:border-t-0 first:pt-0"
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Typography as="h3" id={titleId} size="base" weight="semibold">
            {formGroupTitles[group]}
          </Typography>
          <GroupState missing={missing} />
        </div>
        {note ? (
          <Typography size="sm" tone="muted">
            {note}
          </Typography>
        ) : null}
      </div>
      {children}
    </section>
  );
};

const linkClass =
  "hover:bg-accent focus-visible:ring-ring flex min-h-11 items-center justify-between gap-2 rounded-md px-2 text-sm focus-visible:outline-none focus-visible:ring-[3px]";

const IndexList = ({
  states,
  onNavigate,
}: {
  states: GroupStates;
  onNavigate?: () => void;
}) => (
  <ul className="flex flex-col">
    {formGroupKeys.map((group) => (
      <li key={group}>
        <a
          href={`#${groupAnchor(group)}`}
          onClick={onNavigate}
          className={linkClass}
        >
          <span className="min-w-0">{formGroupTitles[group]}</span>
          <GroupState missing={states[group]} short />
        </a>
      </li>
    ))}
  </ul>
);

type IndexProps = {
  states: GroupStates;
};

/**
 * The index of the groups, built from the missing mandatory answers. In a wide
 * form it is a column that stays in view. In a narrow one, a phone, it is one
 * bar at the top that opens the same list. The width is the form's own, by a
 * container query, so the index follows the place the form is shown in.
 */
export const FormIndex = ({ states }: IndexProps) => {
  const [open, setOpen] = useState(false);
  const total = formGroupKeys.reduce(
    (sum, group) => sum + (states[group] ?? 0),
    0,
  );
  const summary =
    total === 0 ? "Aucune réponse obligatoire manquante" : missingText(total);

  return (
    <nav
      aria-label="Sections du dossier"
      className="bg-background @3xl:top-20 @3xl:self-start sticky top-14 z-20"
    >
      <div className="border-border @3xl:hidden border-b">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="focus-visible:ring-ring flex min-h-11 w-full items-center justify-between gap-2 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-[3px]"
        >
          <span className="flex min-w-0 flex-col">
            <Typography as="span" size="sm" weight="medium">
              Sections
            </Typography>
            <Typography as="span" size="xs" tone="muted">
              {summary}
            </Typography>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn("size-4 shrink-0", open && "rotate-180")}
          />
        </button>
        {open ? (
          <div className="pb-2">
            <IndexList states={states} onNavigate={() => setOpen(false)} />
          </div>
        ) : null}
      </div>

      <div className="@3xl:flex hidden flex-col gap-2">
        <Typography size="xs" tone="muted">
          {summary}
        </Typography>
        <IndexList states={states} />
      </div>
    </nav>
  );
};
