/**
 * The structured recipe — REM-90, stories 24 and 25, decisions D-30 and D-34.
 *
 * One zod schema is the definition that the template of the library, the
 * recipe generated for a patient, the recipe page, the shopping list and the
 * weekly plan share. The title is not in it: each table has its own column.
 *
 * The module is isomorphic. It reads no table and no clock. The console form
 * and the service that saves a recipe use the same parsers, so the preview
 * that the practitioner sees is what the service stores.
 */

import { z } from "zod";
import type { GateFood } from "../ai/compatibility";
import { mealSlots } from "./meal-configuration";

/* ───────────────────────── vocabulary ───────────────────────── */

/**
 * The units of an ingredient line. A closed list, so that a shopping list can
 * add two lines of the same food. An ingredient with a count and no unit
 * (« 2 œufs ») has the unit null.
 */
export const recipeUnits = [
  "g",
  "kg",
  "ml",
  "cl",
  "l",
  "tsp",
  "tbsp",
  "pinch",
  "piece",
  "slice",
  "clove",
  "handful",
  "bunch",
  "sprig",
  "leaf",
  "can",
  "pot",
  "sachet",
  "glass",
] as const;

export type RecipeUnit = (typeof recipeUnits)[number];

/** The French text of a unit, for a quantity below 2 and for 2 and more. */
export const recipeUnitLabels: Record<
  RecipeUnit,
  { one: string; many: string }
> = {
  g: { one: "g", many: "g" },
  kg: { one: "kg", many: "kg" },
  ml: { one: "ml", many: "ml" },
  cl: { one: "cl", many: "cl" },
  l: { one: "l", many: "l" },
  tsp: { one: "c. à c.", many: "c. à c." },
  tbsp: { one: "c. à s.", many: "c. à s." },
  pinch: { one: "pincée", many: "pincées" },
  piece: { one: "pièce", many: "pièces" },
  slice: { one: "tranche", many: "tranches" },
  clove: { one: "gousse", many: "gousses" },
  handful: { one: "poignée", many: "poignées" },
  bunch: { one: "botte", many: "bottes" },
  sprig: { one: "brin", many: "brins" },
  leaf: { one: "feuille", many: "feuilles" },
  can: { one: "boîte", many: "boîtes" },
  pot: { one: "pot", many: "pots" },
  sachet: { one: "sachet", many: "sachets" },
  glass: { one: "verre", many: "verres" },
};

/** The seasons of a recipe. An empty list means the whole year. */
export const recipeSeasons = ["spring", "summer", "autumn", "winter"] as const;

export type RecipeSeason = (typeof recipeSeasons)[number];

export const recipeSeasonLabels: Record<RecipeSeason, string> = {
  spring: "Printemps",
  summer: "Été",
  autumn: "Automne",
  winter: "Hiver",
};

/**
 * The equipment that a recipe can need (REM-192). The closed list of section
 * 7.3 of the recipe plan: the same list that the patient will answer.
 */
export const recipeEquipment = [
  "oven",
  "hob",
  "microwave",
  "blender",
  "steamer",
] as const;

export type RecipeEquipment = (typeof recipeEquipment)[number];

export const recipeEquipmentLabels: Record<RecipeEquipment, string> = {
  oven: "Four",
  hob: "Plaques de cuisson",
  microwave: "Micro-ondes",
  blender: "Mixeur",
  steamer: "Cuit-vapeur",
};

/** The difficulty of a recipe: 1 is the easiest (section 7.3 of the plan). */
export const recipeLevels = [1, 2, 3] as const;

export type RecipeLevel = (typeof recipeLevels)[number];

export const recipeLevelLabels: Readonly<Record<RecipeLevel, string>> = {
  1: "1 — facile",
  2: "2 — intermédiaire",
  3: "3 — avancé",
};

/* ───────────────────────── schema ───────────────────────── */

/**
 * REM-192 added fields to the structure: `grams` on an ingredient, `technique`
 * and `uses` on a step, `skeleton`, `level` and `equipment` on the recipe.
 * Each one is optional, and an absent field has no key. Thus a recipe that was
 * stored before REM-192 parses to the same value as before, and a save of it
 * writes the same document.
 */

const MAX_MINUTES = 1440;

const minutesSchema = z
  .number("a time runs from 0 to 1440 minutes")
  .int("a time runs from 0 to 1440 minutes")
  .min(0, "a time runs from 0 to 1440 minutes")
  .max(MAX_MINUTES, "a time runs from 0 to 1440 minutes")
  .nullable();

export const recipeIngredientSchema = z
  .object({
    /** Null when the recipe gives no quantity: « sel », « poivre ». */
    quantity: z
      .number("that quantity is not valid")
      .positive("that quantity is not valid")
      .max(100_000, "that quantity is not valid")
      .nullable(),
    /** Null for a count (« 2 œufs ») and for a line with no quantity. */
    unit: z.enum(recipeUnits).nullable(),
    /**
     * The food alone, with no quantity and no unit: « quinoa », « huile
     * d'olive ». The compatibility gate reads this value.
     */
    name: z
      .string()
      .trim()
      .min(1, "an ingredient needs a food name")
      .max(120, "that recipe text is too long"),
    /** The preparation of the food: « émincé », « bien mûres ». Can be empty. */
    note: z.string().trim().max(160, "that recipe text is too long"),
    /** The CIQUAL code of the food when it is matched, or null. */
    foodCode: z.string().trim().min(1).max(20).nullable(),
    /**
     * The weight of the line in grams, for all the portions of the recipe
     * (REM-190: each quantity is a weight). Absent when the weight is not
     * known. The line then has no part in a nutrient estimate.
     */
    grams: z
      .number("that quantity is not valid")
      .positive("that quantity is not valid")
      .max(100_000, "that quantity is not valid")
      .optional(),
  })
  .refine(
    (ingredient) => ingredient.unit === null || ingredient.quantity !== null,
    {
      message: "a unit needs a quantity",
    },
  );

export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;

export const recipeStepSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "a step needs a text")
    .max(600, "that recipe text is too long"),
  /** The oven temperature of the step in °C, or null. */
  temperatureC: z.number().int().min(30).max(300).nullable(),
  /** The duration of the step in minutes, or null. */
  durationMinutes: z.number().int().min(1).max(MAX_MINUTES).nullable(),
  /**
   * The key of the technique of the step (« saute », « boil »). A data field:
   * the technique table of REM-193 gives the keys. Absent when not named.
   */
  technique: z
    .string()
    .trim()
    .min(1, "that recipe is not valid")
    .max(60, "that recipe text is too long")
    .optional(),
  /**
   * The ingredients that the step uses, as places in `ingredients` (0 is the
   * first line). Absent when not named.
   */
  uses: z
    .array(z.number().int().min(0).max(39))
    .max(40)
    .transform((uses) => [...new Set(uses)].sort((a, b) => a - b))
    .optional(),
});

export type RecipeStep = z.infer<typeof recipeStepSchema>;

/**
 * The structured recipe. The order of `steps` is the order of the recipe.
 * A null time is « Non renseigné »: REMI invents no time (D-30).
 */
export const structuredRecipeSchema = z
  .object({
    /** One or two sentences. Can be empty. */
    description: z.string().trim().max(300, "that recipe text is too long"),
    prepMinutes: minutesSchema,
    cookMinutes: minutesSchema,
    /** The number of portions that the quantities are written for. */
    portions: z
      .number("the number of portions runs from 1 to 50")
      .int("the number of portions runs from 1 to 50")
      .min(1, "the number of portions runs from 1 to 50")
      .max(50, "the number of portions runs from 1 to 50"),
    /** The meals that the recipe suits. At least one. */
    meals: z
      .array(z.enum(mealSlots))
      .min(1, "choose at least one meal for this recipe")
      .max(mealSlots.length)
      .transform((meals) => mealSlots.filter((meal) => meals.includes(meal))),
    /** The seasons of the recipe. An empty list means the whole year. */
    seasons: z
      .array(z.enum(recipeSeasons))
      .max(recipeSeasons.length)
      .transform((seasons) =>
        recipeSeasons.filter((season) => seasons.includes(season)),
      ),
    ingredients: z
      .array(recipeIngredientSchema)
      .min(1, "a recipe needs at least one ingredient")
      .max(40, "a recipe has 40 ingredients at most"),
    steps: z
      .array(recipeStepSchema)
      .min(1, "a recipe needs at least one step")
      .max(30, "a recipe has 30 steps at most"),
    /**
     * The key of the dish skeleton that the recipe comes from (REM-193). A data
     * field. Absent for a recipe that a person wrote with no skeleton.
     */
    skeleton: z
      .string()
      .trim()
      .min(1, "that recipe is not valid")
      .max(80, "that recipe text is too long")
      .optional(),
    /** The difficulty, 1 to 3. Absent: « Non renseigné ». */
    level: z
      .number("that recipe is not valid")
      .int("that recipe is not valid")
      .min(1, "that recipe is not valid")
      .max(3, "that recipe is not valid")
      .optional(),
    /** The equipment that the recipe needs. Absent: « Non renseigné ». */
    equipment: z
      .array(z.enum(recipeEquipment))
      .max(recipeEquipment.length)
      .transform((equipment) =>
        recipeEquipment.filter((item) => equipment.includes(item)),
      )
      .optional(),
  })
  .refine(
    (recipe) =>
      recipe.steps.every((step) =>
        (step.uses ?? []).every((place) => place < recipe.ingredients.length),
      ),
    { message: "a step names an ingredient that the recipe does not have" },
  );

export type StructuredRecipe = z.infer<typeof structuredRecipeSchema>;

/**
 * The stored value as a structured recipe, or null when it is not one. A
 * reader of a jsonb column uses this: it never trusts the stored shape.
 */
export const structuredRecipeOf = (value: unknown): StructuredRecipe | null => {
  const parsed = structuredRecipeSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
};

/**
 * The recipe as the item that `checkCompatibility` reads (`ai/compatibility`):
 * one food name for each ingredient, with no quantity and no unit.
 *
 * `foods` holds the food record of the CIQUAL codes of the recipe
 * (`recipeFoodsByCode`). The rule of REM-192, which never makes the gate
 * weaker (D-30):
 * - The gate reads the name of each ingredient, as before. The patient reads
 *   that name, thus the gate reads it too, with or without a CIQUAL code.
 * - When the code has a record that a person confirmed as « cuisinable », the
 *   gate also reads the tags of that record. The record adds a check. It
 *   replaces none.
 * - A code with no confirmed record adds nothing: a CIQUAL code alone is
 *   never a proof that a food is safe.
 */
export const recipeGateItem = (
  recipe: Pick<StructuredRecipe, "ingredients">,
  foods: ReadonlyMap<string, GateFood> = new Map(),
): { kind: "recipe"; ingredients: { name: string; food?: GateFood }[] } => ({
  kind: "recipe",
  ingredients: recipe.ingredients.flatMap(({ name, foodCode }) => {
    const food = foodCode === null ? undefined : foods.get(foodCode);
    return food && food.status === "confirmed" && food.cookable
      ? [{ name }, { name, food }]
      : [{ name }];
  }),
});

/** Preparation and cooking together, or null when both are unknown. */
export const recipeTotalMinutes = (
  recipe: Pick<StructuredRecipe, "prepMinutes" | "cookMinutes">,
): number | null =>
  recipe.prepMinutes === null && recipe.cookMinutes === null
    ? null
    : (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);

/* ───────────────────────── ingredient lines ───────────────────────── */

const UNICODE_FRACTIONS: Readonly<Record<string, number>> = {
  "½": 0.5,
  "¼": 0.25,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
};

/** A unit is not followed by a letter or a digit: « g » is not « gousses ». */
const END = "(?![\\p{L}\\d])";

const unitPattern = (source: string) =>
  new RegExp(`^(?:${source})${END}`, "iu");

/** The first pattern that matches wins: the long forms come first. */
const UNIT_PATTERNS: readonly (readonly [RecipeUnit, RegExp])[] = [
  [
    "tbsp",
    unitPattern(
      "cuill[eè]res?\\s+[àa]\\s+soupe|c\\.?\\s*[àa]\\.?\\s*s\\.?|c[àa]s",
    ),
  ],
  [
    "tsp",
    unitPattern(
      "cuill[eè]res?\\s+[àa]\\s+caf[ée]|c\\.?\\s*[àa]\\.?\\s*c\\.?|c[àa]c",
    ),
  ],
  ["kg", unitPattern("kilogrammes?|kilos?|kg")],
  ["g", unitPattern("grammes?|gr\\.?|g")],
  ["ml", unitPattern("millilitres?|ml")],
  ["cl", unitPattern("centilitres?|cl")],
  ["l", unitPattern("litres?|l")],
  ["pinch", unitPattern("pinc[ée]es?")],
  ["piece", unitPattern("pi[eè]ces?")],
  ["slice", unitPattern("tranches?")],
  ["clove", unitPattern("gousses?")],
  ["handful", unitPattern("poign[ée]es?")],
  ["bunch", unitPattern("bottes?")],
  ["sprig", unitPattern("brins?")],
  ["leaf", unitPattern("feuilles?")],
  ["can", unitPattern("bo[iî]tes?")],
  ["pot", unitPattern("pots?")],
  ["sachet", unitPattern("sachets?")],
  ["glass", unitPattern("verres?")],
];

const BULLET = /^(?:[-–—•*·]\s*)+/u;
const NUMBER = /^(\d+(?:[.,]\d+)?)(?:\s*\/\s*(\d+))?/u;
const ONE_WORD = /^(?:une?)\s+/iu;
const LINK_WORD = /^(?:de\s+|d['’]\s*)/iu;

const round = (value: number) => Math.round(value * 1000) / 1000;

const leadingQuantity = (
  text: string,
): { quantity: number | null; rest: string } => {
  const fraction = UNICODE_FRACTIONS[text.charAt(0)];
  if (fraction !== undefined) {
    return { quantity: round(fraction), rest: text.slice(1).trimStart() };
  }
  const match = NUMBER.exec(text);
  if (match) {
    const whole = Number((match[1] ?? "").replace(",", "."));
    const divisor = match[2] === undefined ? 1 : Number(match[2]);
    const rest = text.slice(match[0].length).trimStart();
    // « 1 ½ citron »: a whole number, then a fraction sign.
    const extra = UNICODE_FRACTIONS[rest.charAt(0)];
    if (divisor === 1 && extra !== undefined) {
      return {
        quantity: round(whole + extra),
        rest: rest.slice(1).trimStart(),
      };
    }
    if (divisor > 0 && whole > 0) {
      return { quantity: round(whole / divisor), rest };
    }
    return { quantity: null, rest: text };
  }
  const one = ONE_WORD.exec(text);
  if (one) {
    return { quantity: 1, rest: text.slice(one[0].length) };
  }
  return { quantity: null, rest: text };
};

const leadingUnit = (
  text: string,
): { unit: RecipeUnit | null; rest: string } => {
  for (const [unit, pattern] of UNIT_PATTERNS) {
    const match = pattern.exec(text);
    if (match) {
      return { unit, rest: text.slice(match[0].length).trimStart() };
    }
  }
  return { unit: null, rest: text };
};

/** « oignon, émincé » and « tomates (bien mûres) »: the food, then the note. */
const splitNote = (text: string): { main: string; note: string } => {
  const notes: string[] = [];
  let main = text.replace(/\(([^)]*)\)/gu, (_whole, inner: string) => {
    notes.push(inner.trim());
    return " ";
  });
  // A comma before a space starts the note. « 1,5 l » has no space after it.
  const comma = main.search(/,(?=\s|$)/u);
  if (comma !== -1) {
    notes.unshift(main.slice(comma + 1).trim());
    main = main.slice(0, comma);
  }
  return {
    main: main.replace(/\s+/gu, " ").trim(),
    note: notes.filter((note) => note !== "").join(", "),
  };
};

/**
 * One typed line as one ingredient: « 200 g de quinoa », « 1 c. à s. d'huile
 * d'olive », « 2 œufs », « 1/2 citron », « sel ». Null for an empty line.
 *
 * A line that the parser cannot split keeps its whole text as the food name,
 * with no quantity. The parser never drops a line and never invents a value.
 */
export const parseIngredientLine = (line: string): RecipeIngredient | null => {
  const clean = line.trim().replace(BULLET, "").trim();
  if (clean === "") {
    return null;
  }
  const { main, note } = splitNote(clean);
  const { quantity, rest } = leadingQuantity(main);
  const whole: RecipeIngredient = {
    quantity: null,
    unit: null,
    name: main === "" ? clean : main,
    note,
    foodCode: null,
  };
  if (quantity === null) {
    return whole;
  }
  const { unit, rest: afterUnit } = leadingUnit(rest);
  const name = (unit === null ? rest : afterUnit.replace(LINK_WORD, "")).trim();
  if (name === "") {
    return whole;
  }
  return { quantity, unit, name, note, foodCode: null };
};

/** Each line of a typed or pasted text as one ingredient. */
export const parseIngredientLines = (text: string): RecipeIngredient[] =>
  text
    .split(/\r?\n/u)
    .map(parseIngredientLine)
    .filter(
      (ingredient): ingredient is RecipeIngredient => ingredient !== null,
    );

const FRACTION_TEXT: readonly (readonly [number, string])[] = [
  [0.25, "1/4"],
  [0.333, "1/3"],
  [0.5, "1/2"],
  [0.667, "2/3"],
  [0.75, "3/4"],
];

/** A quantity as a French reader writes it: « 1/2 », « 1,5 », « 200 ». */
export const formatRecipeQuantity = (quantity: number): string => {
  const fraction = FRACTION_TEXT.find(
    ([value]) => Math.abs(value - quantity) < 0.002,
  );
  if (fraction) {
    return fraction[1];
  }
  return String(Math.round(quantity * 100) / 100).replace(".", ",");
};

const STARTS_WITH_VOWEL = /^[aeiouyhàâäéèêëîïôöùûüœ]/iu;

/**
 * One ingredient as one line: « 200 g de quinoa », « 2 œufs », « sel ».
 * `parseIngredientLine` reads this line back to the same ingredient.
 */
export const formatIngredientLine = (ingredient: RecipeIngredient): string => {
  const note = ingredient.note === "" ? "" : `, ${ingredient.note}`;
  if (ingredient.quantity === null) {
    return `${ingredient.name}${note}`;
  }
  const quantity = formatRecipeQuantity(ingredient.quantity);
  if (ingredient.unit === null) {
    return `${quantity} ${ingredient.name}${note}`;
  }
  const labels = recipeUnitLabels[ingredient.unit];
  const unit = ingredient.quantity >= 2 ? labels.many : labels.one;
  const link = STARTS_WITH_VOWEL.test(ingredient.name) ? "d'" : "de ";
  return `${quantity} ${unit} ${link}${ingredient.name}${note}`;
};

/* ───────────────────────── step lines ───────────────────────── */

const STEP_NUMBER = /^(?:\d{1,2}\s*[.)\-:]\s+|(?:[-–—•*·]\s*)+)/u;
const TEMPERATURE = /(\d{2,3})\s*°\s*C?/giu;
const DURATION =
  /(\d+)\s*(?:heures?|h)(?![a-zà-ÿ])\s*(\d{1,2})?(?:\s*(?:minutes?|min|mn)(?![a-zà-ÿ]))?|(\d+)\s*(?:minutes?|min|mn)(?![a-zà-ÿ])/giu;

/**
 * One typed line as one step. The temperature and the duration come from the
 * text, and only when the text has exactly one: a step with two durations has
 * none, because REMI cannot know which one is the duration of the step.
 */
export const parseStepLine = (line: string): RecipeStep | null => {
  const text = line.trim().replace(STEP_NUMBER, "").trim();
  if (text === "") {
    return null;
  }
  const temperatures = [...text.matchAll(TEMPERATURE)].map((match) =>
    Number(match[1]),
  );
  const durations = [...text.matchAll(DURATION)].map((match) =>
    match[3] === undefined
      ? Number(match[1]) * 60 + Number(match[2] ?? 0)
      : Number(match[3]),
  );
  const temperature = temperatures.length === 1 ? temperatures[0] : undefined;
  const duration = durations.length === 1 ? durations[0] : undefined;
  return {
    text,
    temperatureC:
      temperature !== undefined && temperature >= 30 && temperature <= 300
        ? temperature
        : null,
    durationMinutes:
      duration !== undefined && duration >= 1 && duration <= MAX_MINUTES
        ? duration
        : null,
  };
};

/** Each line of a typed or pasted text as one step, in the order of the text. */
export const parseStepLines = (text: string): RecipeStep[] =>
  text
    .split(/\r?\n/u)
    .map(parseStepLine)
    .filter((step): step is RecipeStep => step !== null);

/** A duration as a French reader writes it: « 45 min », « 1 h », « 1 h 30 ». */
export const formatRecipeMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const rest = minutes % 60;
  const hours = Math.floor(minutes / 60);
  return rest === 0
    ? `${hours} h`
    : `${hours} h ${String(rest).padStart(2, "0")}`;
};

/* ───────────────────────── the recipe as text ───────────────────────── */

/**
 * The structured recipe as plain French text. The library keeps this text in
 * the prose body of a structured recipe, so that each screen that shows the
 * body of a recipe given by hand stays readable.
 */
export const structuredRecipeText = (recipe: StructuredRecipe): string => {
  const portions =
    recipe.portions === 1 ? "1 portion" : `${recipe.portions} portions`;
  const times = [
    recipe.prepMinutes === null
      ? null
      : `Préparation : ${formatRecipeMinutes(recipe.prepMinutes)}`,
    recipe.cookMinutes === null
      ? null
      : `Cuisson : ${formatRecipeMinutes(recipe.cookMinutes)}`,
  ].filter((line): line is string => line !== null);
  return [
    recipe.description,
    times.join(" · "),
    [
      `Ingrédients (${portions})`,
      ...recipe.ingredients.map(
        (ingredient) => `- ${formatIngredientLine(ingredient)}`,
      ),
    ].join("\n"),
    [
      "Étapes",
      ...recipe.steps.map((step, index) => `${index + 1}. ${step.text}`),
    ].join("\n"),
  ]
    .filter((block) => block !== "")
    .join("\n\n");
};

/* ───────────────────────── the CIQUAL food of a line ───────────────────────── */

/** The CIQUAL food and the weight that a person gave to one ingredient line. */
export type IngredientLink = {
  foodCode: string | null;
  grams: number | null;
};

const ingredientLinksSchema = z.array(
  z
    .object({
      foodCode: z.string().nullable(),
      grams: z.number().nullable(),
    })
    .nullable(),
);

/**
 * The links that the recipe form posts as one JSON text: one entry for each
 * ingredient line, in the order of the lines. A text that is not such a list
 * gives an empty list: the lines then have no food, and nothing is invented.
 */
export const parseIngredientLinks = (
  text: string,
): (IngredientLink | null)[] => {
  try {
    const parsed = ingredientLinksSchema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
};

/**
 * The ingredient lines with the food and the weight of each link, by place.
 *
 * A line with no link, or with a link that has no food, stays as it is: it has
 * no `grams` key. Thus a recipe with no CIQUAL food is stored as before
 * REM-192. A weight is kept only with a food: the weight of a line with no
 * food feeds no calculation.
 */
export const linkIngredientFoods = (
  ingredients: readonly RecipeIngredient[],
  links: readonly (IngredientLink | null | undefined)[],
): RecipeIngredient[] =>
  ingredients.map((ingredient, index) => {
    const link = links[index];
    const foodCode = link?.foodCode?.trim() ?? "";
    if (!link || foodCode === "") {
      return ingredient;
    }
    const { grams: _before, ...line } = ingredient;
    return {
      ...line,
      foodCode,
      ...(link.grams !== null && Number.isFinite(link.grams) && link.grams > 0
        ? { grams: link.grams }
        : {}),
    };
  });

/**
 * The data fields that the recipe form does not edit, carried from the stored
 * recipe to the recipe that the form posts: the skeleton, and the technique
 * and the ingredients of each step. Without this, a save from the form would
 * drop them.
 *
 * - The skeleton stays.
 * - A step keeps its technique when its text did not change.
 * - A step keeps its ingredients (`uses`) when its text did not change and
 *   the ingredient names are the same, in the same order. The places would
 *   name other lines if the list changed.
 * A field that the posted recipe gives wins. The result holds the steps and
 * the skeleton only: the caller puts them over the posted recipe.
 */
export const carryRecipeData = (
  stored: StructuredRecipe | null,
  posted: {
    ingredients: readonly Pick<RecipeIngredient, "name">[];
    steps: readonly RecipeStep[];
    skeleton?: string | undefined;
  },
): { steps: RecipeStep[]; skeleton?: string } => {
  if (stored === null) {
    return {
      steps: [...posted.steps],
      ...(posted.skeleton === undefined ? {} : { skeleton: posted.skeleton }),
    };
  }
  const sameLines =
    stored.ingredients.length === posted.ingredients.length &&
    stored.ingredients.every(
      (ingredient, index) =>
        ingredient.name === posted.ingredients[index]?.name,
    );
  const byText = new Map(stored.steps.map((step) => [step.text, step]));
  const skeleton = posted.skeleton ?? stored.skeleton;
  return {
    steps: posted.steps.map((step) => {
      const before = byText.get(step.text);
      const technique = step.technique ?? before?.technique;
      const uses = step.uses ?? (sameLines ? before?.uses : undefined);
      return {
        ...step,
        ...(technique === undefined ? {} : { technique }),
        ...(uses === undefined ? {} : { uses }),
      };
    }),
    ...(skeleton === undefined ? {} : { skeleton }),
  };
};
