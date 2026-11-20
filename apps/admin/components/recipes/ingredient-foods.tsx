"use client";

import { Search, X } from "lucide-react";
import { useState, useTransition } from "react";
import {
  defaultIngredientEntry,
  formatIngredientLine,
  ingredientLinkOf,
  ingredientUnitOptions,
  kitchenQuantityText,
  type IngredientEntry,
  type IngredientFood,
  type RecipeIngredient,
} from "@remi/services/shared";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Badge, Input, Typography } from "@remi/ui/server";
import { searchIngredientFoodsAction } from "@/lib/recipes/actions";

/** The food of each ingredient, by the name of the line. */
export type FoodsByName = Readonly<Record<string, IngredientFood>>;

/** The quantity that the practitioner typed, by the text of the line. */
export type EntriesByLine = Readonly<Record<string, IngredientEntry>>;

/**
 * The key of a food is the name of the line: a change of the quantity in the
 * text keeps the food. The key of a typed quantity is the whole line: a change
 * of the line drops the quantity, so that no old weight stays on a new line.
 */
export const foodKeyOf = (ingredient: Pick<RecipeIngredient, "name">) =>
  ingredient.name.trim().toLowerCase();

export const lineKeyOf = (ingredient: RecipeIngredient) =>
  formatIngredientLine(ingredient);

const gramsText = (grams: number) => `${String(grams).replace(".", ",")} g`;

type RowProps = {
  index: number;
  ingredient: RecipeIngredient;
  food: IngredientFood | undefined;
  entry: IngredientEntry | undefined;
  onFood: (food: IngredientFood | null) => void;
  onEntry: (entry: IngredientEntry) => void;
};

const IngredientFoodRow = ({
  index,
  ingredient,
  food,
  entry,
  onFood,
  onEntry,
}: RowProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<readonly IngredientFood[] | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  const search = (text: string) => {
    startTransition(async () => {
      setResults(await searchIngredientFoodsAction(text));
    });
  };

  const openPicker = () => {
    setOpen(true);
    setQuery(ingredient.name);
    search(ingredient.name);
  };

  const choose = (chosen: IngredientFood) => {
    onFood(chosen);
    setOpen(false);
    setResults(null);
  };

  const link = ingredientLinkOf(ingredient, food, entry);
  const grams = link?.grams ?? null;
  const options = ingredientUnitOptions(food?.units ?? null);
  const count =
    entry?.count ?? (grams === null ? "" : String(grams).replace(".", ","));
  const unit = entry?.unit ?? "g";
  const shown =
    grams === null ? null : kitchenQuantityText(grams, food?.units ?? null);
  const id = `recipe-ingredient-${index}`;

  return (
    <li className="flex flex-col gap-2 py-3">
      <Typography size="sm" weight="medium" className="break-words">
        {formatIngredientLine(ingredient)}
      </Typography>

      {food ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Typography size="sm" className="min-w-0 break-words">
              {food.name}
            </Typography>
            <Badge
              variant={food.cookable ? "success" : "neutral"}
              tone="subtle"
              size="sm"
            >
              {food.cookable ? "cuisinable" : "fiche non confirmée"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <Typography
                as="label"
                htmlFor={`${id}-count`}
                size="xs"
                tone="muted"
              >
                Quantité
              </Typography>
              <Input
                id={`${id}-count`}
                inputMode="decimal"
                className="w-24"
                value={count}
                onChange={(event) =>
                  onEntry({ count: event.target.value, unit })
                }
              />
            </div>
            <Select
              value={unit}
              onValueChange={(value) => onEntry({ count, unit: value })}
            >
              <SelectTrigger
                aria-label={`Unité de ${ingredient.name}`}
                className="w-40"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={openPicker}
            >
              Changer d&apos;aliment
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onFood(null)}
            >
              Retirer
            </Button>
          </div>
          <Typography size="xs" tone="muted" role="status">
            {grams === null
              ? "Indiquez la quantité : sans poids en grammes, les valeurs nutritionnelles de la recette restent « Non calculé »."
              : `Enregistré : ${gramsText(grams)}. La personne lit : ${shown ?? gramsText(grams)}.`}
          </Typography>
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={openPicker}
          >
            <Search aria-hidden="true" />
            Choisir un aliment CIQUAL
          </Button>
          <Typography size="xs" tone="muted">
            Texte libre : cet ingrédient n&apos;entre pas dans le calcul.
          </Typography>
        </div>
      )}

      {open ? (
        <div className="border-border bg-muted/40 flex flex-col gap-2 rounded-lg border p-3">
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Typography
                as="label"
                htmlFor={`${id}-search`}
                size="xs"
                tone="muted"
              >
                Chercher dans la table CIQUAL
              </Typography>
              <Input
                id={`${id}-search`}
                value={query}
                maxLength={120}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  // Enter searches. It does not save the recipe.
                  if (event.key === "Enter") {
                    event.preventDefault();
                    search(query);
                  }
                }}
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() => search(query)}
            >
              <Search aria-hidden="true" />
              {pending ? "Recherche…" : "Chercher"}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Fermer la recherche"
              onClick={() => setOpen(false)}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
          {results !== null && results.length === 0 && !pending ? (
            <Typography size="sm" tone="muted" role="status">
              Aucun aliment trouvé. Essayez un mot plus court, au singulier.
            </Typography>
          ) : null}
          {results !== null && results.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {results.map((result) => (
                <li key={result.code}>
                  <button
                    type="button"
                    onClick={() => choose(result)}
                    className="hover:bg-accent focus-visible:ring-ring flex min-h-11 w-full flex-wrap items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm focus-visible:outline-none focus-visible:ring-[3px]"
                  >
                    <span className="min-w-0 break-words">{result.name}</span>
                    {result.cookable ? (
                      <Badge variant="success" tone="subtle" size="sm">
                        cuisinable
                      </Badge>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <Typography size="xs" tone="muted">
            Les aliments « cuisinable » ont une fiche confirmée : ils viennent
            en premier. Le nom CIQUAL dit si l&apos;aliment est cru ou cuit :
            choisissez la forme que vous pesez.
          </Typography>
        </div>
      ) : null}
    </li>
  );
};

type Props = {
  ingredients: readonly RecipeIngredient[];
  foods: FoodsByName;
  entries: EntriesByLine;
  onFoods: (foods: FoodsByName) => void;
  onEntries: (entries: EntriesByLine) => void;
};

/**
 * The CIQUAL food and the weight of each ingredient line (REM-192). For each
 * line, the practitioner chooses a food of the table and gives the quantity:
 * in grams, or in a kitchen unit that a person confirmed for the food. The
 * form stores grams. A line with no food stays a free text.
 *
 * The hidden field holds one entry for each line, in the order of the lines.
 * The service reads it with `parseIngredientLinks`.
 */
export const IngredientFoods = ({
  ingredients,
  foods,
  entries,
  onFoods,
  onEntries,
}: Props) => {
  const links = ingredients.map((ingredient) =>
    ingredientLinkOf(
      ingredient,
      foods[foodKeyOf(ingredient)],
      entries[lineKeyOf(ingredient)],
    ),
  );

  const setFood = (
    ingredient: RecipeIngredient,
    food: IngredientFood | null,
  ) => {
    const key = foodKeyOf(ingredient);
    const lineKey = lineKeyOf(ingredient);
    const { [key]: _food, ...otherFoods } = foods;
    const { [lineKey]: _entry, ...otherEntries } = entries;
    onFoods(food === null ? otherFoods : { ...otherFoods, [key]: food });
    // The quantity of another food does not stay on the line.
    const proposed =
      food === null ? null : defaultIngredientEntry(ingredient, food.units);
    onEntries(
      proposed === null
        ? otherEntries
        : { ...otherEntries, [lineKey]: proposed },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="hidden"
        name="ingredientFoods"
        value={JSON.stringify(links)}
      />
      <Typography size="sm" weight="medium">
        Aliments CIQUAL et quantités en grammes
      </Typography>
      <Typography size="xs" tone="muted">
        Pour chaque ingrédient, choisissez l&apos;aliment de la table CIQUAL et
        indiquez la quantité pour toute la recette. Quand chaque ingrédient a un
        aliment et un poids, REMI calcule l&apos;estimation des valeurs
        nutritionnelles.
      </Typography>
      <ul className="border-border divide-border flex flex-col divide-y rounded-lg border px-3">
        {ingredients.map((ingredient, index) => (
          <IngredientFoodRow
            // The lines have no id, and two lines can be equal: the place is the key.
            key={index}
            index={index}
            ingredient={ingredient}
            food={foods[foodKeyOf(ingredient)]}
            entry={entries[lineKeyOf(ingredient)]}
            onFood={(food) => setFood(ingredient, food)}
            onEntry={(entry) =>
              onEntries({ ...entries, [lineKeyOf(ingredient)]: entry })
            }
          />
        ))}
      </ul>
    </div>
  );
};
