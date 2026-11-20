"use client";

import { Plus, Save } from "lucide-react";
import { useActionState, useState } from "react";
import {
  formatIngredientLine,
  mealConfigurationSlots,
  parseIngredientLines,
  parseStepLines,
  recipeEquipment,
  recipeEquipmentLabels,
  recipeLevelLabels,
  recipeLevels,
  recipeSeasonLabels,
  recipeSeasons,
  structuredRecipeOf,
  structuredRecipeText,
  type IngredientFood,
  type MealConfigurationSlot,
  type Recipe,
  type RecipeEquipment,
  type RecipeSeason,
  type StructuredRecipe,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import { mealSlotLabels } from "@/components/patients/meal-configuration-labels";
import { ChoiceToggle } from "@/components/recipes/choice-toggle";
import {
  foodKeyOf,
  IngredientFoods,
  lineKeyOf,
  type EntriesByLine,
  type FoodsByName,
} from "@/components/recipes/ingredient-foods";
import {
  IngredientPreview,
  StepPreview,
} from "@/components/recipes/recipe-preview";
import {
  createRecipeAction,
  updateRecipeAction,
  type RecipeFormState,
} from "@/lib/recipes/actions";

const initial: RecipeFormState = { error: null, saved: false };

type Props = {
  /** Present when editing; absent on the library's create form. */
  recipe?: Recipe;
  /**
   * The CIQUAL foods that the stored recipe names, with their name and their
   * confirmed kitchen units (`ingredientFoodsByCode`). Absent on the create
   * form.
   */
  linkedFoods?: readonly IngredientFood[];
};

type Values = {
  title: string;
  description: string;
  meals: readonly MealConfigurationSlot[];
  seasons: readonly RecipeSeason[];
  portions: string;
  prepMinutes: string;
  cookMinutes: string;
  ingredients: string;
  steps: string;
  /** `""` for « Non renseigné », else « 1 », « 2 » or « 3 ». */
  level: string;
  equipment: readonly RecipeEquipment[];
  tags: string;
  body: string;
};

const minutesText = (minutes: number | null) =>
  minutes === null ? "" : String(minutes);

/**
 * The prose that the practitioner typed, or `""`. The body of a structured
 * recipe that the service wrote from its lines is not typed prose: the form
 * does not show it a second time.
 */
const typedProse = (recipe: Recipe | undefined) => {
  if (!recipe) {
    return "";
  }
  const content = structuredRecipeOf(recipe.content);
  return content && recipe.body === structuredRecipeText(content)
    ? ""
    : recipe.body;
};

const valuesOf = (recipe: Recipe | undefined): Values => {
  const content = structuredRecipeOf(recipe?.content ?? null);
  return {
    title: recipe?.title ?? "",
    description: content?.description ?? "",
    meals: content?.meals ?? [],
    seasons: content?.seasons ?? [],
    portions: content ? String(content.portions) : "",
    prepMinutes: minutesText(content?.prepMinutes ?? null),
    cookMinutes: minutesText(content?.cookMinutes ?? null),
    ingredients: content
      ? content.ingredients.map(formatIngredientLine).join("\n")
      : "",
    steps: content ? content.steps.map((step) => step.text).join("\n") : "",
    level: content?.level === undefined ? "" : String(content.level),
    equipment: content?.equipment ?? [],
    tags: recipe?.tags.join(", ") ?? "",
    body: typedProse(recipe),
  };
};

/**
 * The food of each stored line that names a CIQUAL code. A code that CIQUAL
 * does not have any more keeps its place, so that a save does not drop it
 * without a word.
 */
const foodsOf = (
  content: StructuredRecipe | null,
  linkedFoods: readonly IngredientFood[],
): FoodsByName =>
  Object.fromEntries(
    (content?.ingredients ?? []).flatMap((ingredient) => {
      const code = ingredient.foodCode;
      if (code === null) {
        return [];
      }
      const food = linkedFoods.find((entry) => entry.code === code) ?? {
        code,
        name: `Code CIQUAL ${code} (introuvable dans la table)`,
        cookable: false,
        units: null,
      };
      return [[foodKeyOf(ingredient), food] as const];
    }),
  );

/** The stored weight of each line, as a quantity in grams. */
const entriesOf = (content: StructuredRecipe | null): EntriesByLine =>
  Object.fromEntries(
    (content?.ingredients ?? []).flatMap((ingredient) =>
      ingredient.grams === undefined
        ? []
        : [
            [
              lineKeyOf(ingredient),
              { count: String(ingredient.grams).replace(".", ","), unit: "g" },
            ] as const,
          ],
    ),
  );

const toggled = <T,>(list: readonly T[], value: T): T[] =>
  list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];

/**
 * The form of a recipe (REM-90, stories 24 and 25): the title, the meals it
 * suits, the portions and the times, then two text boxes with one ingredient
 * and one step for each line. The lines are what Morgane already types, and a
 * paste of several lines works as it is. Under each box, the form shows what
 * REMI reads in the lines: the quantity, the unit and the food apart.
 *
 * Below the ingredient lines, she chooses the CIQUAL food of each line and
 * gives its quantity (REM-192): the form stores grams. The level and the
 * equipment are optional.
 *
 * Each field is held in state. A refused save thus keeps what she typed.
 */
export const RecipeForm = ({ recipe, linkedFoods = [] }: Props) => {
  const [state, action, pending] = useActionState(
    recipe ? updateRecipeAction : createRecipeAction,
    initial,
  );
  const [values, setValues] = useState(() => valuesOf(recipe));
  const [foods, setFoods] = useState<FoodsByName>(() =>
    foodsOf(structuredRecipeOf(recipe?.content ?? null), linkedFoods),
  );
  const [entries, setEntries] = useState<EntriesByLine>(() =>
    entriesOf(structuredRecipeOf(recipe?.content ?? null)),
  );
  const set = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const ingredients = parseIngredientLines(values.ingredients);
  const steps = parseStepLines(values.steps);
  const prose = typedProse(recipe);
  const wasProseOnly = recipe !== undefined && recipe.content === null;
  // A new recipe and a structured recipe need their lines. A recipe of the
  // old form can be saved as it is, until she types its lines.
  const needsLines = !wasProseOnly;

  return (
    <form action={action} className="flex flex-col gap-5">
      {recipe ? <input type="hidden" name="id" value={recipe.id} /> : null}

      {recipe?.verifiedAt ? (
        <Typography size="sm" tone="muted" role="note">
          Cette recette est vérifiée. Si vous enregistrez une modification, la
          marque « vérifiée » est retirée jusqu&apos;à une nouvelle
          vérification.
        </Typography>
      ) : null}

      <Field id="recipe-title" label="Titre">
        <Input
          id="recipe-title"
          name="title"
          required
          maxLength={140}
          value={values.title}
          onChange={(event) => set("title", event.target.value)}
          placeholder="ex. Bol de quinoa aux légumes rôtis"
        />
      </Field>

      <Field
        id="recipe-description"
        label="Description courte"
        optional
        hint="Une ou deux phrases que la personne lit en haut de la recette."
      >
        <Input
          id="recipe-description"
          name="description"
          maxLength={300}
          value={values.description}
          onChange={(event) => set("description", event.target.value)}
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <Typography as="legend" size="sm" weight="medium">
          Repas
        </Typography>
        <div className="flex flex-wrap gap-2">
          {mealConfigurationSlots.map((meal) => (
            <ChoiceToggle
              key={meal}
              name="meals"
              value={meal}
              label={mealSlotLabels[meal]}
              on={values.meals.includes(meal)}
              onToggle={() => set("meals", toggled(values.meals, meal))}
            />
          ))}
        </div>
        <Typography size="xs" tone="muted">
          Les repas auxquels la recette convient. Au moins un.
        </Typography>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field id="recipe-portions" label="Portions">
          <Input
            id="recipe-portions"
            name="portions"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            step={1}
            required={needsLines}
            value={values.portions}
            onChange={(event) => set("portions", event.target.value)}
          />
        </Field>
        <Field id="recipe-prep" label="Préparation (min)" optional>
          <Input
            id="recipe-prep"
            name="prepMinutes"
            type="number"
            inputMode="numeric"
            min={0}
            max={1440}
            step={1}
            value={values.prepMinutes}
            onChange={(event) => set("prepMinutes", event.target.value)}
          />
        </Field>
        <Field id="recipe-cook" label="Cuisson (min)" optional>
          <Input
            id="recipe-cook"
            name="cookMinutes"
            type="number"
            inputMode="numeric"
            min={0}
            max={1440}
            step={1}
            value={values.cookMinutes}
            onChange={(event) => set("cookMinutes", event.target.value)}
          />
        </Field>
      </div>

      <Field
        id="recipe-ingredients"
        label="Ingrédients"
        hint="Une ligne par ingrédient : la quantité, l'unité, puis l'aliment. Par exemple « 200 g de quinoa », « 1 c. à s. d'huile d'olive », « 2 œufs », « sel ». Vous pouvez coller plusieurs lignes en une fois."
      >
        <Textarea
          id="recipe-ingredients"
          name="ingredients"
          required={needsLines}
          rows={8}
          value={values.ingredients}
          onChange={(event) => set("ingredients", event.target.value)}
          placeholder={
            "200 g de quinoa\n1 c. à s. d'huile d'olive\n2 œufs\nsel"
          }
        />
      </Field>
      {ingredients.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Typography size="xs" tone="muted">
            Ce que REMI lit dans vos lignes. Si une ligne est mal découpée,
            corrigez son texte ci-dessus.
          </Typography>
          <IngredientPreview ingredients={ingredients} />
          <IngredientFoods
            ingredients={ingredients}
            foods={foods}
            entries={entries}
            onFoods={setFoods}
            onEntries={setEntries}
          />
        </div>
      ) : null}

      <Field
        id="recipe-steps"
        label="Étapes"
        hint="Une ligne par étape, dans l'ordre. Écrivez la température et la durée dans le texte (« Enfourner 20 min à 180 °C ») : REMI les relève."
      >
        <Textarea
          id="recipe-steps"
          name="steps"
          required={needsLines}
          rows={8}
          value={values.steps}
          onChange={(event) => set("steps", event.target.value)}
          placeholder={
            "Rincer le quinoa, puis le cuire 15 min.\nEnfourner les légumes 20 min à 180 °C."
          }
        />
      </Field>
      {steps.length > 0 ? <StepPreview steps={steps} /> : null}

      <fieldset className="flex flex-col gap-2">
        <Typography as="legend" size="sm" weight="medium">
          Saisons
        </Typography>
        <div className="flex flex-wrap gap-2">
          {recipeSeasons.map((season) => (
            <ChoiceToggle
              key={season}
              name="seasons"
              value={season}
              label={recipeSeasonLabels[season]}
              on={values.seasons.includes(season)}
              onToggle={() => set("seasons", toggled(values.seasons, season))}
            />
          ))}
        </div>
        <Typography size="xs" tone="muted">
          Aucune saison choisie : la recette convient toute l&apos;année.
        </Typography>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <Typography as="legend" size="sm" weight="medium">
          Niveau de difficulté
        </Typography>
        <div className="flex flex-wrap gap-2">
          {recipeLevels.map((level) => (
            <ChoiceToggle
              key={level}
              name="level"
              value={String(level)}
              label={recipeLevelLabels[level]}
              on={values.level === String(level)}
              onToggle={() =>
                set(
                  "level",
                  values.level === String(level) ? "" : String(level),
                )
              }
            />
          ))}
        </div>
        <Typography size="xs" tone="muted">
          Facultatif. Aucun niveau choisi : « Non renseigné ».
        </Typography>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <Typography as="legend" size="sm" weight="medium">
          Équipement nécessaire
        </Typography>
        <div className="flex flex-wrap gap-2">
          {recipeEquipment.map((item) => (
            <ChoiceToggle
              key={item}
              name="equipment"
              value={item}
              label={recipeEquipmentLabels[item]}
              on={values.equipment.includes(item)}
              onToggle={() => set("equipment", toggled(values.equipment, item))}
            />
          ))}
        </div>
        <Typography size="xs" tone="muted">
          Facultatif. Aucun équipement choisi : « Non renseigné ».
        </Typography>
      </fieldset>

      <Field
        id="recipe-tags"
        label="Étiquettes"
        optional
        hint="Séparées par des virgules — « hiver, végétarien ». Six au maximum, et vous choisissez lesquelles."
      >
        <Input
          id="recipe-tags"
          name="tags"
          value={values.tags}
          onChange={(event) => set("tags", event.target.value)}
          placeholder="hiver, végétarien"
        />
      </Field>

      {prose !== "" ? (
        <Field
          id="recipe-body"
          label="Ancien texte libre"
          hint={
            wasProseOnly
              ? "Cette recette est dans l'ancienne forme. Son texte reste lisible. Pour la structurer, recopiez ses ingrédients et ses étapes dans les deux zones ci-dessus : REMI ne lit que les lignes."
              : "Le texte d'avant la forme structurée. Il reste tel quel : REMI ne lit que les lignes ci-dessus."
          }
        >
          <Textarea
            id="recipe-body"
            name="body"
            rows={10}
            maxLength={4000}
            value={values.body}
            onChange={(event) => set("body", event.target.value)}
          />
        </Field>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending} size="sm">
          {recipe ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {pending
            ? "Enregistrement…"
            : recipe
              ? "Enregistrer"
              : "Créer la recette"}
        </Button>
        {state.error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {state.error}
          </Typography>
        ) : null}
        {state.saved && !state.error ? (
          <Typography size="sm" tone="muted" role="status">
            Enregistré.
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
