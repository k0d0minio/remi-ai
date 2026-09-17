import {
  ageInYears,
  recommendationCategories,
  type PantryEssential,
  type PatientContextInput,
  type PatientGoal,
  type PatientInstruction,
  type PatientProfile,
  type PatientRecommendation,
  type PatientSummary,
  type PatientSupplement,
} from "@remi/services/shared";
import {
  categoryLabels,
  cookingAffinityLabels,
  patientSexLabels,
} from "@/components/patients/vocabulary";

type Source = {
  patient: PatientProfile;
  goals: readonly PatientGoal[];
  instruction: PatientInstruction | null;
  recommendations: readonly PatientRecommendation[];
  supplements: readonly PatientSupplement[];
  essentials: readonly PantryEssential[];
  summary: PatientSummary | null;
};

/**
 * The console's half of the context export: the loaded record narrowed to what
 * the assembler accepts.
 *
 * It exists because that narrowing is exactly where the two guarantees live.
 * The first is pseudonymity — `PatientContextInput` has no field for
 * `fullName`, `email` or `shareToken`, so this function cannot pass one on even
 * by accident. The second is the French: the closed vocabularies are rendered
 * from `vocabulary.ts`, their one home, rather than duplicated inside
 * `@remi/services`.
 *
 * `unspecified` becomes the empty string rather than "non précisé", because a
 * prompt gains nothing from being told a field was left blank.
 */
export const patientContextInput = ({
  patient,
  goals,
  instruction,
  recommendations,
  supplements,
  essentials,
  summary,
}: Source): PatientContextInput => ({
  profile: {
    pseudonym: patient.pseudonym,
    age: ageInYears(patient.birthDate),
    sex: patient.sex === "unspecified" ? "" : patientSexLabels[patient.sex],
    objective: patient.objective,
    dietaryRegime: patient.dietaryRegime,
    allergies: patient.allergies,
    intolerances: patient.intolerances,
    constraints: patient.constraints,
    preferences: patient.preferences,
    likesCooking: patient.likesCooking
      ? cookingAffinityLabels[patient.likesCooking]
      : "",
    foodBudget: patient.foodBudget,
    medications: patient.medications,
    supplements: patient.supplements,
  },
  goals: goals.map((goal) => ({ title: goal.title, baseline: goal.baseline })),
  instruction: instruction?.body ?? "",
  // The same walk as `RecommendationGroups`: the service returns entries in
  // category-then-rank order, so the category order is the vocabulary's.
  recommendations: recommendationCategories
    .map((category) => ({
      categoryLabel: categoryLabels[category],
      entries: recommendations
        .filter((recommendation) => recommendation.category === category)
        .map((recommendation) => ({
          title: recommendation.title,
          detail: recommendation.detail,
        })),
    }))
    .filter((group) => group.entries.length > 0),
  supplements: supplements.map((supplement) => ({
    name: supplement.name,
    dose: supplement.dose,
    timing: supplement.timing,
    reason: supplement.reason,
  })),
  essentials: essentials.map((essential) => ({
    item: essential.item,
    why: essential.why,
  })),
  summary: summary?.body ?? "",
});
