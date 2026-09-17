/**
 * The nutrition vocabulary: how a practitioner's phrasing becomes a CIQUAL
 * component code.
 *
 * Morgane's § 7 recipe step reads « augmenter les protéines », « favoriser les
 * oméga-3 », « augmenter les fibres », « augmenter le magnésium » — her own
 * words, written into a patient's recommendations. This file is the whole
 * translation layer between those words and the table: hand-written, one entry
 * per component, and deliberately not a model call. A wrong nutrient is not a
 * clumsy sentence, it is bad advice, so this stays something a human can read
 * and correct in one line.
 *
 * The codes are CIQUAL's own `const_code`, verified against the Ciqual 2025
 * `const` file rather than recalled.
 */

/** Whether a recommendation wants more of a component or less of it. */
export type NutrientDirection = "increase" | "reduce";

export type NutrientComponent = {
  /** Stable identifier for the component, independent of CIQUAL's numbering. */
  key: string;
  /** How it reads in the console, in French. */
  label: string;
  /**
   * The CIQUAL component codes that carry it. Usually one; oméga-3 is three,
   * because the recommendation names a family and the table names fatty acids.
   */
  codes: readonly string[];
  unit: string;
  direction: NutrientDirection;
  /**
   * The phrasings that select this component, already normalised. Matching is
   * substring, so « augmenter les protéines » hits `proteine`.
   */
  phrases: readonly string[];
};

/**
 * Lowercase, strip accents, collapse whitespace.
 *
 * Used for two things that must agree: the `search_name` the importer writes
 * for every food, and the phrase matching below. One function so « magnesium »
 * typed without its accent finds « Magnésium » in both.
 */
export const normaliseNutritionText = (value: string): string =>
  value
    // NFD splits an accent off its letter, but a ligature is one character
    // rather than a composition, so it survives untouched. CIQUAL is full of
    // them — « Bœuf », « Œuf » — and nobody types them, so they are expanded
    // first and by hand.
    .replace(/\u0153/g, "oe")
    .replace(/\u0152/g, "OE")
    .replace(/\u00e6/g, "ae")
    .replace(/\u00c6/g, "AE")
    .normalize("NFD")
    // Combining diacritics — what NFD split off the base letters above.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/**
 * The twelve components this build knows about: the five Morgane's feedback
 * names, plus the micronutrients a micronutrition practice reaches for.
 *
 * Extending it is one entry. Which components her practice actually uses
 * beyond these is an open question on the stub — the answer lands here and
 * nowhere else.
 */
export const nutrientComponents: readonly NutrientComponent[] = [
  {
    key: "protein",
    label: "Protéines",
    // 25000 is protein by the food's own Jones factor, which is the column
    // CIQUAL fills for nearly everything; 25003 (N x 6.25) is the fallback for
    // the rows where it does not.
    codes: ["25000", "25003"],
    unit: "g/100 g",
    direction: "increase",
    phrases: ["proteine", "proteines", "protein"],
  },
  {
    key: "fibre",
    label: "Fibres alimentaires",
    codes: ["34100"],
    unit: "g/100 g",
    direction: "increase",
    phrases: ["fibre", "fibres"],
  },
  {
    key: "omega3",
    label: "Oméga-3 (ALA, EPA, DHA)",
    codes: ["41833", "42053", "42263"],
    unit: "g/100 g",
    direction: "increase",
    phrases: [
      "omega 3",
      "omega-3",
      "omega3",
      "acide alpha-linolenique",
      "alpha-linolenique",
      "epa",
      "dha",
    ],
  },
  {
    key: "magnesium",
    label: "Magnésium",
    codes: ["10120"],
    unit: "mg/100 g",
    direction: "increase",
    phrases: ["magnesium"],
  },
  {
    key: "sugar",
    label: "Sucres",
    codes: ["32000"],
    unit: "g/100 g",
    direction: "reduce",
    phrases: ["sucre", "sucres"],
  },
  {
    key: "iron",
    label: "Fer",
    codes: ["10260"],
    unit: "mg/100 g",
    direction: "increase",
    phrases: ["fer"],
  },
  {
    key: "calcium",
    label: "Calcium",
    codes: ["10200"],
    unit: "mg/100 g",
    direction: "increase",
    phrases: ["calcium"],
  },
  {
    key: "zinc",
    label: "Zinc",
    codes: ["10300"],
    unit: "mg/100 g",
    direction: "increase",
    phrases: ["zinc"],
  },
  {
    key: "selenium",
    label: "Sélénium",
    codes: ["10340"],
    unit: "µg/100 g",
    direction: "increase",
    phrases: ["selenium"],
  },
  {
    key: "iodine",
    label: "Iode",
    codes: ["10530"],
    unit: "µg/100 g",
    direction: "increase",
    phrases: ["iode"],
  },
  {
    key: "vitamin-d",
    label: "Vitamine D",
    codes: ["52100"],
    unit: "µg/100 g",
    direction: "increase",
    phrases: ["vitamine d", "vitamin d"],
  },
  {
    key: "folate",
    label: "Vitamine B9 (folates)",
    codes: ["56700"],
    unit: "µg/100 g",
    direction: "increase",
    phrases: ["vitamine b9", "folate", "folates", "acide folique"],
  },
];

/**
 * Longest phrase first, so « vitamine b9 » is never shadowed by a shorter
 * phrase that happens to appear inside the same sentence.
 */
const byPhraseLength = (a: string, b: string) => b.length - a.length;

const phraseIndex: readonly { phrase: string; component: NutrientComponent }[] =
  nutrientComponents
    .flatMap((component) =>
      component.phrases.map((phrase) => ({ phrase, component })),
    )
    .sort((a, b) => byPhraseLength(a.phrase, b.phrase));

/**
 * Every component a recommendation mentions, in the order the phrases match.
 *
 * « Augmenter les protéines et favoriser les oméga-3 » is two components, and
 * a sentence naming none returns nothing rather than guessing.
 */
export const componentsForRecommendation = (
  text: string,
): readonly NutrientComponent[] => {
  const haystack = normaliseNutritionText(text);
  const found: NutrientComponent[] = [];

  for (const entry of phraseIndex) {
    if (found.includes(entry.component)) {
      continue;
    }
    // Word-boundary-ish: a phrase must not match inside a longer word, or
    // « fer » would fire on « conserve » and « iode » on « période ».
    const pattern = new RegExp(
      `(^|[^a-z0-9])${entry.phrase.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&")}($|[^a-z0-9])`,
    );
    if (pattern.test(haystack)) {
      found.push(entry.component);
    }
  }

  return found;
};

/** The component behind a key, or undefined — the console renders from this. */
export const nutrientComponentByKey = (
  key: string,
): NutrientComponent | undefined =>
  nutrientComponents.find((component) => component.key === key);
