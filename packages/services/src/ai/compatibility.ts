/**
 * The compatibility gate — REM-57, story 14, decisions D-16 and D-30.
 *
 * One pure function decides if a recipe or a dish can be shown to a patient.
 * Each feature that shows food calls it after the generation (D-16). It reads
 * no table and no clock: the caller gives the patient's safety data, the item
 * and the day.
 *
 * The rules, strictest reading:
 * - Only `compatible` can be shown. `uncertain` is hidden exactly as
 *   `incompatible` is. Use `mayBeShown()`.
 * - A free text is never `compatible`. The gate cannot know its composition.
 * - An ingredient with a word that the lexicon does not know is `uncertain`.
 * - A food that can contain an excluded allergen (trace, cross-contamination)
 *   is `uncertain`. It is never presented as safe.
 * - An exclusion that the gate cannot interpret makes each item `uncertain`.
 * - A patient with no answer on allergies or on intolerances makes each item
 *   `uncertain`. The gate invents no answer.
 * - An eviction past its end date still applies. The gate never lifts one: the
 *   practitioner ends it, and then the loader does not supply it.
 */

import {
  ALL_SUB_KEY,
  allergenSubLists,
  allergens,
} from "../shared/questionnaire";
import { FILLER_WORDS, LEXICON_ROWS, TERM_TAGS } from "./compatibility-lexicon";

/** One row of `patient_allergens`, as stored. */
export type SafetyAllergen = {
  kind: "allergy" | "intolerance";
  /** A key of `allergens` or `intolerances`. An unknown key is not ignored. */
  key: string;
  /** A key of the sub-list, `all`, or null. Null reads as `all`. */
  subKey: string | null;
  /** The « Autre » text. */
  otherText: string | null;
};

/**
 * One total eviction that a practitioner validated and has not ended.
 * A durable eviction has no end date.
 */
export type TotalEviction = {
  /** The food or the family, as text: « kiwi », « porc », « produits laitiers ». */
  term: string;
  /** `YYYY-MM-DD`, or null: applies from the start. */
  startsOn: string | null;
  /** `YYYY-MM-DD`, or null: durable. */
  endsOn: string | null;
};

/** The patient's safety data. Each field maps to one stored value. */
export type PatientSafetyData = {
  allergens: readonly SafetyAllergen[];
  noKnownAllergies: boolean | null;
  noKnownIntolerances: boolean | null;
  celiacDisease: boolean | null;
  /** A key of `diets`, or null. */
  diet: string | null;
  evictions: readonly TotalEviction[];
};

export type CompatibilityItem =
  | {
      kind: "recipe";
      /** One food for each name. No quantity and no unit in the name. */
      ingredients: readonly { name: string }[];
    }
  | { kind: "text"; text: string };

export type CompatibilitySource =
  "allergy" | "intolerance" | "coeliac" | "diet" | "eviction";

export type CompatibilityReason = {
  source: CompatibilitySource;
  /** The exclusion: `tree_nuts/almond`, `lactose`, `gluten`, `vegan`, or the term. */
  rule: string;
  /** The ingredient name, or the free text, that the exclusion matched. */
  ingredient: string;
  /** True when the eviction is past its end date and still applies. */
  pastEnd?: true;
};

export type CompatibilityUnknownKind =
  /** The item is a free text. */
  | "free_text"
  /** The item has no ingredient, or an ingredient has no name. */
  | "empty_item"
  /** The lexicon does not know a word of the ingredient. */
  | "unknown_ingredient"
  /** The ingredient can contain an excluded food. */
  | "possible_trace"
  /** The ingredient can carry gluten, for a coeliac patient. */
  | "cross_contamination"
  /** The gate cannot interpret an exclusion of the patient. */
  | "unresolved_exclusion"
  /** The patient gave no answer on allergies or on intolerances. */
  | "missing_patient_data";

export type CompatibilityUnknown = {
  kind: CompatibilityUnknownKind;
  /** The ingredient, the exclusion or the field that is unknown. */
  subject: string;
  /** The exclusion that the unknown concerns, when there is one. */
  rule?: string;
};

export type CompatibilityResult =
  | { status: "compatible" }
  | {
      status: "incompatible";
      reasons: CompatibilityReason[];
      unknowns: CompatibilityUnknown[];
    }
  | { status: "uncertain"; unknowns: CompatibilityUnknown[] };

/** The one test a caller makes before it shows an item. */
export const mayBeShown = (result: CompatibilityResult) =>
  result.status === "compatible";

/* ───────────────────────── text ───────────────────────── */

const singular = (token: string) => {
  if (token.length <= 3) {
    return token;
  }
  if (token.endsWith("eaux") || token.endsWith("oux")) {
    return token.slice(0, -1);
  }
  if (token.endsWith("s") && !token.endsWith("ss")) {
    return token.slice(0, -1);
  }
  return token;
};

/** Lower case, no accent, no ligature, no punctuation, singular words. */
const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter((token) => token !== "")
    .map(singular);

const words = (list: string) =>
  list.split(" ").filter((word) => word !== "");

/* ───────────────────────── lexicon ───────────────────────── */

type Food = {
  id: string;
  contains: readonly string[];
  mayContain: readonly string[];
  composite: boolean;
  /** The ids of the foods that this food is made from. */
  foods: string[];
};

const buildLexicon = () => {
  const phrases = new Map<string, Food>();
  const faults: string[] = [];
  const pending: { food: Food; refs: string[] }[] = [];
  for (const [names, contains, mayContain, flags] of LEXICON_ROWS) {
    const keys = names.split("|").map((name) => tokenize(name).join(" "));
    const food: Food = {
      id: keys[0] ?? "",
      contains: words(contains ?? ""),
      mayContain: words(mayContain ?? ""),
      composite: flags?.composite === true,
      foods: [],
    };
    for (const key of keys) {
      const taken = phrases.get(key);
      if (key === "") {
        faults.push(`empty name in the row « ${names} »`);
      } else if (taken && taken !== food) {
        faults.push(`the name « ${key} » is in two rows`);
      } else {
        phrases.set(key, food);
      }
    }
    pending.push({ food, refs: (flags?.foods ?? "").split("|") });
  }
  for (const { food, refs } of pending) {
    for (const ref of refs.filter((name) => name !== "")) {
      const target = phrases.get(tokenize(ref).join(" "));
      if (target) {
        food.foods.push(target.id);
      } else {
        faults.push(`« ${food.id} » is made from an unknown food « ${ref} »`);
      }
    }
  }
  return { phrases, faults };
};

const LEXICON = buildLexicon();

const MAX_PHRASE_TOKENS = Math.max(
  ...[...LEXICON.phrases.keys()].map((key) => key.split(" ").length),
);

const FILLERS = new Set(FILLER_WORDS.split("|").flatMap(tokenize));

const TERM_TAG_MAP = new Map<string, string[]>(
  TERM_TAGS.flatMap(([terms, tags]) =>
    terms
      .split("|")
      .map((term): [string, string[]] => [
        tokenize(term).join(" "),
        words(tags),
      ]),
  ),
);

/** An own key only: a key such as `constructor` must not read the prototype. */
const own = <Value>(record: Record<string, Value>, key: string) =>
  Object.hasOwn(record, key) ? record[key] : undefined;

const subListOf = (family: string): readonly string[] | undefined =>
  own(allergenSubLists as Record<string, readonly string[]>, family);

/** The tag families that are not an allergen of the questionnaire. */
const OTHER_FAMILIES = ["lactose", "meat", "honey", "carb", "alcohol"];

/**
 * The faults of the lexicon against the questionnaire vocabulary. Empty when
 * the two agree. The unit test reads it, so a new allergen or a new sub-key
 * with no food in the lexicon fails the burst check and does not reach a
 * patient as a silent gap.
 */
export const compatibilityLexiconFaults = (): string[] => {
  const faults = [...LEXICON.faults];
  const allergenFamilies = allergens.filter((key) => key !== "other");
  const seen = new Set<string>();
  for (const food of new Set(LEXICON.phrases.values())) {
    for (const tag of [...food.contains, ...food.mayContain]) {
      const [family = "", sub] = tag.split(":");
      seen.add(family);
      seen.add(tag);
      const known =
        (allergenFamilies as readonly string[]).includes(family) ||
        OTHER_FAMILIES.includes(family);
      if (!known) {
        faults.push(`« ${food.id} » has the unknown tag « ${tag} »`);
      }
      const subList = subListOf(family);
      if (sub !== undefined && subList && !subList.includes(sub)) {
        faults.push(`« ${food.id} » has the unknown sub-key « ${tag} »`);
      }
    }
  }
  for (const family of allergenFamilies) {
    if (!seen.has(family)) {
      faults.push(`no food contains the allergen « ${family} »`);
    }
    for (const sub of subListOf(family) ?? []) {
      if (!seen.has(`${family}:${sub}`)) {
        faults.push(`no food contains « ${family}:${sub} »`);
      }
    }
  }
  for (const tags of TERM_TAG_MAP.values()) {
    for (const tag of tags) {
      if (!seen.has(tag)) {
        faults.push(`a term names the tag « ${tag} » that no food has`);
      }
    }
  }
  return faults;
};

type Parsed = { tokens: string[]; foods: Food[]; unknownWords: string[] };

/** The longest name wins: « lait de coco » is not « lait ». */
const parse = (text: string): Parsed => {
  const tokens = tokenize(text);
  const foods: Food[] = [];
  const unknownWords: string[] = [];
  let index = 0;
  while (index < tokens.length) {
    let matched = 0;
    const longest = Math.min(MAX_PHRASE_TOKENS, tokens.length - index);
    for (let length = longest; length >= 1 && matched === 0; length -= 1) {
      const food = LEXICON.phrases.get(
        tokens.slice(index, index + length).join(" "),
      );
      if (food) {
        foods.push(food);
        matched = length;
      }
    }
    if (matched === 0) {
      const token = tokens[index] ?? "";
      if (!FILLERS.has(token)) {
        unknownWords.push(token);
      }
      matched = 1;
    }
    index += matched;
  }
  return { tokens, foods, unknownWords };
};

/* ───────────────────────── rules ───────────────────────── */

type Rule = {
  source: CompatibilitySource;
  label: string;
  /** Excluded tags. `family` excludes each sub-key of the family. */
  tags: string[];
  /** Excluded foods, from a text term that names one food. */
  foodIds: string[];
  /** The `family:sub` tags of those foods: a food made from them is excluded. */
  foodTags: string[];
  /** The words of each text term, to find the term in a name as written. */
  phrases: string[][];
  /** The gate cannot interpret the exclusion. */
  unresolved: boolean;
  pastEnd: boolean;
};

const rule = (
  source: CompatibilitySource,
  label: string,
  tags: string[] = [],
): Rule => ({
  source,
  label,
  tags,
  foodIds: [],
  foodTags: [],
  phrases: [],
  unresolved: false,
  pastEnd: false,
});

/** An excluded tag against a tag of a food. No sub-key on one side matches. */
const tagMatches = (excluded: string, actual: string) => {
  const [excludedFamily, excludedSub] = excluded.split(":");
  const [actualFamily, actualSub] = actual.split(":");
  return (
    excludedFamily === actualFamily &&
    (excludedSub === undefined ||
      actualSub === undefined ||
      excludedSub === actualSub)
  );
};

const familyOf = (tag: string) => tag.split(":")[0] ?? tag;

/**
 * Adds a text term to a rule: an eviction, or an « Autre » answer. A term is a
 * family word (« produits laitiers »), or names foods of the lexicon
 * (« kiwi »), or the gate cannot interpret it. One text can hold many terms.
 */
const addTerms = (target: Rule, text: string) => {
  const terms = text
    .split(/[,;/\n]+/)
    .map((term) => term.trim())
    .filter((term) => term !== "");
  if (terms.length === 0) {
    target.unresolved = true;
  }
  for (const term of terms) {
    const parsed = parse(term);
    if (parsed.tokens.length === 0) {
      target.unresolved = true;
      continue;
    }
    target.phrases.push(parsed.tokens);
    const familyTags = TERM_TAG_MAP.get(parsed.tokens.join(" "));
    if (familyTags) {
      target.tags.push(...familyTags);
    } else if (parsed.foods.length > 0 && parsed.unknownWords.length === 0) {
      for (const food of parsed.foods) {
        target.foodIds.push(food.id);
        target.foodTags.push(
          ...food.contains.filter((tag) => tag.includes(":")),
        );
      }
    } else {
      target.unresolved = true;
    }
  }
};

const INTOLERANCE_TAGS: Record<string, string[]> = {
  lactose: ["lactose"],
  gluten: ["gluten"],
  milk_proteins: ["milk"],
  egg: ["eggs"],
  sulphites: ["sulphites"],
};

const DIET_TAGS: Record<string, string[]> = {
  none: [],
  omnivore: [],
  flexitarian: [],
  pescatarian: ["meat"],
  vegetarian: ["meat", "fish", "crustaceans", "molluscs"],
  vegan: ["meat", "fish", "crustaceans", "molluscs", "milk", "eggs", "honey"],
  ketogenic: ["carb"],
};

const allergenRule = (row: SafetyAllergen): Rule => {
  if (row.key === "other") {
    const other = rule(row.kind, `other: ${(row.otherText ?? "").trim()}`);
    addTerms(other, row.otherText ?? "");
    return other;
  }
  if (row.kind === "intolerance") {
    const tags = own(INTOLERANCE_TAGS, row.key);
    const intolerance = rule("intolerance", row.key, tags ?? []);
    // Fructose, sorbitol, polyols, histamine and FODMAP have no validated food
    // table. The gate does not guess one.
    intolerance.unresolved = tags === undefined;
    return intolerance;
  }
  if (!(allergens as readonly string[]).includes(row.key)) {
    const unknown = rule("allergy", row.key);
    unknown.unresolved = true;
    return unknown;
  }
  const subList = subListOf(row.key);
  const precise =
    row.subKey !== null &&
    row.subKey !== ALL_SUB_KEY &&
    subList !== undefined &&
    subList.includes(row.subKey);
  return precise
    ? rule("allergy", `${row.key}/${row.subKey}`, [`${row.key}:${row.subKey}`])
    : rule("allergy", row.key, [row.key]);
};

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * An eviction does not apply before its start date. That is the one case. A
 * date that is not `YYYY-MM-DD` does not remove an eviction.
 */
const evictionRule = (eviction: TotalEviction, today: string): Rule | null => {
  const datesReadable = ISO_DAY.test(today);
  const { startsOn, endsOn } = eviction;
  if (
    datesReadable &&
    startsOn !== null &&
    ISO_DAY.test(startsOn) &&
    startsOn > today
  ) {
    return null;
  }
  const active = rule("eviction", eviction.term.trim());
  active.pastEnd =
    datesReadable && endsOn !== null && ISO_DAY.test(endsOn) && endsOn < today;
  addTerms(active, eviction.term);
  return active;
};

const buildRules = (patient: PatientSafetyData, today: string) => {
  const rules: Rule[] = patient.allergens.map(allergenRule);
  if (patient.celiacDisease === true) {
    rules.push(rule("coeliac", "gluten", ["gluten"]));
  }
  if (patient.diet !== null) {
    const tags = own(DIET_TAGS, patient.diet);
    const diet = rule("diet", patient.diet, tags ?? []);
    // « Autre » has a free note. The gate does not interpret it.
    diet.unresolved = tags === undefined;
    rules.push(diet);
  }
  for (const eviction of patient.evictions) {
    const active = evictionRule(eviction, today);
    if (active) {
      rules.push(active);
    }
  }
  return rules;
};

const missingAnswers = (patient: PatientSafetyData): CompatibilityUnknown[] => {
  const declared = (kind: SafetyAllergen["kind"]) =>
    patient.allergens.some((row) => row.kind === kind);
  const unknowns: CompatibilityUnknown[] = [];
  if (patient.noKnownAllergies !== true && !declared("allergy")) {
    unknowns.push({ kind: "missing_patient_data", subject: "allergies" });
  }
  if (patient.noKnownIntolerances !== true && !declared("intolerance")) {
    unknowns.push({ kind: "missing_patient_data", subject: "intolerances" });
  }
  return unknowns;
};

/* ───────────────────────── the check ───────────────────────── */

const containsPhrase = (tokens: string[], phrase: string[]) =>
  tokens.some((_, start) =>
    phrase.every((word, offset) => tokens[start + offset] === word),
  );

type Verdict = "excluded" | "possible" | "clear";

const judge = (active: Rule, parsed: Parsed): Verdict => {
  if (active.phrases.some((phrase) => containsPhrase(parsed.tokens, phrase))) {
    return "excluded";
  }
  let possible = false;
  for (const food of parsed.foods) {
    const excluded =
      active.foodIds.includes(food.id) ||
      food.foods.some((id) => active.foodIds.includes(id)) ||
      food.contains.some(
        (tag) =>
          active.tags.some((excludedTag) => tagMatches(excludedTag, tag)) ||
          active.foodTags.includes(tag),
      );
    if (excluded) {
      return "excluded";
    }
    const trace = food.mayContain.some((tag) =>
      active.tags.some((excludedTag) => tagMatches(excludedTag, tag)),
    );
    // The evicted food is one species of a family. This food is of the same
    // family and its species is not known, or it can contain that family.
    const sameFamily = active.foodTags.some(
      (foodTag) =>
        food.contains.includes(familyOf(foodTag)) ||
        food.mayContain.some((tag) => tagMatches(foodTag, tag)),
    );
    const opaque = active.foodIds.length > 0 && food.composite;
    possible = possible || trace || sameFamily || opaque;
  }
  return possible ? "possible" : "clear";
};

/**
 * Decides if an item can be shown to a patient on the day `today`
 * (`YYYY-MM-DD`). The caller gives the day, so the function reads no clock.
 */
export const checkCompatibility = (
  patient: PatientSafetyData,
  item: CompatibilityItem,
  today: string,
): CompatibilityResult => {
  const rules = buildRules(patient, today);
  const reasons: CompatibilityReason[] = [];
  const unknowns: CompatibilityUnknown[] = missingAnswers(patient);

  for (const active of rules) {
    if (active.unresolved) {
      unknowns.push({
        kind: "unresolved_exclusion",
        subject: active.label,
        rule: active.label,
      });
    }
  }

  const names =
    item.kind === "recipe"
      ? item.ingredients.map((ingredient) => ingredient.name.trim())
      : [item.text.trim()];

  if (item.kind === "text") {
    unknowns.push({ kind: "free_text", subject: item.text.trim() });
  }
  if (names.length === 0) {
    unknowns.push({ kind: "empty_item", subject: "" });
  }

  for (const name of names) {
    const parsed = parse(name);
    if (parsed.tokens.length === 0) {
      unknowns.push({ kind: "empty_item", subject: name });
      continue;
    }
    if (
      item.kind === "recipe" &&
      (parsed.foods.length === 0 || parsed.unknownWords.length > 0)
    ) {
      unknowns.push({ kind: "unknown_ingredient", subject: name });
    }
    for (const active of rules) {
      const verdict = judge(active, parsed);
      if (verdict === "excluded") {
        reasons.push({
          source: active.source,
          rule: active.label,
          ingredient: name,
          ...(active.pastEnd ? { pastEnd: true as const } : {}),
        });
      } else if (verdict === "possible") {
        unknowns.push({
          kind:
            active.source === "coeliac"
              ? "cross_contamination"
              : "possible_trace",
          subject: name,
          rule: active.label,
        });
      }
    }
  }

  if (reasons.length > 0) {
    return { status: "incompatible", reasons, unknowns };
  }
  if (unknowns.length > 0) {
    return { status: "uncertain", unknowns };
  }
  return { status: "compatible" };
};
