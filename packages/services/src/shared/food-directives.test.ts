import { describe, expect, it } from "vitest";
import { checkCompatibility } from "../ai/compatibility";
import {
  evictionsOfDirectives,
  foodDirectiveFaults,
  foodDirectiveTermKey,
  isIsoDay,
  joinFoodDirectiveTerms,
  splitFoodDirectiveTerms,
  type FoodDirectiveDraft,
} from "./food-directives";

const draft = (
  kind: FoodDirectiveDraft["kind"],
  term: string,
  rest: Partial<FoodDirectiveDraft> = {},
): FoodDirectiveDraft => ({
  kind,
  term,
  limitLevel: null,
  startsOn: null,
  endsOn: null,
  durable: false,
  ...rest,
});

const codes = (drafts: readonly FoodDirectiveDraft[]) =>
  foodDirectiveFaults(drafts).map((fault) => fault.code);

describe("splitFoodDirectiveTerms", () => {
  it("gives one term for each part between « ; »", () => {
    expect(splitFoodDirectiveTerms("brocoli ; magnésium ; crucifères")).toEqual(
      ["brocoli", "magnésium", "crucifères"],
    );
  });

  it("keeps the term as typed, without the outer and the double spaces", () => {
    expect(splitFoodDirectiveTerms("  Produits   laitiers;I3C ")).toEqual([
      "Produits laitiers",
      "I3C",
    ]);
  });

  it("gives no term for an empty part or an empty field", () => {
    expect(splitFoodDirectiveTerms("")).toEqual([]);
    expect(splitFoodDirectiveTerms(" ; ;kiwi;; ")).toEqual(["kiwi"]);
  });

  it("splits on « ; » only", () => {
    expect(splitFoodDirectiveTerms("fruits rouges, myrtilles")).toEqual([
      "fruits rouges, myrtilles",
    ]);
  });

  it("keeps a term one time, as it was typed first", () => {
    expect(splitFoodDirectiveTerms("Brocoli ; brocolis ; BROCOLI")).toEqual([
      "Brocoli",
    ]);
  });

  it("keeps a term with no letter, so that the save can name it", () => {
    expect(splitFoodDirectiveTerms("kiwi ; ??")).toEqual(["kiwi", "??"]);
  });

  it("is the reverse of joinFoodDirectiveTerms", () => {
    const terms = ["brocoli", "magnésium"];
    expect(splitFoodDirectiveTerms(joinFoodDirectiveTerms(terms))).toEqual(
      terms,
    );
    expect(joinFoodDirectiveTerms([])).toBe("");
  });
});

describe("foodDirectiveTermKey", () => {
  it("ignores case, accents, ligatures, punctuation and the plural", () => {
    expect(foodDirectiveTermKey("Crucifères")).toBe("crucifere");
    expect(foodDirectiveTermKey("ŒUFS")).toBe("oeuf");
    expect(foodDirectiveTermKey("  produits-laitiers ")).toBe(
      "produit laitier",
    );
  });

  it("is empty for a term with no letter and no digit", () => {
    expect(foodDirectiveTermKey(" -- ")).toBe("");
  });
});

describe("isIsoDay", () => {
  it("accepts a real day only", () => {
    expect(isIsoDay("2027-01-31")).toBe(true);
    expect(isIsoDay("2027-02-30")).toBe(false);
    expect(isIsoDay("31/01/2027")).toBe(false);
    expect(isIsoDay("")).toBe(false);
  });
});

describe("foodDirectiveFaults", () => {
  it("finds no fault in a valid section", () => {
    expect(
      codes([
        draft("favour", "brocoli"),
        draft("limit", "sucre", { limitLevel: "rare" }),
        draft("limit", "café"),
        draft("exclude", "kiwi", { endsOn: "2027-01-31" }),
        draft("exclude", "porc", {
          startsOn: "2026-12-01",
          endsOn: "2027-01-31",
        }),
        draft("exclude", "arachides", { durable: true }),
      ]),
    ).toEqual([]);
  });

  it("refuses the same term in « À favoriser » and « Éviction totale », and names it", () => {
    const faults = foodDirectiveFaults([
      draft("favour", "Brocolis"),
      draft("exclude", "brocoli", { durable: true }),
    ]);
    expect(faults).toEqual([{ code: "favour_and_exclude", term: "Brocolis" }]);
  });

  it("permits the same term in « À favoriser » and « À limiter »", () => {
    expect(codes([draft("favour", "café"), draft("limit", "café")])).toEqual(
      [],
    );
  });

  it("refuses an eviction with no end date and no durable status", () => {
    expect(codes([draft("exclude", "kiwi")])).toEqual([
      "eviction_without_period",
    ]);
    expect(
      codes([draft("exclude", "kiwi", { startsOn: "2026-12-01" })]),
    ).toEqual(["eviction_without_period"]);
  });

  it("refuses a durable eviction with an end date", () => {
    expect(
      codes([draft("exclude", "kiwi", { durable: true, endsOn: "2027-01-31" })]),
    ).toEqual(["durable_with_end"]);
  });

  it("refuses a date that is not a real day, and an end before the start", () => {
    expect(codes([draft("exclude", "kiwi", { endsOn: "2027-02-30" })])).toEqual(
      ["invalid_date"],
    );
    expect(
      codes([
        draft("exclude", "kiwi", {
          startsOn: "2027-02-01",
          endsOn: "2027-01-31",
        }),
      ]),
    ).toEqual(["end_before_start"]);
  });

  it("refuses a term with no letter, a long term and a term two times", () => {
    expect(codes([draft("favour", "??")])).toEqual(["unreadable_term"]);
    expect(codes([draft("favour", "a".repeat(201))])).toEqual([
      "term_too_long",
    ]);
    expect(codes([draft("limit", "sucre"), draft("limit", "Sucres")])).toEqual([
      "duplicate_term",
    ]);
  });

  it("refuses a period or a level on the wrong kind", () => {
    expect(codes([draft("favour", "kiwi", { durable: true })])).toEqual([
      "period_on_other_kind",
    ]);
    expect(codes([draft("limit", "kiwi", { endsOn: "2027-01-31" })])).toEqual([
      "period_on_other_kind",
    ]);
    expect(codes([draft("favour", "kiwi", { limitLevel: "rare" })])).toEqual([
      "level_on_other_kind",
    ]);
  });
});

describe("evictionsOfDirectives", () => {
  const directives = [
    draft("favour", "brocoli"),
    draft("limit", "sucre", { limitLevel: "reduce" }),
    draft("exclude", "kiwi", { startsOn: "2026-12-01", endsOn: "2027-01-31" }),
    draft("exclude", "arachides", { durable: true }),
    draft("exclude", "composés soufrés", { endsOn: "2026-01-01" }),
  ];

  it("gives one eviction for each « Éviction totale », and no other kind", () => {
    expect(evictionsOfDirectives(directives)).toEqual([
      { term: "kiwi", startsOn: "2026-12-01", endsOn: "2027-01-31" },
      { term: "arachides", startsOn: null, endsOn: null },
      { term: "composés soufrés", startsOn: null, endsOn: "2026-01-01" },
    ]);
  });

  it("reads a durable eviction with no end date, whatever the row holds", () => {
    expect(
      evictionsOfDirectives([
        draft("exclude", "kiwi", { durable: true, endsOn: "2027-01-31" }),
      ]),
    ).toEqual([{ term: "kiwi", startsOn: null, endsOn: null }]);
  });

  it("gives the gate a term that REMI does not recognise: nothing is shown as safe", () => {
    const result = checkCompatibility(
      {
        allergens: [],
        noKnownAllergies: true,
        noKnownIntolerances: true,
        celiacDisease: false,
        diet: "omnivore",
        evictions: evictionsOfDirectives([
          draft("exclude", "composés soufrés", { durable: true }),
        ]),
      },
      { kind: "recipe", ingredients: [{ name: "riz" }] },
      "2026-11-20",
    );
    expect(result.status).not.toBe("compatible");
  });

  it("gives the gate an eviction past its end date: it still applies", () => {
    const result = checkCompatibility(
      {
        allergens: [],
        noKnownAllergies: true,
        noKnownIntolerances: true,
        celiacDisease: false,
        diet: "omnivore",
        evictions: evictionsOfDirectives([
          draft("exclude", "kiwi", { endsOn: "2026-01-01" }),
        ]),
      },
      { kind: "recipe", ingredients: [{ name: "kiwi" }] },
      "2026-11-20",
    );
    expect(result.status).toBe("incompatible");
  });
});
