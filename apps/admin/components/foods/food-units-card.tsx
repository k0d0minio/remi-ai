"use client";

import { Check } from "lucide-react";
import { useActionState, useState } from "react";
import {
  FOOD_UNITS_MAX,
  type FoodRecordStatus,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
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
  Input,
  Typography,
  VisuallyHidden,
} from "@remi/ui/server";
import {
  confirmFoodUnitsAction,
  type FoodFormState,
} from "@/lib/foods/actions";

/** The units as the page gives them: plain values, dates already written. */
export type FoodUnitsView = {
  /** Null: no unit and no density were entered or proposed. */
  status: FoodRecordStatus | null;
  /** The density as a French decimal, or `""`. */
  density: string;
  units: readonly { one: string; many: string; grams: string }[];
  /** « Morgane, le 20/11/2026 à 14:02 », or null. */
  confirmedLine: string | null;
  /** « 110 g → 2 œufs »: what the confirmed units write. Empty before that. */
  examples: readonly string[];
};

type Props = {
  code: string;
  /** False: the food has no record yet, and the units wait for it. */
  hasRecord: boolean;
  view: FoodUnitsView;
};

type Row = { one: string; many: string; grams: string };

const idle: FoodFormState = { error: null, saved: null };

const emptyRow: Row = { one: "", many: "", grams: "" };

/** The rows that exist, and two empty ones to add a unit. */
const rowsOf = (units: readonly Row[]): Row[] =>
  [...units, emptyRow, emptyRow].slice(0, FOOD_UNITS_MAX);

/**
 * The kitchen units of a food (REM-190): its density, for the spoons, the
 * glass and the cup, and its own units with a weight. A person confirms them
 * here. Until then the food shows in grams.
 */
export const FoodUnitsCard = ({ code, hasRecord, view }: Props) => {
  const [density, setDensity] = useState(view.density);
  const [rows, setRows] = useState<Row[]>(rowsOf(view.units));
  const [state, action, pending] = useActionState(confirmFoodUnitsAction, idle);

  const setCell = (index: number, cell: keyof Row, value: string) =>
    setRows((current) =>
      current.map((row, at) => (at === index ? { ...row, [cell]: value } : row)),
    );

  const densityId = `food-${code}-density`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          Unités de cuisine
          {view.status === "confirmed" ? (
            <Badge variant="success" tone="subtle" size="sm">
              <Check aria-hidden="true" />
              unités confirmées
            </Badge>
          ) : view.status === "proposed" ? (
            <Badge variant="warning" tone="subtle" size="sm">
              à confirmer
            </Badge>
          ) : (
            <Badge variant="neutral" tone="subtle" size="sm">
              aucune unité
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {view.confirmedLine
            ? `Confirmées par ${view.confirmedLine}.`
            : "Toute quantité est enregistrée en grammes. Sans unité confirmée, l'aliment s'affiche en grammes."}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {!hasRecord ? (
          <Typography size="sm" tone="muted">
            Confirmez d&apos;abord la fiche de l&apos;aliment, ou demandez une
            proposition à REMI.
          </Typography>
        ) : (
          <>
            {view.status === "proposed" ? (
              <Alert variant="warning">
                <AlertTitle>Proposition de REMI, à vérifier</AlertTitle>
                <AlertDescription>
                  Ces poids ne servent à rien tant que vous ne les avez pas
                  confirmés. Corrigez-les si besoin : aucune valeur n&apos;est
                  inventée à l&apos;affichage.
                </AlertDescription>
              </Alert>
            ) : null}

            <form action={action} className="flex flex-col gap-5">
              <input type="hidden" name="code" value={code} />

              <Field
                id={densityId}
                label="Densité (grammes pour 1 ml)"
                optional
                hint="Pour un liquide ou une poudre : elle donne le poids d'une c. à café, d'une c. à soupe, d'un verre. Eau : 1 ; huile : 0,92 ; farine : 0,55. Laissez vide pour tout autre aliment."
              >
                <Input
                  id={densityId}
                  name="density"
                  inputMode="decimal"
                  autoComplete="off"
                  className="w-full sm:w-40"
                  value={density}
                  onChange={(event) => setDensity(event.target.value)}
                />
              </Field>

              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-medium">
                  Unités propres à l&apos;aliment
                </legend>
                <Typography size="xs" tone="muted">
                  Une ligne par unité : son nom au singulier, au pluriel, et
                  son poids en grammes (« œuf », « œufs », 55). Une ligne vide
                  est ignorée.
                </Typography>
                {rows.map((row, index) => (
                  <div
                    // The rows have no identity of their own: the position is it.
                    key={index}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_8rem]"
                  >
                    <VisuallyHidden>
                      <label htmlFor={`food-${code}-unit-one-${index}`}>
                        Unité {index + 1}, singulier
                      </label>
                    </VisuallyHidden>
                    <Input
                      id={`food-${code}-unit-one-${index}`}
                      name={`unit-one-${index}`}
                      placeholder="singulier : œuf"
                      autoComplete="off"
                      value={row.one}
                      onChange={(event) =>
                        setCell(index, "one", event.target.value)
                      }
                    />
                    <VisuallyHidden>
                      <label htmlFor={`food-${code}-unit-many-${index}`}>
                        Unité {index + 1}, pluriel
                      </label>
                    </VisuallyHidden>
                    <Input
                      id={`food-${code}-unit-many-${index}`}
                      name={`unit-many-${index}`}
                      placeholder="pluriel : œufs"
                      autoComplete="off"
                      value={row.many}
                      onChange={(event) =>
                        setCell(index, "many", event.target.value)
                      }
                    />
                    <VisuallyHidden>
                      <label htmlFor={`food-${code}-unit-grams-${index}`}>
                        Unité {index + 1}, poids en grammes
                      </label>
                    </VisuallyHidden>
                    <Input
                      id={`food-${code}-unit-grams-${index}`}
                      name={`unit-grams-${index}`}
                      placeholder="grammes : 55"
                      inputMode="decimal"
                      autoComplete="off"
                      value={row.grams}
                      onChange={(event) =>
                        setCell(index, "grams", event.target.value)
                      }
                    />
                  </div>
                ))}
              </fieldset>

              <div>
                <Button type="submit" disabled={pending}>
                  <Check aria-hidden="true" />
                  {pending
                    ? "Confirmation…"
                    : view.status === "confirmed"
                      ? "Confirmer la correction"
                      : "Confirmer les unités"}
                </Button>
              </div>
            </form>

            {view.examples.length > 0 ? (
              <Typography size="sm" tone="muted">
                Ce que le patient lira : {view.examples.join(" · ")}.
              </Typography>
            ) : null}

            {state.error ? (
              <Typography size="sm" className="text-error-text" role="alert">
                {state.error}
              </Typography>
            ) : null}
            {state.saved && !state.error ? (
              <Typography size="sm" tone="muted" role="status">
                {state.saved}
              </Typography>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
};
