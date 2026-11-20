import { describe, expect, it } from "vitest";
import {
  checkCompatibility,
  gateTags,
  isGateTag,
  lexiconIdOfFoodName,
  mayBeShown,
  type GateFood,
  type PatientSafetyData,
  type SafetyAllergen,
} from "./compatibility";
import { allergenSubLists, allergens } from "../shared/questionnaire";

/**
 * The gate reads a CIQUAL food by its code from the food record — REM-189.
 *
 * The food records are rows of the database, so no test can list them. What
 * holds for each confirmed food is proved here for the whole tag vocabulary:
 * the service refuses a confirmation with a tag outside `gateTags()`, thus a
 * confirmed record holds tags of this list only, and the gate gives a definite
 * answer for each tag of the list.
 */

const TODAY = "2026-11-20";

const noExclusion: PatientSafetyData = {
  allergens: [],
  noKnownAllergies: true,
  noKnownIntolerances: true,
  celiacDisease: false,
  diet: "omnivore",
  evictions: [],
};

const allergy = (key: string, subKey: string | null = null): SafetyAllergen => ({
  kind: "allergy",
  key,
  subKey,
  otherText: null,
});

const withAllergy = (...rows: SafetyAllergen[]): PatientSafetyData => ({
  ...noExclusion,
  noKnownAllergies: false,
  allergens: rows,
});

const withEviction = (term: string): PatientSafetyData => ({
  ...noExclusion,
  evictions: [{ term, startsOn: null, endsOn: null }],
});

const food = (overrides: Partial<GateFood> = {}): GateFood => ({
  code: "20020",
  name: "Courgette, pulpe et peau, crue",
  status: "confirmed",
  cookable: true,
  contains: [],
  mayContain: [],
  lexiconId: "courgette",
  ...overrides,
});

const check = (patient: PatientSafetyData, ...foods: GateFood[]) =>
  checkCompatibility(
    patient,
    {
      kind: "recipe",
      ingredients: foods.map((entry) => ({ name: entry.name, food: entry })),
    },
    TODAY,
  );

describe("the tag vocabulary", () => {
  it("holds each allergen family and each sub-key of the questionnaire", () => {
    const tags = gateTags();
    for (const family of allergens.filter((key) => key !== "other")) {
      expect(tags).toContain(family);
    }
    for (const [family, subs] of Object.entries(allergenSubLists)) {
      for (const sub of subs) {
        expect(tags).toContain(`${family}:${sub}`);
      }
    }
    expect(tags).toEqual(
      expect.arrayContaining(["lactose", "meat", "honey", "carb", "alcohol"]),
    );
    expect(new Set(tags).size).toBe(tags.length);
  });

  it("knows its own tags and no other", () => {
    expect(gateTags().every(isGateTag)).toBe(true);
    expect(isGateTag("dairy")).toBe(false);
    expect(isGateTag("gluten:rice")).toBe(false);
    expect(isGateTag("")).toBe(false);
  });
});

describe("a confirmed food record", () => {
  it("is known to the gate for each tag of the vocabulary", () => {
    const faults: string[] = [];
    for (const tag of gateTags()) {
      const record = food({
        code: `tag-${tag}`,
        name: "Courgette, crue",
        contains: [tag],
      });
      // No exclusion: the food is shown, with no unknown word.
      const free = check(noExclusion, record);
      if (free.status !== "compatible") {
        faults.push(`${tag}: ${free.status} for a patient with no exclusion`);
      }
      // The same tag as a trace is known too.
      const trace = check(noExclusion, food({ mayContain: [tag] }));
      if (trace.status !== "compatible") {
        faults.push(`${tag}: ${trace.status} as a trace`);
      }
    }
    expect(faults).toEqual([]);
  });

  it("is excluded for each allergen that it contains", () => {
    const faults: string[] = [];
    for (const family of allergens.filter((key) => key !== "other")) {
      const whole = check(withAllergy(allergy(family)), food({ contains: [family] }));
      if (whole.status !== "incompatible") {
        faults.push(`${family}: ${whole.status}`);
      }
      for (const sub of (allergenSubLists as Record<string, readonly string[]>)[
        family
      ] ?? []) {
        const precise = check(
          withAllergy(allergy(family, sub)),
          food({ contains: [`${family}:${sub}`] }),
        );
        if (precise.status !== "incompatible") {
          faults.push(`${family}:${sub}: ${precise.status}`);
        }
      }
    }
    expect(faults).toEqual([]);
  });

  it("reads the tags of the record and not the words of the name", () => {
    // « Lait de coco » holds no milk: the record says so, and the gate does
    // not read the word « lait ».
    const coconutMilk = food({
      code: "18041",
      name: "Lait de coco",
      lexiconId: null,
    });
    expect(check(withAllergy(allergy("milk")), coconutMilk)).toEqual({
      status: "compatible",
    });
  });

  it("is uncertain, and not shown, when it can contain an excluded allergen", () => {
    const result = check(
      withAllergy(allergy("tree_nuts")),
      food({ mayContain: ["tree_nuts"] }),
    );
    expect(result.status).toBe("uncertain");
    expect(mayBeShown(result)).toBe(false);
  });

  it("follows the diet", () => {
    const chicken = food({
      code: "36005",
      name: "Poulet, filet, cru",
      contains: ["meat:chicken"],
      lexiconId: null,
    });
    expect(check({ ...noExclusion, diet: "vegetarian" }, chicken).status).toBe(
      "incompatible",
    );
    expect(check(noExclusion, chicken).status).toBe("compatible");
  });
});

describe("a food that no person confirmed (D-30)", () => {
  it.each([
    ["a proposal of REMI", food({ status: "proposed" })],
    ["a food with no record", food({ status: "none" })],
    ["a food that is not « cuisinable »", food({ cookable: false })],
  ])("is never shown: %s", (_label, record) => {
    const result = check(noExclusion, record);
    expect(result).toEqual({
      status: "uncertain",
      unknowns: [{ kind: "unconfirmed_food", subject: record.name }],
    });
    expect(mayBeShown(result)).toBe(false);
  });

  it("hides the recipe that holds one, beside confirmed foods", () => {
    const result = check(noExclusion, food(), food({ status: "proposed" }));
    expect(result.status).toBe("uncertain");
  });

  it("is still excluded when its proposed tags name an allergen", () => {
    const result = check(
      withAllergy(allergy("eggs")),
      food({ status: "proposed", contains: ["eggs"] }),
    );
    expect(result.status).toBe("incompatible");
  });

  it("is uncertain with a tag that the gate does not know", () => {
    const result = check(noExclusion, food({ contains: ["dairy"] }));
    expect(result).toEqual({
      status: "uncertain",
      unknowns: [
        { kind: "unknown_ingredient", subject: "Courgette, pulpe et peau, crue" },
      ],
    });
  });
});

describe("an eviction that names one food", () => {
  it("excludes the food that the CIQUAL name holds", () => {
    expect(check(withEviction("courgette"), food()).status).toBe(
      "incompatible",
    );
  });

  it("excludes the food of the linked lexicon row, under another name", () => {
    const zucchini = food({ name: "Zucchini" });
    expect(lexiconIdOfFoodName("zucchini")).toBe("courgette");
    expect(check(withEviction("courgette"), zucchini).status).toBe(
      "incompatible",
    );
  });

  it("does not exclude another food that the lexicon knows", () => {
    const carrot = food({
      code: "20009",
      name: "Carotte, crue",
      lexiconId: lexiconIdOfFoodName("Carotte, crue"),
    });
    expect(carrot.lexiconId).not.toBeNull();
    expect(check(withEviction("courgette"), carrot)).toEqual({
      status: "compatible",
    });
  });

  it("is uncertain for a food that the gate cannot compare with the eviction", () => {
    // No lexicon row is linked, and the name holds no lexicon food.
    const unknown = food({ code: "99999", name: "Zzzz", lexiconId: null });
    const result = check(withEviction("courgette"), unknown);
    expect(result.status).toBe("uncertain");
    // With no named eviction, the confirmed tags are enough.
    expect(check(noExclusion, unknown).status).toBe("compatible");
    expect(check(withAllergy(allergy("milk")), unknown).status).toBe(
      "compatible",
    );
  });
});

describe("lexiconIdOfFoodName", () => {
  it("links the name before the first comma to one lexicon row", () => {
    expect(lexiconIdOfFoodName("Courgette, pulpe et peau, crue")).toBe(
      "courgette",
    );
    expect(lexiconIdOfFoodName("Riz blanc, cru")).toBe(
      lexiconIdOfFoodName("riz"),
    );
  });

  it("gives no link for an unknown word, two foods or an empty name", () => {
    expect(lexiconIdOfFoodName("Zzzz, cru")).toBeNull();
    expect(lexiconIdOfFoodName("Courgette et carotte")).toBeNull();
    expect(lexiconIdOfFoodName("")).toBeNull();
  });
});

describe("an ingredient with no food record", () => {
  it("is read by its name, as before", () => {
    const result = checkCompatibility(
      withAllergy(allergy("gluten")),
      {
        kind: "recipe",
        ingredients: [{ name: "courgette" }, { name: "pâtes" }],
      },
      TODAY,
    );
    expect(result.status).toBe("incompatible");
    expect(
      checkCompatibility(
        noExclusion,
        { kind: "recipe", ingredients: [{ name: "zzzz" }] },
        TODAY,
      ),
    ).toEqual({
      status: "uncertain",
      unknowns: [{ kind: "unknown_ingredient", subject: "zzzz" }],
    });
  });
});
