"use client";

import { Check, Sparkles } from "lucide-react";
import { useActionState, useState } from "react";
import {
  dishRoleLabels,
  dishRoles,
  type FoodRecordStatus,
} from "@remi/services/shared";
import {
  Button,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Typography,
} from "@remi/ui/server";
import {
  confirmFoodRecordAction,
  proposeFoodRecordAction,
  type FoodFormState,
} from "@/lib/foods/actions";
import type { TagGroup } from "@/components/foods/vocabulary";

/** The record as the page gives it: plain values, dates already written. */
export type FoodRecordView = {
  status: FoodRecordStatus;
  proposedByRemi: boolean;
  cookable: boolean;
  role: string | null;
  containsTags: readonly string[];
  mayContainTags: readonly string[];
  /** « Morgane, le 20/11/2026 à 14:02 », or null for a proposal. */
  confirmedLine: string | null;
  /** The name of the linked row of the gate's list, or null. */
  lexiconId: string | null;
};

type Props = {
  code: string;
  /** Null: the food has no record. */
  record: FoodRecordView | null;
  /** The tags of the compatibility gate, one group for each family. */
  groups: readonly TagGroup[];
};

const idle: FoodFormState = { error: null, saved: null };

const NO_ROLE = "none";

type TagBoxesProps = {
  name: "contains" | "mayContain";
  code: string;
  groups: readonly TagGroup[];
  chosen: ReadonlySet<string>;
  onToggle: (tag: string, on: boolean) => void;
};

/** One box for each tag of the gate, in groups by family. */
const TagBoxes = ({ name, code, groups, chosen, onToggle }: TagBoxesProps) => (
  <div className="flex flex-col gap-3">
    {groups.map((group) => (
      <fieldset key={group.family} className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium">{group.label}</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          {group.tags.map(({ tag, label }) => {
            const id = `food-${code}-${name}-${tag}`;
            return (
              <label
                key={tag}
                htmlFor={id}
                className="flex min-h-11 items-center gap-2 text-sm"
              >
                <Checkbox
                  id={id}
                  name={name}
                  value={tag}
                  checked={chosen.has(tag)}
                  onCheckedChange={(on) => onToggle(tag, on === true)}
                />
                {label}
              </label>
            );
          })}
        </div>
      </fieldset>
    ))}
  </div>
);

const useTagSet = (initial: readonly string[]) => {
  const [chosen, setChosen] = useState<ReadonlySet<string>>(new Set(initial));
  const toggle = (tag: string, on: boolean) =>
    setChosen((current) => {
      const next = new Set(current);
      if (on) {
        next.add(tag);
      } else {
        next.delete(tag);
      }
      return next;
    });
  return [chosen, toggle] as const;
};

/**
 * The record of a CIQUAL food: « cuisinable », its role in a dish and its
 * allergen tags. A person confirms it here, and corrects it first when needed.
 *
 * What the card says about a proposal is the rule of the service: until a
 * person confirms the record, REMI does not use the food and shows it as safe
 * to nobody.
 */
export const FoodRecordCard = ({ code, record, groups }: Props) => {
  const [cookable, setCookable] = useState(record?.cookable ?? true);
  const [role, setRole] = useState(record?.role ?? NO_ROLE);
  const [contains, toggleContains] = useTagSet(record?.containsTags ?? []);
  const [mayContain, toggleMayContain] = useTagSet(
    record?.mayContainTags ?? [],
  );
  const [confirmState, confirmAction, confirming] = useActionState(
    confirmFoodRecordAction,
    idle,
  );
  const [proposeState, proposeAction, proposing] = useActionState(
    proposeFoodRecordAction,
    idle,
  );

  const busy = confirming || proposing;
  const error = confirmState.error ?? proposeState.error;
  const saved = confirmState.saved ?? proposeState.saved;
  const roleId = `food-${code}-role`;
  const cookableId = `food-${code}-cookable`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          Fiche de l&apos;aliment
          {record === null ? (
            <Badge variant="neutral" tone="subtle" size="sm">
              aucune fiche
            </Badge>
          ) : record.status === "confirmed" ? (
            <Badge variant="success" tone="subtle" size="sm">
              <Check aria-hidden="true" />
              fiche confirmée
            </Badge>
          ) : (
            <Badge variant="warning" tone="subtle" size="sm">
              à confirmer
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {record?.confirmedLine
            ? `Confirmée par ${record.confirmedLine}.`
            : "REMI cuisine uniquement avec un aliment dont une personne a confirmé la fiche."}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {record && record.status === "proposed" ? (
          <Alert variant="warning">
            <AlertTitle>
              {record.proposedByRemi
                ? "Proposition de REMI, à vérifier"
                : "Fiche à confirmer"}
            </AlertTitle>
            <AlertDescription>
              Une proposition est une aide à la saisie, jamais une décision de
              sécurité. Tant que vous n&apos;avez pas confirmé cette fiche,
              REMI n&apos;utilise pas cet aliment et ne le présente pas comme
              sûr.
            </AlertDescription>
          </Alert>
        ) : null}

        <form className="flex flex-col gap-5">
          <input type="hidden" name="code" value={code} />

          <label
            htmlFor={cookableId}
            className="flex min-h-11 items-center gap-2 text-sm font-medium"
          >
            <Checkbox
              id={cookableId}
              name="cookable"
              value="yes"
              checked={cookable}
              onCheckedChange={(on) => setCookable(on === true)}
            />
            Aliment cuisinable
          </label>

          <Field
            id={roleId}
            label="Rôle dans un plat"
            hint="Obligatoire pour un aliment cuisinable."
          >
            <Select name="role" value={role} onValueChange={setRole}>
              <SelectTrigger id={roleId} className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_ROLE}>aucun rôle</SelectItem>
                {dishRoles.map((key) => (
                  <SelectItem key={key} value={key}>
                    {dishRoleLabels[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="flex flex-col gap-2">
            <Typography as="h3" size="sm" weight="semibold">
              L&apos;aliment contient
            </Typography>
            <Typography size="xs" tone="muted">
              Cochez la case précise quand l&apos;espèce est connue (« Blé »), et
              la première case de la famille quand elle ne l&apos;est pas. Aucune
              case cochée veut dire : l&apos;aliment ne contient rien de cette
              liste.
            </Typography>
            <TagBoxes
              name="contains"
              code={code}
              groups={groups}
              chosen={contains}
              onToggle={toggleContains}
            />
          </div>

          <details className="flex flex-col gap-2" open={mayContain.size > 0}>
            <summary className="min-h-11 cursor-pointer text-sm font-semibold">
              L&apos;aliment peut contenir (traces, variante fréquente) —{" "}
              {mayContain.size === 0
                ? "rien de coché"
                : `${mayContain.size} ${mayContain.size >= 2 ? "cases cochées" : "case cochée"}`}
            </summary>
            <TagBoxes
              name="mayContain"
              code={code}
              groups={groups}
              chosen={mayContain}
              onToggle={toggleMayContain}
            />
          </details>

          {record?.lexiconId ? (
            <Typography size="xs" tone="muted">
              Relié à la liste du contrôle de compatibilité : « {record.lexiconId}{" "}
              ».
            </Typography>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" formAction={confirmAction} disabled={busy}>
              <Check aria-hidden="true" />
              {confirming
                ? "Confirmation…"
                : record?.status === "confirmed"
                  ? "Confirmer la correction"
                  : "Confirmer la fiche"}
            </Button>
            {record === null ? (
              <Button
                type="submit"
                variant="outline"
                formAction={proposeAction}
                disabled={busy}
              >
                <Sparkles aria-hidden="true" />
                {proposing ? "REMI prépare la fiche…" : "Proposer une fiche"}
              </Button>
            ) : null}
          </div>
        </form>

        {error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {error}
          </Typography>
        ) : null}
        {saved && !error ? (
          <Typography size="sm" tone="muted" role="status">
            {saved}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
};
