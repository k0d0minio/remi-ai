/**
 * The vocabulary of the preparatory questionnaire — story 4, « Questionnaire
 * préparatoire du patient » (Morgane, 12 October 2026). The keys, their order
 * and their labels are the story's own lists. The types in
 * `db/models/patient-questionnaire.ts` derive from these constants, so a radio
 * option, a zod enum and the model can never disagree.
 *
 * Every label carries `fr` and `en`: client-facing text ships in both. The
 * French is Morgane's wording, kept as she wrote it.
 *
 * Isomorphic: no I/O, so the patient's pages and the console import it as is.
 */

import type { Locale } from "./i18n";

/** One label per locale. */
export type QuestionnaireLabel = Readonly<Record<Locale, string>>;

/**
 * « Sexe utilisé pour le calcul ». A field of its own, never `patient_profiles.sex`:
 * that one is an identity field with `other` and `unspecified`, and an energy
 * formula needs one of two answers or none.
 */
export const sexesForCalculation = ["female", "male"] as const;

export const sexForCalculationLabels = {
  female: { fr: "Femme", en: "Female" },
  male: { fr: "Homme", en: "Male" },
} as const satisfies Record<
  (typeof sexesForCalculation)[number],
  QuestionnaireLabel
>;

/** The four levels of physical activity, lowest first. */
export const activityLevels = ["low", "moderate", "high", "very_high"] as const;

/**
 * Each level's label, its description for the patient, and its NAP coefficient
 * (« niveau d'activité physique »), the multiplier `energy-needs` applies to
 * the resting expenditure. The coefficients are the story's table.
 */
export const activityLevelDetails = {
  low: {
    label: { fr: "Faible (sédentaire)", en: "Low (sedentary)" },
    description: {
      fr: "Travail assis, peu de marche, peu ou pas de sport",
      en: "Desk work, little walking, little or no sport",
    },
    nap: 1.4,
  },
  moderate: {
    label: { fr: "Modéré (légèrement actif)", en: "Moderate (lightly active)" },
    description: {
      fr: "Marche quotidienne, déplacements réguliers, sport léger 1 à 3 fois/semaine",
      en: "Daily walking, regular trips on foot, light sport 1 to 3 times a week",
    },
    nap: 1.6,
  },
  high: {
    label: { fr: "Élevé (actif)", en: "High (active)" },
    description: {
      fr: "Beaucoup de déplacements à pied, travail physique ou sport 4 à 5 fois/semaine",
      en: "Much walking, physical work or sport 4 to 5 times a week",
    },
    nap: 1.8,
  },
  very_high: {
    label: { fr: "Très élevé (très actif)", en: "Very high (very active)" },
    description: {
      fr: "Travail physique intense ou entraînements sportifs intensifs presque quotidiens",
      en: "Hard physical work or intensive training almost every day",
    },
    nap: 2.0,
  },
} as const satisfies Record<
  (typeof activityLevels)[number],
  {
    label: QuestionnaireLabel;
    description: QuestionnaireLabel;
    nap: number;
  }
>;

/**
 * « Régime / type d'alimentation », one choice. `none` is « aucun régime
 * particulier ». The story makes it the default selection on the page, but the
 * column stays null until the patient answers (D-30: nothing is invented).
 * `other` carries a note in `diet_note`.
 */
export const diets = [
  "none",
  "omnivore",
  "flexitarian",
  "pescatarian",
  "vegetarian",
  "vegan",
  "ketogenic",
  "other",
] as const;

export const dietLabels = {
  none: { fr: "Aucun régime particulier", en: "No particular diet" },
  omnivore: { fr: "Omnivore", en: "Omnivore" },
  flexitarian: { fr: "Flexitarien", en: "Flexitarian" },
  pescatarian: { fr: "Pescétarien", en: "Pescatarian" },
  vegetarian: { fr: "Végétarien", en: "Vegetarian" },
  vegan: { fr: "Végétalien / vegan", en: "Vegan" },
  ketogenic: { fr: "Cétogène", en: "Ketogenic" },
  other: { fr: "Autre", en: "Other" },
} as const satisfies Record<(typeof diets)[number], QuestionnaireLabel>;

/** The two kinds of row in `patient_allergens`. */
export const allergenKinds = ["allergy", "intolerance"] as const;

/** « Allergies », several choices, in the story's order. */
export const allergens = [
  "gluten",
  "crustaceans",
  "eggs",
  "fish",
  "peanuts",
  "soy",
  "milk",
  "tree_nuts",
  "celery",
  "mustard",
  "sesame",
  "sulphites",
  "lupin",
  "molluscs",
  "other",
] as const;

export const allergenLabels = {
  gluten: { fr: "Gluten", en: "Gluten" },
  crustaceans: { fr: "Crustacés", en: "Crustaceans" },
  eggs: { fr: "Œufs", en: "Eggs" },
  fish: { fr: "Poissons", en: "Fish" },
  peanuts: { fr: "Arachides", en: "Peanuts" },
  soy: { fr: "Soja", en: "Soy" },
  milk: { fr: "Lait / protéines de lait", en: "Milk / milk proteins" },
  tree_nuts: { fr: "Fruits à coque", en: "Tree nuts" },
  celery: { fr: "Céleri", en: "Celery" },
  mustard: { fr: "Moutarde", en: "Mustard" },
  sesame: { fr: "Sésame", en: "Sesame" },
  sulphites: { fr: "Sulfites", en: "Sulphites" },
  lupin: { fr: "Lupin", en: "Lupin" },
  molluscs: { fr: "Mollusques", en: "Molluscs" },
  other: { fr: "Autre", en: "Other" },
} as const satisfies Record<(typeof allergens)[number], QuestionnaireLabel>;

/**
 * « Tous »: the whole family. A category with no sub-key at all is excluded
 * whole too, by precaution. « Tous » only confirms it. Never stored beside an
 * individual sub-key of the same category.
 */
export const ALL_SUB_KEY = "all";

export const allSubKeyLabel: QuestionnaireLabel = { fr: "Tous", en: "All" };

/**
 * The sub-lists that open under a checked category. Gluten's is the story's
 * « blé, seigle, orge, avoine, épeautre », which is how a wheat allergy is
 * declared on its own (criterion 23). Gluten's list has no « autre »: the
 * story gives it none.
 */
export const allergenSubLists = {
  gluten: ["wheat", "rye", "barley", "oats", "spelt"],
  tree_nuts: [
    "almond",
    "hazelnut",
    "walnut",
    "cashew",
    "pecan",
    "pistachio",
    "brazil_nut",
    "macadamia",
    "other",
  ],
  fish: [
    "salmon",
    "tuna",
    "cod",
    "sole",
    "trout",
    "sardine",
    "mackerel",
    "anchovy",
    "other",
  ],
  crustaceans: ["shrimp", "crab", "lobster", "langoustine", "other"],
  molluscs: ["mussel", "oyster", "squid", "octopus", "scallop", "other"],
} as const satisfies Partial<
  Record<(typeof allergens)[number], readonly string[]>
>;

export const allergenSubLabels = {
  gluten: {
    wheat: { fr: "Blé", en: "Wheat" },
    rye: { fr: "Seigle", en: "Rye" },
    barley: { fr: "Orge", en: "Barley" },
    oats: { fr: "Avoine", en: "Oats" },
    spelt: { fr: "Épeautre", en: "Spelt" },
  },
  tree_nuts: {
    almond: { fr: "Amande", en: "Almond" },
    hazelnut: { fr: "Noisette", en: "Hazelnut" },
    walnut: { fr: "Noix", en: "Walnut" },
    cashew: { fr: "Noix de cajou", en: "Cashew" },
    pecan: { fr: "Noix de pécan", en: "Pecan" },
    pistachio: { fr: "Pistache", en: "Pistachio" },
    brazil_nut: { fr: "Noix du Brésil", en: "Brazil nut" },
    macadamia: { fr: "Noix de macadamia", en: "Macadamia" },
    other: { fr: "Autre", en: "Other" },
  },
  fish: {
    salmon: { fr: "Saumon", en: "Salmon" },
    tuna: { fr: "Thon", en: "Tuna" },
    cod: { fr: "Cabillaud", en: "Cod" },
    sole: { fr: "Sole", en: "Sole" },
    trout: { fr: "Truite", en: "Trout" },
    sardine: { fr: "Sardine", en: "Sardine" },
    mackerel: { fr: "Maquereau", en: "Mackerel" },
    anchovy: { fr: "Anchois", en: "Anchovy" },
    other: { fr: "Autre", en: "Other" },
  },
  crustaceans: {
    shrimp: { fr: "Crevette", en: "Shrimp" },
    crab: { fr: "Crabe", en: "Crab" },
    lobster: { fr: "Homard", en: "Lobster" },
    langoustine: { fr: "Langoustine", en: "Langoustine" },
    other: { fr: "Autre", en: "Other" },
  },
  molluscs: {
    mussel: { fr: "Moule", en: "Mussel" },
    oyster: { fr: "Huître", en: "Oyster" },
    squid: { fr: "Calamar", en: "Squid" },
    octopus: { fr: "Poulpe", en: "Octopus" },
    scallop: { fr: "Coquille Saint-Jacques", en: "Scallop" },
    other: { fr: "Autre", en: "Other" },
  },
} as const satisfies {
  [K in keyof typeof allergenSubLists]: Record<
    (typeof allergenSubLists)[K][number],
    QuestionnaireLabel
  >;
};

/** « Intolérances », several choices, in the story's order. */
export const intolerances = [
  "lactose",
  "gluten",
  "milk_proteins",
  "egg",
  "fructose",
  "sorbitol",
  "polyols",
  "histamine",
  "fodmap",
  "sulphites",
  "other",
] as const;

export const intoleranceLabels = {
  lactose: { fr: "Lactose", en: "Lactose" },
  gluten: { fr: "Gluten", en: "Gluten" },
  milk_proteins: {
    fr: "Protéines de lait / caséine",
    en: "Milk proteins / casein",
  },
  egg: { fr: "Œuf", en: "Egg" },
  fructose: { fr: "Fructose", en: "Fructose" },
  sorbitol: { fr: "Sorbitol", en: "Sorbitol" },
  polyols: { fr: "Polyols", en: "Polyols" },
  histamine: { fr: "Histamine", en: "Histamine" },
  fodmap: { fr: "FODMAP", en: "FODMAP" },
  sulphites: { fr: "Sulfites", en: "Sulphites" },
  other: { fr: "Autre", en: "Other" },
} as const satisfies Record<(typeof intolerances)[number], QuestionnaireLabel>;

/** « Aucune allergie connue » and « Aucune intolérance connue ». */
export const noneKnownLabels = {
  allergy: { fr: "Aucune allergie connue", en: "No known allergy" },
  intolerance: { fr: "Aucune intolérance connue", en: "No known intolerance" },
} as const satisfies Record<(typeof allergenKinds)[number], QuestionnaireLabel>;

/**
 * The gate question: « Avez-vous réalisé un test génétique permettant de
 * connaître vos génotypes APOE, DIO2 et AMY1A ? ». Optional: null is no answer.
 */
export const geneticTestAnswers = ["yes", "no_or_unknown"] as const;

export const geneticTestAnswerLabels = {
  yes: { fr: "Oui", en: "Yes" },
  no_or_unknown: { fr: "Non / Je ne sais pas", en: "No / I do not know" },
} as const satisfies Record<
  (typeof geneticTestAnswers)[number],
  QuestionnaireLabel
>;

/**
 * The three genotype lists, one choice each. Stored in the laboratory's own
 * notation, so a value reads the same on the report and in the database. The
 * A/H/M categories wait on Morgane's validation of the laboratory mapping
 * (story 4, question 3): they are stored and never interpreted until then.
 */
export const apoeGenotypes = [
  "E2/E2",
  "E2/E3",
  "E3/E3",
  "E3/E4",
  "E4/E4",
  "E2/E4",
] as const;

export const dio2Categories = ["A", "H", "M"] as const;

export const amy1aCategories = ["A", "H", "M"] as const;

/**
 * The mandatory fields of the questionnaire, in the order the list names them
 * (story 4, criterion 1): « Sexe, taille, poids actuel, niveau d'activité
 * physique et motif de consultation sont obligatoires », plus an explicit
 * answer on allergies and on intolerances. Jamie accepted the list on
 * 2026-11-03.
 *
 * One list for both sides: the console's « Champs manquants » and the
 * patient's questionnaire read it, so the two never disagree on what makes a
 * file « Prêt pour consultation ».
 */
export const mandatoryQuestionnaireFields = [
  "sexForCalculation",
  "heightCm",
  "weightKg",
  "activityLevel",
  "consultationReason",
  "allergies",
  "intolerances",
] as const;

export type MandatoryQuestionnaireField =
  (typeof mandatoryQuestionnaireFields)[number];

export const mandatoryQuestionnaireFieldLabels = {
  sexForCalculation: {
    fr: "Sexe utilisé pour le calcul",
    en: "Sex used for the calculation",
  },
  heightCm: { fr: "Taille", en: "Height" },
  weightKg: { fr: "Poids actuel", en: "Current weight" },
  activityLevel: {
    fr: "Niveau d'activité physique",
    en: "Physical activity level",
  },
  consultationReason: {
    fr: "Motif de consultation",
    en: "Reason for consultation",
  },
  allergies: { fr: "Allergies", en: "Allergies" },
  intolerances: { fr: "Intolérances", en: "Intolerances" },
} as const satisfies Record<MandatoryQuestionnaireField, QuestionnaireLabel>;

/** What the completeness check reads. Null is « Non renseigné » (D-30). */
export type QuestionnaireCompleteness = {
  sexForCalculation: string | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: string | null;
  consultationReason: string | null;
  /** True for « Aucune allergie connue », false for declared rows, null unanswered. */
  noKnownAllergies: boolean | null;
  noKnownIntolerances: boolean | null;
  /** How many rows of each kind `patient_allergens` holds. */
  allergyCount: number;
  intoleranceCount: number;
};

/**
 * An allergy list is answered by « Aucune allergie connue » or by at least one
 * checked box. A `false` flag with no row is no answer: nothing is declared.
 */
const listAnswered = (noneKnown: boolean | null, count: number) =>
  noneKnown === true || count > 0;

/** The mandatory fields still missing, in the list's order. Empty when complete. */
export const missingMandatoryFields = (
  input: QuestionnaireCompleteness,
): MandatoryQuestionnaireField[] => {
  const filled: Record<MandatoryQuestionnaireField, boolean> = {
    sexForCalculation: input.sexForCalculation !== null,
    heightCm: input.heightCm !== null,
    weightKg: input.weightKg !== null,
    activityLevel: input.activityLevel !== null,
    consultationReason:
      input.consultationReason !== null &&
      input.consultationReason.trim() !== "",
    allergies: listAnswered(input.noKnownAllergies, input.allergyCount),
    intolerances: listAnswered(
      input.noKnownIntolerances,
      input.intoleranceCount,
    ),
  };
  return mandatoryQuestionnaireFields.filter((field) => !filled[field]);
};

/**
 * The optional fields of the questionnaire, in the order the patient meets
 * them: every field that is not mandatory (story 6, criterion 3). The console's
 * « Informations manquantes » lists the empty ones under « Facultatives ».
 * Jamie accepted the list on 2026-11-10.
 *
 * `dietNote` counts only after « Autre ». The three genotypes count only after
 * « Oui » to the test, and only under a `given` genetic consent: without it the
 * service returns them as null, and an absence the practitioner cannot see is
 * no missing field.
 */
export const optionalQuestionnaireFields = [
  "birthDate",
  "phone",
  "desiredWeightKg",
  "consultationDate",
  "diet",
  "dietNote",
  "celiacDisease",
  "pathologies",
  "medications",
  "supplements",
  "geneticTest",
  "apoe",
  "dio2",
  "amy1a",
] as const;

export type OptionalQuestionnaireField =
  (typeof optionalQuestionnaireFields)[number];

export const optionalQuestionnaireFieldLabels = {
  birthDate: { fr: "Date de naissance", en: "Date of birth" },
  phone: { fr: "Téléphone", en: "Phone" },
  desiredWeightKg: { fr: "Poids souhaité", en: "Desired weight" },
  consultationDate: { fr: "Date de consultation", en: "Consultation date" },
  diet: { fr: "Régime / type d'alimentation", en: "Diet / type of eating" },
  dietNote: { fr: "Précision du régime", en: "Diet details" },
  celiacDisease: { fr: "Maladie cœliaque", en: "Coeliac disease" },
  pathologies: { fr: "Pathologies", en: "Medical conditions" },
  medications: { fr: "Médicaments", en: "Medications" },
  supplements: { fr: "Compléments alimentaires", en: "Food supplements" },
  geneticTest: { fr: "Test génétique", en: "Genetic test" },
  apoe: { fr: "Génotype APOE", en: "APOE genotype" },
  dio2: { fr: "Génotype DIO2", en: "DIO2 genotype" },
  amy1a: { fr: "Génotype AMY1A", en: "AMY1A genotype" },
} as const satisfies Record<OptionalQuestionnaireField, QuestionnaireLabel>;

/** What the optional check reads. Null, or an empty text, is « Non renseigné ». */
export type OptionalQuestionnaireAnswers = Readonly<
  Record<
    OptionalQuestionnaireField,
    string | number | boolean | null | undefined
  >
> & {
  /** The genetic consent is `given`: the genotype is visible. */
  genotypeOpen: boolean;
};

const answered = (value: string | number | boolean | null | undefined) =>
  value !== null &&
  value !== undefined &&
  (typeof value !== "string" || value.trim() !== "");

/** The optional fields still empty, in the list's order. */
export const missingOptionalFields = (
  input: OptionalQuestionnaireAnswers,
): OptionalQuestionnaireField[] => {
  const asked = (field: OptionalQuestionnaireField) => {
    if (field === "dietNote") {
      return input.diet === "other";
    }
    if (field === "apoe" || field === "dio2" || field === "amy1a") {
      return input.genotypeOpen && input.geneticTest === "yes";
    }
    return true;
  };
  return optionalQuestionnaireFields.filter(
    (field) => asked(field) && !answered(input[field]),
  );
};
