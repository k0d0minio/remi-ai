import { describe, expect, it } from "vitest";
import {
  checkCompatibility,
  type CompatibilityItem,
} from "../ai/compatibility";
import {
  formatIngredientLine,
  formatRecipeMinutes,
  formatRecipeQuantity,
  parseIngredientLine,
  parseIngredientLines,
  parseStepLine,
  parseStepLines,
  recipeGateItem,
  recipeTotalMinutes,
  structuredRecipeOf,
  structuredRecipeSchema,
  structuredRecipeText,
  type StructuredRecipe,
} from "./structured-recipe";

const recipe: StructuredRecipe = {
  description: "Un bol complet, prêt en vingt minutes.",
  prepMinutes: 10,
  cookMinutes: 15,
  portions: 2,
  meals: ["lunch", "dinner"],
  seasons: ["summer"],
  ingredients: [
    { quantity: 200, unit: "g", name: "quinoa", note: "", foodCode: null },
    {
      quantity: 1,
      unit: "tbsp",
      name: "huile d'olive",
      note: "",
      foodCode: null,
    },
    { quantity: 2, unit: null, name: "œufs", note: "", foodCode: null },
    { quantity: null, unit: null, name: "sel", note: "", foodCode: null },
  ],
  steps: [
    { text: "Cuire le quinoa 15 min.", temperatureC: null, durationMinutes: 15 },
    { text: "Ajouter les œufs et servir.", temperatureC: null, durationMinutes: null },
  ],
};

const firstMessage = (value: unknown) => {
  const parsed = structuredRecipeSchema.safeParse(value);
  return parsed.success ? null : parsed.error.issues[0]?.message;
};

describe("structuredRecipeSchema", () => {
  it("accepts a complete recipe and gives it back", () => {
    expect(structuredRecipeSchema.parse(recipe)).toEqual(recipe);
  });

  it("accepts a recipe with no time: the time is not invented", () => {
    const parsed = structuredRecipeSchema.parse({
      ...recipe,
      prepMinutes: null,
      cookMinutes: null,
    });
    expect(parsed.prepMinutes).toBeNull();
    expect(recipeTotalMinutes(parsed)).toBeNull();
  });

  it("adds the two times when one is known", () => {
    expect(recipeTotalMinutes(recipe)).toBe(25);
    expect(recipeTotalMinutes({ prepMinutes: 10, cookMinutes: null })).toBe(10);
  });

  it("refuses a recipe with no ingredient or no step", () => {
    expect(firstMessage({ ...recipe, ingredients: [] })).toBe(
      "a recipe needs at least one ingredient",
    );
    expect(firstMessage({ ...recipe, steps: [] })).toBe(
      "a recipe needs at least one step",
    );
  });

  it("refuses a recipe with no meal", () => {
    expect(firstMessage({ ...recipe, meals: [] })).toBe(
      "choose at least one meal for this recipe",
    );
  });

  it("refuses a number of portions out of range", () => {
    expect(firstMessage({ ...recipe, portions: 0 })).toBe(
      "the number of portions runs from 1 to 50",
    );
    expect(firstMessage({ ...recipe, portions: 1.5 })).toBe(
      "the number of portions runs from 1 to 50",
    );
  });

  it("refuses a unit with no quantity and an ingredient with no name", () => {
    expect(
      firstMessage({
        ...recipe,
        ingredients: [
          { quantity: null, unit: "g", name: "riz", note: "", foodCode: null },
        ],
      }),
    ).toBe("a unit needs a quantity");
    expect(
      firstMessage({
        ...recipe,
        ingredients: [
          { quantity: 1, unit: null, name: "  ", note: "", foodCode: null },
        ],
      }),
    ).toBe("an ingredient needs a food name");
  });

  it("puts the meals and the seasons in one order, each one time", () => {
    const parsed = structuredRecipeSchema.parse({
      ...recipe,
      meals: ["dinner", "breakfast", "dinner"],
      seasons: ["winter", "spring"],
    });
    expect(parsed.meals).toEqual(["breakfast", "dinner"]);
    expect(parsed.seasons).toEqual(["spring", "winter"]);
  });

  it("reads a stored value, and gives null for a value that is not a recipe", () => {
    expect(structuredRecipeOf(recipe)).toEqual(recipe);
    expect(structuredRecipeOf(null)).toBeNull();
    expect(structuredRecipeOf({ ingredients: "200 g de quinoa" })).toBeNull();
  });
});

describe("recipeGateItem", () => {
  it("gives the gate one food name for each ingredient", () => {
    const item: CompatibilityItem = recipeGateItem(recipe);
    expect(item).toEqual({
      kind: "recipe",
      ingredients: [
        { name: "quinoa" },
        { name: "huile d'olive" },
        { name: "œufs" },
        { name: "sel" },
      ],
    });
  });

  it("lets the gate refuse a recipe with an evicted food", () => {
    const result = checkCompatibility(
      {
        allergens: [],
        noKnownAllergies: true,
        noKnownIntolerances: true,
        celiacDisease: false,
        diet: "none",
        evictions: [{ term: "quinoa", startsOn: null, endsOn: null }],
      },
      recipeGateItem(recipe),
      "2026-11-20",
    );
    expect(result.status).toBe("incompatible");
  });
});

describe("parseIngredientLine", () => {
  const line = (text: string) => {
    const parsed = parseIngredientLine(text);
    return parsed
      ? [parsed.quantity, parsed.unit, parsed.name, parsed.note]
      : null;
  };

  it("reads a quantity, a unit and a food", () => {
    expect(line("200 g de quinoa")).toEqual([200, "g", "quinoa", ""]);
    expect(line("200g de feta")).toEqual([200, "g", "feta", ""]);
    expect(line("1,5 l d'eau")).toEqual([1.5, "l", "eau", ""]);
    expect(line("25 cl de lait d'amande")).toEqual([
      25,
      "cl",
      "lait d'amande",
      "",
    ]);
    expect(line("1 kg de pommes de terre")).toEqual([
      1,
      "kg",
      "pommes de terre",
      "",
    ]);
  });

  it("reads the spoon units in each way of writing them", () => {
    expect(line("1 c. à s. d'huile d'olive")).toEqual([
      1,
      "tbsp",
      "huile d'olive",
      "",
    ]);
    expect(line("2 càs de miel")).toEqual([2, "tbsp", "miel", ""]);
    expect(line("1 cuillère à soupe de tahini")).toEqual([
      1,
      "tbsp",
      "tahini",
      "",
    ]);
    expect(line("1 c. à c. de curcuma")).toEqual([1, "tsp", "curcuma", ""]);
    expect(line("2 cuillères à café de cumin")).toEqual([2, "tsp", "cumin", ""]);
  });

  it("reads a count with no unit", () => {
    expect(line("2 œufs")).toEqual([2, null, "œufs", ""]);
    expect(line("3 carottes")).toEqual([3, null, "carottes", ""]);
    expect(line("un oignon")).toEqual([1, null, "oignon", ""]);
  });

  it("does not take the start of a food for a unit", () => {
    expect(line("2 gousses d'ail")).toEqual([2, "clove", "ail", ""]);
    expect(line("1 laitue")).toEqual([1, null, "laitue", ""]);
    expect(line("2 clémentines")).toEqual([2, null, "clémentines", ""]);
    expect(line("1 potimarron")).toEqual([1, null, "potimarron", ""]);
    expect(line("3 grenades")).toEqual([3, null, "grenades", ""]);
  });

  it("reads a fraction", () => {
    expect(line("1/2 citron")).toEqual([0.5, null, "citron", ""]);
    expect(line("½ avocat")).toEqual([0.5, null, "avocat", ""]);
    expect(line("1 ½ banane")).toEqual([1.5, null, "banane", ""]);
    expect(line("1/3 l de bouillon")).toEqual([0.333, "l", "bouillon", ""]);
  });

  it("reads the units that are words", () => {
    expect(line("une pincée de sel")).toEqual([1, "pinch", "sel", ""]);
    expect(line("1 boîte de sardines")).toEqual([1, "can", "sardines", ""]);
    expect(line("2 tranches de pain complet")).toEqual([
      2,
      "slice",
      "pain complet",
      "",
    ]);
    expect(line("1 poignée d'épinards")).toEqual([1, "handful", "épinards", ""]);
  });

  it("keeps a line with no quantity as the food", () => {
    expect(line("sel")).toEqual([null, null, "sel", ""]);
    expect(line("poivre du moulin")).toEqual([null, null, "poivre du moulin", ""]);
  });

  it("puts the preparation in the note, not in the food", () => {
    expect(line("1 oignon, émincé")).toEqual([1, null, "oignon", "émincé"]);
    expect(line("200 g de tomates (bien mûres)")).toEqual([
      200,
      "g",
      "tomates",
      "bien mûres",
    ]);
  });

  it("drops a bullet and an empty line", () => {
    expect(line("- 100 g de feta")).toEqual([100, "g", "feta", ""]);
    expect(line("• 2 œufs")).toEqual([2, null, "œufs", ""]);
    expect(line("   ")).toBeNull();
  });

  it("keeps the whole line when a quantity has no food", () => {
    expect(line("200 g")).toEqual([null, null, "200 g", ""]);
  });

  it("reads a paste of several lines", () => {
    const parsed = parseIngredientLines(
      "200 g de quinoa\r\n\n- 1 c. à s. d'huile d'olive\n2 œufs\nsel\n",
    );
    expect(parsed.map((ingredient) => ingredient.name)).toEqual([
      "quinoa",
      "huile d'olive",
      "œufs",
      "sel",
    ]);
    expect(parsed).toEqual(recipe.ingredients);
  });
});

describe("formatIngredientLine", () => {
  it("writes a line that a French reader expects", () => {
    expect(recipe.ingredients.map(formatIngredientLine)).toEqual([
      "200 g de quinoa",
      "1 c. à s. d'huile d'olive",
      "2 œufs",
      "sel",
    ]);
  });

  it("puts the unit in the plural from 2", () => {
    const pinch = { unit: "pinch", name: "sel", note: "", foodCode: null } as const;
    expect(formatIngredientLine({ ...pinch, quantity: 1 })).toBe(
      "1 pincée de sel",
    );
    expect(formatIngredientLine({ ...pinch, quantity: 2 })).toBe(
      "2 pincées de sel",
    );
  });

  it("writes a fraction and a decimal", () => {
    expect(formatRecipeQuantity(0.5)).toBe("1/2");
    expect(formatRecipeQuantity(0.333)).toBe("1/3");
    expect(formatRecipeQuantity(1.5)).toBe("1,5");
    expect(formatRecipeQuantity(200)).toBe("200");
  });

  it("is read back to the same ingredient", () => {
    const lines = [
      "200 g de quinoa",
      "1 c. à s. d'huile d'olive",
      "1/3 l de bouillon",
      "2 gousses d'ail",
      "1 oignon, émincé",
      "sel",
    ];
    for (const text of lines) {
      const parsed = parseIngredientLine(text);
      expect(parsed).not.toBeNull();
      if (parsed) {
        expect(formatIngredientLine(parsed)).toBe(text);
        expect(parseIngredientLine(formatIngredientLine(parsed))).toEqual(parsed);
      }
    }
  });
});

describe("parseStepLine", () => {
  it("drops the number of the step", () => {
    expect(parseStepLine("1. Rincer le quinoa.")?.text).toBe("Rincer le quinoa.");
    expect(parseStepLine("2) Égoutter.")?.text).toBe("Égoutter.");
    expect(parseStepLine("- Servir.")?.text).toBe("Servir.");
    expect(parseStepLine("  ")).toBeNull();
  });

  it("keeps a step that starts with a quantity", () => {
    expect(parseStepLine("200 g de quinoa sont rincés.")?.text).toBe(
      "200 g de quinoa sont rincés.",
    );
  });

  it("reads one temperature and one duration from the text", () => {
    expect(parseStepLine("Enfourner 20 min à 180 °C.")).toEqual({
      text: "Enfourner 20 min à 180 °C.",
      temperatureC: 180,
      durationMinutes: 20,
    });
    expect(parseStepLine("Cuire 1 h 30 à feu doux.")?.durationMinutes).toBe(90);
    expect(parseStepLine("Laisser mijoter 1h30.")?.durationMinutes).toBe(90);
    expect(parseStepLine("Laisser reposer 2 heures.")?.durationMinutes).toBe(120);
    expect(parseStepLine("Préchauffer le four à 200°C.")?.temperatureC).toBe(200);
  });

  it("gives no duration when the text has two", () => {
    expect(
      parseStepLine("Cuire 10 min, puis laisser reposer 5 min.")
        ?.durationMinutes,
    ).toBeNull();
  });

  it("does not take a food for an hour", () => {
    expect(parseStepLine("Ajouter 2 haricots.")?.durationMinutes).toBeNull();
  });

  it("reads a paste of several steps in order", () => {
    expect(
      parseStepLines("1. Cuire le quinoa 15 min.\n\n2. Ajouter les œufs et servir."),
    ).toEqual(recipe.steps);
  });
});

describe("formatRecipeMinutes", () => {
  it("writes minutes and hours", () => {
    expect(formatRecipeMinutes(45)).toBe("45 min");
    expect(formatRecipeMinutes(60)).toBe("1 h");
    expect(formatRecipeMinutes(90)).toBe("1 h 30");
    expect(formatRecipeMinutes(65)).toBe("1 h 05");
  });
});

describe("structuredRecipeText", () => {
  it("writes the recipe as plain text", () => {
    expect(structuredRecipeText(recipe)).toBe(
      [
        "Un bol complet, prêt en vingt minutes.",
        "Préparation : 10 min · Cuisson : 15 min",
        "Ingrédients (2 portions)\n- 200 g de quinoa\n- 1 c. à s. d'huile d'olive\n- 2 œufs\n- sel",
        "Étapes\n1. Cuire le quinoa 15 min.\n2. Ajouter les œufs et servir.",
      ].join("\n\n"),
    );
  });

  it("leaves out what the recipe does not give", () => {
    const text = structuredRecipeText({
      ...recipe,
      description: "",
      prepMinutes: null,
      cookMinutes: null,
      portions: 1,
    });
    expect(text.startsWith("Ingrédients (1 portion)\n")).toBe(true);
  });
});
