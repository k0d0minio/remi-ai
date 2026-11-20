import { describe, expect, it } from "vitest";
import {
  ALL_SUB_KEY,
  allergenSubLists,
  type allergens,
  type diets,
  type intolerances,
} from "../shared/questionnaire";
import {
  checkCompatibility,
  compatibilityLexiconFaults,
  mayBeShown,
  type CompatibilityItem,
  type CompatibilitySource,
  type CompatibilityUnknownKind,
  type PatientSafetyData,
  type SafetyAllergen,
  type TotalEviction,
} from "./compatibility";

/*
 * The fixture table of the compatibility gate (REM-57). Each case states the
 * patient, the item and the result. The typed records below have one key for
 * each allergen, each sub-key, each intolerance and each diet of the
 * questionnaire: a new key with no case does not compile.
 */

const TODAY = "2026-11-20";

/** A patient who answered each question and declared no exclusion. */
const patient = (overrides: Partial<PatientSafetyData> = {}): PatientSafetyData => ({
  allergens: [],
  noKnownAllergies: true,
  noKnownIntolerances: true,
  celiacDisease: false,
  diet: "none",
  evictions: [],
  ...overrides,
});

const allergy = (
  key: string,
  subKey: string | null = null,
  otherText: string | null = null,
): SafetyAllergen => ({ kind: "allergy", key, subKey, otherText });

const intolerance = (
  key: string,
  otherText: string | null = null,
): SafetyAllergen => ({ kind: "intolerance", key, subKey: null, otherText });

const eviction = (
  term: string,
  startsOn: string | null = null,
  endsOn: string | null = null,
): TotalEviction => ({ term, startsOn, endsOn });

const recipe = (...names: string[]): CompatibilityItem => ({
  kind: "recipe",
  ingredients: names.map((name) => ({ name })),
});

const text = (value: string): CompatibilityItem => ({
  kind: "text",
  text: value,
});

type Reason = [source: CompatibilitySource, rule: string, ingredient: string];
type Unknown = [kind: CompatibilityUnknownKind, subject: string];

type Case = {
  name: string;
  patient: PatientSafetyData;
  item: CompatibilityItem;
  today?: string;
  status: "compatible" | "incompatible" | "uncertain";
  /** Each reason, in order. Read only when the status is `incompatible`. */
  reasons?: Reason[];
  /** Unknowns that the result must hold. */
  unknowns?: Unknown[];
};

const run = (cases: Case[]) => {
  it.each(cases)("$name", (fixture) => {
    const result = checkCompatibility(
      fixture.patient,
      fixture.item,
      fixture.today ?? TODAY,
    );
    expect(result.status).toBe(fixture.status);
    expect(mayBeShown(result)).toBe(fixture.status === "compatible");
    if (result.status === "compatible") {
      expect(result).toEqual({ status: "compatible" });
      return;
    }
    if (result.status === "incompatible" && fixture.reasons) {
      expect(
        result.reasons.map(({ source, rule, ingredient }) => [
          source,
          rule,
          ingredient,
        ]),
      ).toEqual(fixture.reasons);
    }
    for (const [kind, subject] of fixture.unknowns ?? []) {
      expect(result.unknowns).toEqual(
        expect.arrayContaining([expect.objectContaining({ kind, subject })]),
      );
    }
  });
};

describe("the lexicon", () => {
  it("agrees with the questionnaire vocabulary and has no name in two rows", () => {
    expect(compatibilityLexiconFaults()).toEqual([]);
  });
});

describe("allergies: one case for each family", () => {
  const FOOD: Record<(typeof allergens)[number], string> = {
    gluten: "pâtes",
    crustaceans: "crevette",
    eggs: "œuf",
    fish: "poisson blanc",
    peanuts: "cacahuète",
    soy: "tofu",
    milk: "fromage râpé",
    tree_nuts: "pistache",
    celery: "céleri-rave",
    mustard: "moutarde de Dijon",
    sesame: "tahini",
    sulphites: "vin blanc",
    lupin: "farine de lupin",
    molluscs: "moules",
    other: "kiwi",
  };
  run(
    Object.entries(FOOD).map(([key, food]): Case => {
      const other = key === "other";
      return {
        name: `${key}: « ${food} » is incompatible`,
        patient: patient({
          allergens: [allergy(key, null, other ? "kiwi" : null)],
        }),
        item: recipe("carotte", food),
        status: "incompatible",
        reasons: [["allergy", other ? "other: kiwi" : key, food]],
      };
    }),
  );
  run([
    {
      name: "« Autre » with a food that the lexicon knows lets the other foods pass",
      patient: patient({ allergens: [allergy("other", null, "kiwi")] }),
      item: recipe("banane"),
      status: "compatible",
    },
    {
      name: "« Autre » with no text is uncertain for each item",
      patient: patient({ allergens: [allergy("other")] }),
      item: recipe("carotte"),
      status: "uncertain",
      unknowns: [["unresolved_exclusion", "other: "]],
    },
    {
      name: "« Autre » with a text that the gate cannot interpret is uncertain",
      patient: patient({
        allergens: [allergy("other", null, "fruits exotiques")],
      }),
      item: recipe("carotte"),
      status: "uncertain",
      unknowns: [["unresolved_exclusion", "other: fruits exotiques"]],
    },
    {
      name: "an allergen key that the vocabulary does not have is uncertain",
      patient: patient({ allergens: [allergy("nickel")] }),
      item: recipe("carotte"),
      status: "uncertain",
      unknowns: [["unresolved_exclusion", "nickel"]],
    },
    {
      name: "the allergy rows apply when « Aucune allergie connue » is also true",
      patient: patient({
        noKnownAllergies: true,
        allergens: [allergy("eggs")],
      }),
      item: recipe("œuf"),
      status: "incompatible",
      reasons: [["allergy", "eggs", "œuf"]],
    },
  ]);
});

describe("allergies: each sub-key path", () => {
  const FOOD: {
    [K in keyof typeof allergenSubLists]: Record<
      (typeof allergenSubLists)[K][number],
      string
    >;
  } = {
    gluten: {
      wheat: "blé",
      rye: "seigle",
      barley: "orge",
      oats: "flocons d'avoine",
      spelt: "épeautre",
    },
    tree_nuts: {
      almond: "amande",
      hazelnut: "noisette",
      walnut: "noix",
      cashew: "noix de cajou",
      pecan: "noix de pécan",
      pistachio: "pistache",
      brazil_nut: "noix du Brésil",
      macadamia: "noix de macadamia",
      other: "pignon de pin",
    },
    fish: {
      salmon: "saumon",
      tuna: "thon",
      cod: "cabillaud",
      sole: "sole",
      trout: "truite",
      sardine: "sardines",
      mackerel: "maquereau",
      anchovy: "anchois",
      other: "haddock",
    },
    crustaceans: {
      shrimp: "crevettes",
      crab: "crabe",
      lobster: "homard",
      langoustine: "langoustines",
      other: "écrevisse",
    },
    molluscs: {
      mussel: "moules",
      oyster: "huîtres",
      squid: "calamar",
      octopus: "poulpe",
      scallop: "noix de Saint-Jacques",
      other: "palourdes",
    },
  };
  const paths = Object.entries(FOOD).flatMap(([family, foods]) =>
    Object.entries(foods).map(([sub, food]) => ({ family, sub, food })),
  );

  run(
    paths.map(
      ({ family, sub, food }): Case => ({
        name: `${family}/${sub}: « ${food} » is incompatible`,
        patient: patient({ allergens: [allergy(family, sub)] }),
        item: recipe(food),
        status: "incompatible",
        reasons: [["allergy", `${family}/${sub}`, food]],
      }),
    ),
  );
  run(
    paths.map(
      ({ family, sub, food }): Case => ({
        name: `${family}/all excludes « ${food} » (${sub})`,
        patient: patient({ allergens: [allergy(family, ALL_SUB_KEY)] }),
        item: recipe(food),
        status: "incompatible",
        reasons: [["allergy", family, food]],
      }),
    ),
  );
  run([
    {
      name: "a sub-key lets another species of the family pass: almond, « noisette »",
      patient: patient({ allergens: [allergy("tree_nuts", "almond")] }),
      item: recipe("noisette"),
      status: "compatible",
    },
    {
      name: "a sub-key lets another species pass: salmon, « thon »",
      patient: patient({ allergens: [allergy("fish", "salmon")] }),
      item: recipe("thon"),
      status: "compatible",
    },
    {
      name: "a sub-key lets another species pass: shrimp, « crabe »",
      patient: patient({ allergens: [allergy("crustaceans", "shrimp")] }),
      item: recipe("crabe"),
      status: "compatible",
    },
    {
      name: "a sub-key lets another species pass: mussel, « huîtres »",
      patient: patient({ allergens: [allergy("molluscs", "mussel")] }),
      item: recipe("huîtres"),
      status: "compatible",
    },
    {
      name: "a sub-key lets another cereal pass: wheat, « seigle »",
      patient: patient({ allergens: [allergy("gluten", "wheat")] }),
      item: recipe("seigle"),
      status: "compatible",
    },
    {
      name: "spelt is a wheat: a wheat allergy excludes « épeautre »",
      patient: patient({ allergens: [allergy("gluten", "wheat")] }),
      item: recipe("épeautre"),
      status: "incompatible",
      reasons: [["allergy", "gluten/wheat", "épeautre"]],
    },
    {
      name: "« other » excludes a nut that the sub-list does not name, not a named one",
      patient: patient({ allergens: [allergy("tree_nuts", "other")] }),
      item: recipe("amande"),
      status: "compatible",
    },
    {
      name: "a null sub-key excludes the whole family",
      patient: patient({ allergens: [allergy("tree_nuts", null)] }),
      item: recipe("noix de cajou"),
      status: "incompatible",
      reasons: [["allergy", "tree_nuts", "noix de cajou"]],
    },
    {
      name: "a sub-key that the sub-list does not have excludes the whole family",
      patient: patient({ allergens: [allergy("fish", "shark")] }),
      item: recipe("truite"),
      status: "incompatible",
      reasons: [["allergy", "fish", "truite"]],
    },
    {
      name: "a sub-key against a food of unknown species is incompatible: salmon, « poisson »",
      patient: patient({ allergens: [allergy("fish", "salmon")] }),
      item: recipe("poisson"),
      status: "incompatible",
      reasons: [["allergy", "fish/salmon", "poisson"]],
    },
    {
      name: "a sub-key against a prepared food of unknown nuts is incompatible: almond, « pesto »",
      patient: patient({ allergens: [allergy("tree_nuts", "almond")] }),
      item: recipe("pesto"),
      status: "incompatible",
      reasons: [["allergy", "tree_nuts/almond", "pesto"]],
    },
    {
      name: "a trace-level association is uncertain: hazelnut, « chocolat noir »",
      patient: patient({ allergens: [allergy("tree_nuts", "hazelnut")] }),
      item: recipe("chocolat noir"),
      status: "uncertain",
      unknowns: [["possible_trace", "chocolat noir"]],
    },
    {
      name: "an oil of unknown source is uncertain for a peanut allergy",
      patient: patient({ allergens: [allergy("peanuts")] }),
      item: recipe("huile"),
      status: "uncertain",
      unknowns: [["possible_trace", "huile"]],
    },
  ]);
});

describe("intolerances: one case for each key", () => {
  const EXPECTED: Record<
    (typeof intolerances)[number],
    { food: string; status: Case["status"] }
  > = {
    lactose: { food: "beurre", status: "incompatible" },
    gluten: { food: "pâtes", status: "incompatible" },
    milk_proteins: { food: "fromage", status: "incompatible" },
    egg: { food: "œuf", status: "incompatible" },
    // No validated food table: the gate does not guess (debt of REM-57).
    fructose: { food: "carotte", status: "uncertain" },
    sorbitol: { food: "carotte", status: "uncertain" },
    polyols: { food: "carotte", status: "uncertain" },
    histamine: { food: "carotte", status: "uncertain" },
    fodmap: { food: "carotte", status: "uncertain" },
    sulphites: { food: "vin rouge", status: "incompatible" },
    other: { food: "kiwi", status: "incompatible" },
  };
  run(
    Object.entries(EXPECTED).map(([key, { food, status }]): Case => {
      const label = key === "other" ? "other: kiwi" : key;
      return {
        name: `${key}: « ${food} » is ${status}`,
        patient: patient({
          allergens: [intolerance(key, key === "other" ? "kiwi" : null)],
        }),
        item: recipe(food),
        status,
        reasons: [["intolerance", label, food]],
        unknowns:
          status === "uncertain" ? [["unresolved_exclusion", label]] : [],
      };
    }),
  );
  run([
    {
      name: "lactose: a lactose-free milk passes",
      patient: patient({ allergens: [intolerance("lactose")] }),
      item: recipe("lait sans lactose", "banane"),
      status: "compatible",
    },
    {
      name: "milk proteins: a lactose-free milk is incompatible",
      patient: patient({ allergens: [intolerance("milk_proteins")] }),
      item: recipe("lait sans lactose"),
      status: "incompatible",
      reasons: [["intolerance", "milk_proteins", "lait sans lactose"]],
    },
    {
      name: "egg: a prepared food that contains egg is incompatible",
      patient: patient({ allergens: [intolerance("egg")] }),
      item: recipe("mayonnaise"),
      status: "incompatible",
      reasons: [["intolerance", "egg", "mayonnaise"]],
    },
    {
      name: "sulphites: a dried fruit is uncertain",
      patient: patient({ allergens: [intolerance("sulphites")] }),
      item: recipe("abricot sec"),
      status: "uncertain",
      unknowns: [["possible_trace", "abricot sec"]],
    },
    {
      name: "« Autre » with two foods excludes each of them",
      patient: patient({
        allergens: [intolerance("other", "oignon, ail")],
      }),
      item: recipe("ail", "tomate"),
      status: "incompatible",
      reasons: [["intolerance", "other: oignon, ail", "ail"]],
    },
  ]);
});

describe("coeliac disease", () => {
  const coeliac = patient({ celiacDisease: true });
  run([
    {
      name: "excludes gluten: « pâtes »",
      patient: coeliac,
      item: recipe("pâtes", "tomate"),
      status: "incompatible",
      reasons: [["coeliac", "gluten", "pâtes"]],
    },
    {
      name: "excludes oats",
      patient: coeliac,
      item: recipe("flocons d'avoine", "lait"),
      status: "incompatible",
      reasons: [["coeliac", "gluten", "flocons d'avoine"]],
    },
    {
      name: "excludes a sauce that contains wheat: « sauce soja »",
      patient: coeliac,
      item: recipe("riz", "sauce soja"),
      status: "incompatible",
      reasons: [["coeliac", "gluten", "sauce soja"]],
    },
    {
      name: "flags cross-contamination: « lentilles corail » is uncertain",
      patient: coeliac,
      item: recipe("lentilles corail", "carotte"),
      status: "uncertain",
      unknowns: [["cross_contamination", "lentilles corail"]],
    },
    {
      name: "flags cross-contamination: « tamari » is uncertain",
      patient: coeliac,
      item: recipe("tamari"),
      status: "uncertain",
      unknowns: [["cross_contamination", "tamari"]],
    },
    {
      name: "a « sans gluten » label does not make a food safe",
      patient: coeliac,
      item: recipe("pâtes sans gluten"),
      status: "incompatible",
      reasons: [["coeliac", "gluten", "pâtes sans gluten"]],
    },
    {
      name: "a recipe with no gluten and no cross-contamination risk passes",
      patient: coeliac,
      item: recipe("riz", "poulet", "courgette"),
      status: "compatible",
    },
    {
      name: "a free text with gluten is incompatible",
      patient: coeliac,
      item: text("pain complet et fromage"),
      status: "incompatible",
      reasons: [["coeliac", "gluten", "pain complet et fromage"]],
    },
    {
      name: "a null coeliac flag is not a declared disease",
      patient: patient({ celiacDisease: null }),
      item: recipe("pâtes"),
      status: "compatible",
    },
  ]);
});

describe("diets: one case for each key", () => {
  const EXPECTED: Record<
    (typeof diets)[number],
    { forbidden: string | null; allowed: string | null }
  > = {
    none: { forbidden: null, allowed: "bœuf" },
    omnivore: { forbidden: null, allowed: "bœuf" },
    flexitarian: { forbidden: null, allowed: "bœuf" },
    pescatarian: { forbidden: "poulet", allowed: "saumon" },
    vegetarian: { forbidden: "saumon", allowed: "œuf" },
    vegan: { forbidden: "miel", allowed: "tofu" },
    ketogenic: { forbidden: "riz", allowed: "avocat" },
    // « Autre » has a free note that the gate does not interpret.
    other: { forbidden: null, allowed: null },
  };
  run(
    Object.entries(EXPECTED).flatMap(([diet, { forbidden, allowed }]) => {
      const cases: Case[] = [];
      if (forbidden !== null) {
        cases.push({
          name: `${diet}: « ${forbidden} » is incompatible`,
          patient: patient({ diet }),
          item: recipe(forbidden),
          status: "incompatible",
          reasons: [["diet", diet, forbidden]],
        });
      }
      if (allowed !== null) {
        cases.push({
          name: `${diet}: « ${allowed} » is compatible`,
          patient: patient({ diet }),
          item: recipe(allowed),
          status: "compatible",
        });
      }
      return cases;
    }),
  );
  run([
    {
      name: "other: each item is uncertain",
      patient: patient({ diet: "other" }),
      item: recipe("carotte"),
      status: "uncertain",
      unknowns: [["unresolved_exclusion", "other"]],
    },
    {
      name: "a diet key that the vocabulary does not have is uncertain",
      patient: patient({ diet: "paleo" }),
      item: recipe("carotte"),
      status: "uncertain",
      unknowns: [["unresolved_exclusion", "paleo"]],
    },
    {
      name: "a null diet excludes nothing",
      patient: patient({ diet: null }),
      item: recipe("bœuf"),
      status: "compatible",
    },
    {
      name: "vegetarian: « gélatine » is incompatible",
      patient: patient({ diet: "vegetarian" }),
      item: recipe("gélatine"),
      status: "incompatible",
      reasons: [["diet", "vegetarian", "gélatine"]],
    },
    {
      name: "vegetarian: « crevette » is incompatible",
      patient: patient({ diet: "vegetarian" }),
      item: recipe("crevette"),
      status: "incompatible",
      reasons: [["diet", "vegetarian", "crevette"]],
    },
    {
      name: "vegetarian: a stock of unknown source is uncertain",
      patient: patient({ diet: "vegetarian" }),
      item: recipe("bouillon"),
      status: "uncertain",
      unknowns: [["possible_trace", "bouillon"]],
    },
    {
      name: "vegan: « beurre » is incompatible",
      patient: patient({ diet: "vegan" }),
      item: recipe("beurre"),
      status: "incompatible",
      reasons: [["diet", "vegan", "beurre"]],
    },
    {
      name: "an allergy and a diet on one ingredient give two reasons, the allergy first",
      patient: patient({ allergens: [allergy("eggs")], diet: "vegan" }),
      item: recipe("œuf"),
      status: "incompatible",
      reasons: [
        ["allergy", "eggs", "œuf"],
        ["diet", "vegan", "œuf"],
      ],
    },
  ]);
});

describe("total evictions", () => {
  run([
    {
      name: "a durable eviction of a family excludes a food of the family: « porc », « jambon »",
      patient: patient({ evictions: [eviction("porc")] }),
      item: recipe("jambon", "pâtes"),
      status: "incompatible",
      reasons: [["eviction", "porc", "jambon"]],
    },
    {
      name: "inside its period, an eviction applies",
      patient: patient({
        evictions: [eviction("kiwi", "2026-11-01", "2026-12-01")],
      }),
      item: recipe("kiwi"),
      status: "incompatible",
      reasons: [["eviction", "kiwi", "kiwi"]],
    },
    {
      name: "on its start day, an eviction applies",
      patient: patient({ evictions: [eviction("kiwi", TODAY, null)] }),
      item: recipe("kiwi"),
      status: "incompatible",
    },
    {
      name: "on its end day, an eviction applies",
      patient: patient({ evictions: [eviction("kiwi", null, TODAY)] }),
      item: recipe("kiwi"),
      status: "incompatible",
    },
    {
      name: "before its start date, an eviction does not apply",
      patient: patient({
        evictions: [eviction("kiwi", "2026-12-01", "2027-01-01")],
      }),
      item: recipe("kiwi"),
      status: "compatible",
    },
    {
      name: "a start date that is not a date does not remove the eviction",
      patient: patient({ evictions: [eviction("kiwi", "demain", null)] }),
      item: recipe("kiwi"),
      status: "incompatible",
    },
    {
      name: "a day that is not a date does not remove the eviction",
      patient: patient({
        evictions: [eviction("kiwi", "2026-12-01", null)],
      }),
      item: recipe("kiwi"),
      today: "20/11/2026",
      status: "incompatible",
    },
    {
      name: "a family term excludes each food of the family: « produits laitiers »",
      patient: patient({ evictions: [eviction("produits laitiers")] }),
      item: recipe("crème fraîche"),
      status: "incompatible",
      reasons: [["eviction", "produits laitiers", "crème fraîche"]],
    },
    {
      name: "a food term excludes a food made from it: « blé », « pâtes »",
      patient: patient({ evictions: [eviction("blé")] }),
      item: recipe("pâtes"),
      status: "incompatible",
      reasons: [["eviction", "blé", "pâtes"]],
    },
    {
      name: "a food term makes a food of unknown cereal uncertain: « blé », « pain »",
      patient: patient({ evictions: [eviction("blé")] }),
      item: recipe("pain"),
      status: "uncertain",
      unknowns: [["possible_trace", "pain"]],
    },
    {
      name: "a food term excludes its prepared form: « tomate », « ketchup »",
      patient: patient({ evictions: [eviction("tomate")] }),
      item: recipe("ketchup"),
      status: "incompatible",
      reasons: [["eviction", "tomate", "ketchup"]],
    },
    {
      name: "a French term excludes an English name: « riz », « rice noodles »",
      patient: patient({ evictions: [eviction("riz")] }),
      item: recipe("rice noodles"),
      status: "incompatible",
      reasons: [["eviction", "riz", "rice noodles"]],
    },
    {
      name: "a species term makes a fish of unknown species uncertain: « saumon », « poisson »",
      patient: patient({ evictions: [eviction("saumon")] }),
      item: recipe("poisson"),
      status: "uncertain",
      unknowns: [["possible_trace", "poisson"]],
    },
    {
      name: "a species term lets another species pass: « saumon », « thon »",
      patient: patient({ evictions: [eviction("saumon")] }),
      item: recipe("thon"),
      status: "compatible",
    },
    {
      name: "a food term makes a prepared food uncertain: « kiwi », « confiture »",
      patient: patient({ evictions: [eviction("kiwi")] }),
      item: recipe("confiture"),
      status: "uncertain",
      unknowns: [["possible_trace", "confiture"]],
    },
    {
      name: "one eviction with two terms excludes each of them",
      patient: patient({ evictions: [eviction("kiwi, mangue")] }),
      item: recipe("mangue"),
      status: "incompatible",
      reasons: [["eviction", "kiwi, mangue", "mangue"]],
    },
    {
      name: "the word of an eviction inside another food name excludes that food (strict)",
      patient: patient({ evictions: [eviction("lait")] }),
      item: recipe("lait de coco"),
      status: "incompatible",
      reasons: [["eviction", "lait", "lait de coco"]],
    },
    {
      name: "a term that the gate cannot interpret makes a recipe uncertain",
      patient: patient({ evictions: [eviction("solanacées")] }),
      item: recipe("carotte"),
      status: "uncertain",
      unknowns: [["unresolved_exclusion", "solanacées"]],
    },
    {
      name: "a term that the gate cannot interpret still excludes a name that has it",
      patient: patient({ evictions: [eviction("solanacées")] }),
      item: text("gratin de solanacées"),
      status: "incompatible",
      reasons: [["eviction", "solanacées", "gratin de solanacées"]],
    },
    {
      name: "an empty term is uncertain",
      patient: patient({ evictions: [eviction("  ")] }),
      item: recipe("carotte"),
      status: "uncertain",
      unknowns: [["unresolved_exclusion", ""]],
    },
    {
      name: "an eviction that no word of a free text matches gives uncertain",
      patient: patient({ evictions: [eviction("kiwi")] }),
      item: text("salade de carottes"),
      status: "uncertain",
      unknowns: [["free_text", "salade de carottes"]],
    },
    {
      name: "an eviction that a word of a free text matches gives incompatible",
      patient: patient({ evictions: [eviction("kiwi")] }),
      item: text("smoothie kiwi banane"),
      status: "incompatible",
      reasons: [["eviction", "kiwi", "smoothie kiwi banane"]],
    },
  ]);

  it("still applies an eviction past its end date, and says so", () => {
    const result = checkCompatibility(
      patient({ evictions: [eviction("kiwi", "2026-10-01", "2026-11-19")] }),
      recipe("kiwi"),
      TODAY,
    );
    expect(result).toEqual({
      status: "incompatible",
      reasons: [
        { source: "eviction", rule: "kiwi", ingredient: "kiwi", pastEnd: true },
      ],
      unknowns: [],
    });
  });

  it("does not mark an eviction inside its period as past its end", () => {
    const result = checkCompatibility(
      patient({ evictions: [eviction("kiwi", "2026-10-01", "2026-12-01")] }),
      recipe("kiwi"),
      TODAY,
    );
    expect(result).toEqual({
      status: "incompatible",
      reasons: [{ source: "eviction", rule: "kiwi", ingredient: "kiwi" }],
      unknowns: [],
    });
  });
});

describe("unknown composition", () => {
  run([
    {
      name: "a recipe of known foods with no exclusion is compatible",
      patient: patient(),
      item: recipe("poulet", "riz", "courgette", "huile d'olive", "sel"),
      status: "compatible",
    },
    {
      name: "an ingredient that the lexicon does not know is uncertain",
      patient: patient(),
      item: recipe("carotte", "zorglub"),
      status: "uncertain",
      unknowns: [["unknown_ingredient", "zorglub"]],
    },
    {
      name: "a word that can change the composition is uncertain: « pané »",
      patient: patient(),
      item: recipe("poulet pané"),
      status: "uncertain",
      unknowns: [["unknown_ingredient", "poulet pané"]],
    },
    {
      name: "a « sans » label is uncertain, never compatible",
      patient: patient(),
      item: recipe("pâtes sans gluten"),
      status: "uncertain",
      unknowns: [["unknown_ingredient", "pâtes sans gluten"]],
    },
    {
      name: "a quantity in the name is uncertain",
      patient: patient(),
      item: recipe("200 g de carottes"),
      status: "uncertain",
      unknowns: [["unknown_ingredient", "200 g de carottes"]],
    },
    {
      name: "a recipe with no ingredient is uncertain",
      patient: patient(),
      item: recipe(),
      status: "uncertain",
      unknowns: [["empty_item", ""]],
    },
    {
      name: "an ingredient with no name is uncertain",
      patient: patient(),
      item: recipe("carotte", "   "),
      status: "uncertain",
      unknowns: [["empty_item", ""]],
    },
    {
      name: "an exclusion wins over an unknown: incompatible, and the unknown is kept",
      patient: patient({ allergens: [allergy("peanuts")] }),
      item: recipe("cacahuète", "zorglub"),
      status: "incompatible",
      reasons: [["allergy", "peanuts", "cacahuète"]],
      unknowns: [["unknown_ingredient", "zorglub"]],
    },
    {
      name: "the longest name wins: « lait de coco » is not milk",
      patient: patient({ allergens: [allergy("milk")] }),
      item: recipe("lait de coco"),
      status: "compatible",
    },
    {
      name: "the longest name wins: « noix de coco » and « noix de muscade » are not tree nuts",
      patient: patient({ allergens: [allergy("tree_nuts")] }),
      item: recipe("noix de coco", "noix de muscade"),
      status: "compatible",
    },
    {
      name: "the longest name wins: « œuf à la coque » is not a mollusc",
      patient: patient({ allergens: [allergy("molluscs")] }),
      item: recipe("œuf à la coque"),
      status: "compatible",
    },
    {
      name: "accents, case and plurals do not change the result",
      patient: patient({ allergens: [allergy("eggs")] }),
      item: recipe("OEUFS"),
      status: "incompatible",
      reasons: [["allergy", "eggs", "OEUFS"]],
    },
  ]);
});

describe("free text", () => {
  run([
    {
      name: "a free text of known foods is uncertain, never compatible",
      patient: patient(),
      item: text("carotte"),
      status: "uncertain",
      unknowns: [["free_text", "carotte"]],
    },
    {
      name: "a free dish is uncertain",
      patient: patient(),
      item: text("poulet rôti et légumes"),
      status: "uncertain",
      unknowns: [["free_text", "poulet rôti et légumes"]],
    },
    {
      name: "an empty text is uncertain",
      patient: patient(),
      item: text(""),
      status: "uncertain",
      unknowns: [["empty_item", ""]],
    },
    {
      name: "a free text that names an allergen is incompatible",
      patient: patient({ allergens: [allergy("peanuts")] }),
      item: text("poulet sauce cacahuète"),
      status: "incompatible",
      reasons: [["allergy", "peanuts", "poulet sauce cacahuète"]],
    },
  ]);
});

describe("missing answers", () => {
  run([
    {
      name: "no answer on allergies is uncertain for each item",
      patient: patient({ noKnownAllergies: null }),
      item: recipe("carotte"),
      status: "uncertain",
      unknowns: [["missing_patient_data", "allergies"]],
    },
    {
      name: "a false flag with no intolerance row is no answer",
      patient: patient({ noKnownIntolerances: false }),
      item: recipe("carotte"),
      status: "uncertain",
      unknowns: [["missing_patient_data", "intolerances"]],
    },
    {
      name: "a declared row is an answer",
      patient: patient({
        noKnownAllergies: false,
        allergens: [allergy("eggs")],
      }),
      item: recipe("carotte"),
      status: "compatible",
    },
  ]);
});
