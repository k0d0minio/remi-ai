import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";

import type {
  ProviderReply,
  ProviderRequest,
  TextProvider,
} from "../../ai/index";
import type { PatientSafetyData } from "../../ai/compatibility";
import type { MealSuggestionReply } from "../../ai/prompts/meal";
import type { ProtocolSnapshot } from "../../shared/protocol-snapshot";
import type { MealSuggestionInput } from "./suggest";

/**
 * The meal suggestion with a fake provider: no network, no key and no
 * database. The registry of the seam is module state, thus each test loads a
 * fresh copy of the seam and of the service that calls it.
 */
const load = async () => {
  vi.resetModules();
  const seam = await import("../../ai/index");
  const { buildMealSuggestion } = await import("./suggest");
  return { seam, buildMealSuggestion };
};

const fakeProvider = (
  reply: ProviderReply | Error,
  seen: ProviderRequest[] = [],
): TextProvider => ({
  name: "fake",
  generateText: async (request) => {
    seen.push(request);
    if (reply instanceof Error) {
      throw reply;
    }
    return reply;
  },
});

const TODAY = "2026-11-20";

/** A patient who answered each question. Gluten is the one allergy. */
const glutenAllergy: PatientSafetyData = {
  allergens: [{ kind: "allergy", key: "gluten", subKey: null, otherText: null }],
  noKnownAllergies: false,
  noKnownIntolerances: true,
  celiacDisease: false,
  diet: "omnivore",
  evictions: [],
};

const RECOMMENDATION = "Un légume à chaque repas";

const protocol: ProtocolSnapshot = {
  schemaVersion: 1,
  recommendations: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      category: "nutrition",
      title: RECOMMENDATION,
      detail: "",
      position: 0,
    },
  ],
  goals: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      title: "Plus d'énergie l'après-midi",
      baseline: "",
      position: 0,
    },
  ],
  supplements: [],
  instruction: null,
  calculations: [],
  foodDirectives: [],
};

const input = (
  overrides: Partial<MealSuggestionInput> = {},
): MealSuggestionInput => ({
  meal: "poulet, riz",
  safety: glutenAllergy,
  dietNote: null,
  protocol,
  today: TODAY,
  ...overrides,
});

const reply = (overrides: Partial<MealSuggestionReply> = {}): ProviderReply => ({
  text: JSON.stringify({
    understood: true,
    excludedFound: [],
    goodPoints: ["Ton repas apporte des protéines."],
    improvement: null,
    ...overrides,
  } satisfies MealSuggestionReply),
});

const add = (
  food: string,
): NonNullable<MealSuggestionReply["improvement"]> => ({
  kind: "add",
  food,
  replaces: null,
  explanation: "Une piste simple pour suivre ta recommandation.",
  basis: "R1",
});

let info: MockInstance;
let error: MockInstance;

beforeEach(() => {
  info = vi.spyOn(console, "info").mockImplementation(() => {});
  error = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

const logged = () =>
  [...info.mock.calls, ...error.mock.calls].map((call) => String(call[0]));

describe("buildMealSuggestion — the gate on the model's proposal", () => {
  it("shows a proposed food that the gate confirms, with the practitioner's words", async () => {
    const { seam, buildMealSuggestion } = await load();
    seam.registerTextProvider(
      fakeProvider(reply({ improvement: add("courgette") })),
    );

    const result = await buildMealSuggestion(input());

    expect(result.alerts).toEqual([]);
    expect(result.answer).toEqual({
      status: "answered",
      toCheck: [],
      goodPoints: ["Ton repas apporte des protéines."],
      improvement: {
        status: "shown",
        kind: "add",
        food: "courgette",
        replaces: null,
        explanation: "Une piste simple pour suivre ta recommandation.",
        basis: RECOMMENDATION,
      },
    });
  });

  it("hides a proposed food that holds an exclusion of the patient", async () => {
    const { seam, buildMealSuggestion } = await load();
    seam.registerTextProvider(
      fakeProvider(reply({ improvement: add("boulgour") })),
    );

    const result = await buildMealSuggestion(input());

    expect(result.answer).toMatchObject({
      status: "answered",
      improvement: { status: "withheld" },
    });
    expect(JSON.stringify(result)).not.toContain("boulgour");
  });

  it("hides a proposed food of unknown composition", async () => {
    const { seam, buildMealSuggestion } = await load();
    seam.registerTextProvider(
      fakeProvider(reply({ improvement: add("mélange surprise") })),
    );

    const result = await buildMealSuggestion(input());

    expect(result.answer).toMatchObject({
      improvement: { status: "withheld" },
    });
  });

  it("hides each proposal when the patient gave no answer on allergies", async () => {
    const { seam, buildMealSuggestion } = await load();
    seam.registerTextProvider(
      fakeProvider(reply({ improvement: add("courgette") })),
    );

    const result = await buildMealSuggestion(
      input({
        safety: { ...glutenAllergy, allergens: [], noKnownAllergies: null },
      }),
    );

    expect(result.checkIngredients).toBe(true);
    expect(result.answer).toMatchObject({
      improvement: { status: "withheld" },
    });
  });

  it("hides an explanation that names an excluded food that the meal does not have", async () => {
    const { seam, buildMealSuggestion } = await load();
    seam.registerTextProvider(
      fakeProvider(
        reply({
          improvement: {
            ...add("courgette"),
            explanation: "Avec un peu de pain, ce sera plus complet.",
          },
        }),
      ),
    );

    const result = await buildMealSuggestion(input());

    expect(result.answer).toMatchObject({
      improvement: { status: "withheld" },
    });
  });

  it("hides an improvement that serves no item of the prompt", async () => {
    const { seam, buildMealSuggestion } = await load();
    seam.registerTextProvider(
      fakeProvider(
        reply({ improvement: { ...add("courgette"), basis: "R9" } }),
      ),
    );

    const result = await buildMealSuggestion(input());

    expect(result.answer).toMatchObject({
      improvement: { status: "withheld" },
    });
  });

  it("confirms a meal that needs no improvement", async () => {
    const { seam, buildMealSuggestion } = await load();
    seam.registerTextProvider(fakeProvider(reply()));

    const result = await buildMealSuggestion(input());

    expect(result.answer).toMatchObject({
      improvement: { status: "aligned" },
    });
  });
});

describe("buildMealSuggestion — an excluded food in the meal", () => {
  const meal = "spaghetti, sauce tomate";

  it("puts the excluded food first and drops the praise for it", async () => {
    const { seam, buildMealSuggestion } = await load();
    seam.registerTextProvider(
      fakeProvider(
        reply({
          excludedFound: ["spaghetti"],
          goodPoints: [
            "Les spaghetti te donnent de l'énergie.",
            "La tomate est un légume.",
          ],
          improvement: add("courgette"),
        }),
      ),
    );

    const result = await buildMealSuggestion(input({ meal }));

    expect(result.alerts).toEqual([{ food: "spaghetti", source: "allergy" }]);
    // The lexicon says that a tomato sauce can contain gluten.
    expect(result.traces).toEqual(["sauce tomate"]);
    expect(result.checkIngredients).toBe(true);
    expect(result.answer).toEqual({
      status: "answered",
      toCheck: ["spaghetti"],
      goodPoints: ["La tomate est un légume."],
      // One more food does not answer an excluded food.
      improvement: { status: "address_alert" },
    });
  });

  it("shows a replacement of the excluded food that the gate confirms", async () => {
    const { seam, buildMealSuggestion } = await load();
    seam.registerTextProvider(
      fakeProvider(
        reply({
          improvement: {
            kind: "replace",
            food: "riz",
            replaces: "spaghetti",
            explanation: "Remplace les spaghetti par du riz.",
            basis: "[R1]",
          },
        }),
      ),
    );

    const result = await buildMealSuggestion(input({ meal }));

    expect(result.answer).toMatchObject({
      improvement: { status: "shown", kind: "replace", food: "riz" },
    });
  });

  it("puts an allergy before the declared diet", async () => {
    const { seam, buildMealSuggestion } = await load();
    seam.registerTextProvider(fakeProvider(reply()));

    const result = await buildMealSuggestion(
      input({
        meal: "poulet, spaghetti",
        safety: { ...glutenAllergy, diet: "vegetarian" },
      }),
    );

    expect(result.alerts).toEqual([
      { food: "spaghetti", source: "allergy" },
      { food: "poulet", source: "diet" },
    ]);
  });

  it("keeps the alert when the generation fails", async () => {
    const { seam, buildMealSuggestion } = await load();
    seam.registerTextProvider(fakeProvider(new Error("network")));

    const result = await buildMealSuggestion(input({ meal }));

    expect(result.alerts).toEqual([{ food: "spaghetti", source: "allergy" }]);
    expect(result.answer).toEqual({ status: "unavailable" });
  });
});

describe("buildMealSuggestion — no validated version", () => {
  it("sends the safety data only and shows no improvement", async () => {
    const { seam, buildMealSuggestion } = await load();
    const seen: ProviderRequest[] = [];
    seam.registerTextProvider(
      fakeProvider(reply({ improvement: add("courgette") }), seen),
    );

    const result = await buildMealSuggestion(input({ protocol: null }));

    expect(seen).toHaveLength(1);
    expect(seen[0]?.prompt).toContain("Allergie : ");
    expect(seen[0]?.prompt).toContain("Aucune recommandation n'est validée");
    expect(seen[0]?.prompt).not.toContain("[R1]");
    expect(seen[0]?.prompt).not.toContain(RECOMMENDATION);
    expect(result.answer).toMatchObject({
      status: "answered",
      improvement: { status: "no_protocol" },
    });
  });
});

describe("buildMealSuggestion — a generation that fails", () => {
  it("answers unavailable when the reply does not satisfy the schema", async () => {
    const { seam, buildMealSuggestion } = await load();
    seam.registerTextProvider(
      fakeProvider({ text: '{"understood":"yes","goodPoints":"REPLY-SECRET"}' }),
    );

    const result = await buildMealSuggestion(input());

    expect(result.answer).toEqual({ status: "unavailable" });
    expect(JSON.stringify(result)).not.toContain("REPLY-SECRET");
  });

  it("answers unavailable when no adapter is registered", async () => {
    const { buildMealSuggestion } = await load();

    const result = await buildMealSuggestion(input());

    expect(result).toEqual({
      alerts: [],
      traces: [],
      checkIngredients: true,
      answer: { status: "unavailable" },
    });
  });

  it("answers unavailable when the model does not reply in time", async () => {
    const { seam, buildMealSuggestion } = await load();
    seam.registerTextProvider({
      name: "slow",
      generateText: () => new Promise<ProviderReply>(() => {}),
    });

    const result = await buildMealSuggestion(input({ timeoutMs: 5 }));

    expect(result.answer).toEqual({ status: "unavailable" });
  });

  it("answers unclear when the model did not understand the text", async () => {
    const { seam, buildMealSuggestion } = await load();
    seam.registerTextProvider(
      fakeProvider(reply({ understood: false, goodPoints: [] })),
    );

    const result = await buildMealSuggestion(input({ meal: "comme hier" }));

    expect(result.answer).toEqual({ status: "unclear" });
  });
});

describe("buildMealSuggestion — the log", () => {
  it("writes no line with the meal, the prompt or the reply", async () => {
    const { seam, buildMealSuggestion } = await load();
    seam.registerTextProvider(
      fakeProvider(reply({ goodPoints: ["REPLY-SECRET bravo."] })),
    );

    await buildMealSuggestion(input({ meal: "MEAL-SECRET poulet, riz" }));

    const lines = logged();
    expect(lines.some((line) => line.includes('"event":"meal.suggestion"'))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes('"event":"ai.generation"'))).toBe(
      true,
    );
    for (const line of lines) {
      expect(line).not.toContain("MEAL-SECRET");
      expect(line).not.toContain("REPLY-SECRET");
      expect(line).not.toContain("Niveau 1");
    }
  });
});
