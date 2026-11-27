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
  female: { fr: "Femme"},
  male: { fr: "Homme"},
} as const satisfies Record<
  (typeof sexesForCalculation)[number],
  QuestionnaireLabel
>;

/** The four levels of physical activity, lowest first. */
export const activityLevels = ["low", "moderate", "high", "very_high"] as const;

/**
 * Each level's label, its description, and its NAP coefficient (« niveau
 * d'activité physique »), the multiplier `energy-needs` applies to the resting
 * expenditure. The coefficients are the story's table. The descriptions are
 * Morgane's short ones (REM-160). They address no one, so the patient's
 * questionnaire and the console show the same text.
 */
export const activityLevelDetails = {
  low: {
    label: { fr: "Faible (sédentaire)"},
    description: {
      fr: "Travail assis, peu de marche ou de sport."
    },
    nap: 1.4,
  },
  moderate: {
    label: { fr: "Modéré (légèrement actif)"},
    description: {
      fr: "Marche quotidienne ou sport léger 1 à 3 fois/semaine."
    },
    nap: 1.6,
  },
  high: {
    label: { fr: "Élevé (actif)"},
    description: {
      fr: "Activité physique régulière ou sport 4 à 5 fois/semaine."
    },
    nap: 1.8,
  },
  very_high: {
    label: { fr: "Très élevé (très actif)"},
    description: {
      fr: "Travail physique intense ou sport intensif presque quotidien."
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
 * The diet, one choice. `none` is « Aucun régime particulier ». The patient's
 * page shows it as the proposed choice, but the column stays null until the
 * patient confirms it (REM-162, D-30: nothing is invented). `other` carries a
 * note in `diet_note`. The labels are Morgane's list of REM-162. Each side
 * writes its own question.
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
  none: {
    fr: "Aucun régime particulier"
  },
  omnivore: { fr: "Omnivore"},
  flexitarian: { fr: "Flexitarien"},
  pescatarian: { fr: "Pescétarien"},
  vegetarian: { fr: "Végétarien"},
  vegan: { fr: "Végétalien / vegan"},
  ketogenic: { fr: "Cétogène"},
  other: { fr: "Autre"},
} as const satisfies Record<(typeof diets)[number], QuestionnaireLabel>;

/**
 * Story 4's plausible ranges, inclusive: « taille 100 à 250 cm », « poids 25
 * à 300 kg ». The questionnaire refuses a value outside them, and the BMI
 * computes nothing from one (story 7). One home, so the two never disagree.
 */
export const heightCmRange = { min: 100, max: 250 } as const;

export const weightKgRange = { min: 25, max: 300 } as const;

/** The two kinds of row in `patient_allergens`. */
export const allergenKinds = ["allergy", "intolerance"] as const;

/**
 * « Allergies », several choices, in the story's order. `gluten` is the family
 * of the cereals that contain gluten. Its members are separate allergens
 * (REM-164): the forms show « Blé », « Seigle » and the others as boxes of
 * their own (`allergen-options.ts`), and a row is still `gluten/<cereal>`.
 */
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
  gluten: { fr: "Céréales contenant du gluten"},
  crustaceans: { fr: "Crustacés"},
  eggs: { fr: "Œufs"},
  fish: { fr: "Poissons"},
  peanuts: { fr: "Arachides"},
  soy: { fr: "Soja"},
  milk: { fr: "Lait / protéines de lait"},
  tree_nuts: { fr: "Fruits à coque"},
  celery: { fr: "Céleri"},
  mustard: { fr: "Moutarde"},
  sesame: { fr: "Sésame"},
  sulphites: { fr: "Sulfites"},
  lupin: { fr: "Lupin"},
  molluscs: { fr: "Mollusques"},
  other: { fr: "Autre"},
} as const satisfies Record<(typeof allergens)[number], QuestionnaireLabel>;

/**
 * « Tous »: the whole family. A category with no sub-key at all is excluded
 * whole too, by precaution. « Tous » only confirms it. Never stored beside an
 * individual sub-key of the same category.
 */
export const ALL_SUB_KEY = "all";

export const allSubKeyLabel: QuestionnaireLabel = { fr: "Tous"};

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
    wheat: { fr: "Blé"},
    rye: { fr: "Seigle"},
    barley: { fr: "Orge"},
    oats: { fr: "Avoine"},
    spelt: { fr: "Épeautre"},
  },
  tree_nuts: {
    almond: { fr: "Amande"},
    hazelnut: { fr: "Noisette"},
    walnut: { fr: "Noix"},
    cashew: { fr: "Noix de cajou"},
    pecan: { fr: "Noix de pécan"},
    pistachio: { fr: "Pistache"},
    brazil_nut: { fr: "Noix du Brésil"},
    macadamia: { fr: "Noix de macadamia"},
    other: { fr: "Autre"},
  },
  fish: {
    salmon: { fr: "Saumon"},
    tuna: { fr: "Thon"},
    cod: { fr: "Cabillaud"},
    sole: { fr: "Sole"},
    trout: { fr: "Truite"},
    sardine: { fr: "Sardine"},
    mackerel: { fr: "Maquereau"},
    anchovy: { fr: "Anchois"},
    other: { fr: "Autre"},
  },
  crustaceans: {
    shrimp: { fr: "Crevette"},
    crab: { fr: "Crabe"},
    lobster: { fr: "Homard"},
    langoustine: { fr: "Langoustine"},
    other: { fr: "Autre"},
  },
  molluscs: {
    mussel: { fr: "Moule"},
    oyster: { fr: "Huître"},
    squid: { fr: "Calamar"},
    octopus: { fr: "Poulpe"},
    scallop: { fr: "Coquille Saint-Jacques"},
    other: { fr: "Autre"},
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
  lactose: { fr: "Lactose"},
  gluten: { fr: "Gluten"},
  milk_proteins: {
    fr: "Protéines de lait / caséine"
  },
  egg: { fr: "Œuf"},
  fructose: { fr: "Fructose"},
  sorbitol: { fr: "Sorbitol"},
  polyols: { fr: "Polyols"},
  histamine: { fr: "Histamine"},
  fodmap: { fr: "FODMAP"},
  sulphites: { fr: "Sulfites"},
  other: { fr: "Autre"},
} as const satisfies Record<(typeof intolerances)[number], QuestionnaireLabel>;

/**
 * Morgane's short explanations of the terms that a patient knows less
 * (REM-164). They address no one, so the two sides show the same text.
 */
export const intoleranceDescriptions = {
  polyols: {
    fr: "Famille de glucides comprenant notamment le sorbitol.",
  },
  histamine: {
    fr: "Sensibilité rapportée à certains aliments contenant de l'histamine.",
  },
  fodmap: {
    fr: "Glucides fermentescibles pouvant provoquer des troubles digestifs chez certaines personnes.",
  },
} as const satisfies Partial<
  Record<(typeof intolerances)[number], QuestionnaireLabel>
>;

/** « Aucune allergie connue » and « Aucune intolérance connue ». */
export const noneKnownLabels = {
  allergy: { fr: "Aucune allergie connue"},
  intolerance: { fr: "Aucune intolérance connue"},
} as const satisfies Record<(typeof allergenKinds)[number], QuestionnaireLabel>;

/**
 * The gate question: « Avez-vous réalisé un test génétique permettant de
 * connaître vos génotypes APOE, DIO2 et AMY1A ? ». Optional: null is no answer.
 * « Non / Je ne sais pas » comes first (REM-166).
 */
export const geneticTestAnswers = ["no_or_unknown", "yes"] as const;

export const geneticTestAnswerLabels = {
  yes: { fr: "Oui"},
  no_or_unknown: { fr: "Non / Je ne sais pas"},
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
 * 2026-11-03. The consultation date is mandatory since REM-159 (Morgane's UAT
 * correction of 2026-11-26).
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
  "consultationDate",
  "allergies",
  "intolerances",
] as const;

export type MandatoryQuestionnaireField =
  (typeof mandatoryQuestionnaireFields)[number];

export const mandatoryQuestionnaireFieldLabels = {
  sexForCalculation: {
    fr: "Sexe utilisé pour le calcul"
  },
  heightCm: { fr: "Taille"},
  weightKg: { fr: "Poids actuel"},
  activityLevel: {
    fr: "Niveau d'activité physique"
  },
  consultationReason: {
    fr: "Motif de consultation"
  },
  consultationDate: { fr: "Date de consultation"},
  allergies: { fr: "Allergies"},
  intolerances: { fr: "Intolérances"},
} as const satisfies Record<MandatoryQuestionnaireField, QuestionnaireLabel>;

/**
 * The questionnaire's sections, in the order the patient meets them (story 4).
 * One list for both sides: the patient's steps and the groups of the console's
 * form read it, so the two keep the same structure. Each side writes its own
 * titles.
 */
export const questionnaireSections = [
  "identite",
  "profil",
  "consultation",
  "alimentation",
  "sante",
  "genetique",
] as const;

export type QuestionnaireSection = (typeof questionnaireSections)[number];

/** The section that asks each mandatory field. */
export const sectionOfMandatoryField = {
  sexForCalculation: "profil",
  heightCm: "profil",
  weightKg: "profil",
  activityLevel: "profil",
  consultationReason: "consultation",
  consultationDate: "consultation",
  allergies: "alimentation",
  intolerances: "alimentation",
} as const satisfies Record<MandatoryQuestionnaireField, QuestionnaireSection>;

/**
 * The missing mandatory fields of each section, in the list's order. A section
 * with an empty list is complete, or asks nothing mandatory.
 */
export const missingBySection = (
  missing: readonly MandatoryQuestionnaireField[],
): Record<QuestionnaireSection, MandatoryQuestionnaireField[]> => {
  const bySection: Record<QuestionnaireSection, MandatoryQuestionnaireField[]> =
    {
      identite: [],
      profil: [],
      consultation: [],
      alimentation: [],
      sante: [],
      genetique: [],
    };
  for (const field of mandatoryQuestionnaireFields) {
    if (missing.includes(field)) {
      bySection[sectionOfMandatoryField[field]].push(field);
    }
  }
  return bySection;
};

/** What the completeness check reads. Null is « Non renseigné » (D-30). */
export type QuestionnaireCompleteness = {
  sexForCalculation: string | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: string | null;
  consultationReason: string | null;
  /** `YYYY-MM-DD`, null when the file holds no consultation date (REM-159). */
  consultationDate: string | null;
  /**
   * The patient's today as `YYYY-MM-DD`. With it, a consultation date before
   * today counts as missing: the patient's questionnaire cannot finish on a
   * past date (REM-159). Without it, a stored date counts as filled: the
   * console keeps the date of a consultation that took place.
   */
  today?: string;
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
    consultationDate:
      input.consultationDate !== null &&
      input.consultationDate !== "" &&
      (input.today === undefined || input.consultationDate >= input.today),
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
  birthDate: { fr: "Date de naissance"},
  phone: { fr: "Téléphone"},
  desiredWeightKg: { fr: "Poids souhaité"},
  diet: { fr: "Régime / type d'alimentation"},
  dietNote: { fr: "Précision du régime"},
  celiacDisease: { fr: "Maladie cœliaque"},
  pathologies: { fr: "Pathologies"},
  medications: { fr: "Médicaments"},
  supplements: { fr: "Compléments alimentaires"},
  geneticTest: { fr: "Test génétique"},
  apoe: { fr: "Génotype APOE"},
  dio2: { fr: "Génotype DIO2"},
  amy1a: { fr: "Génotype AMY1A"},
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
