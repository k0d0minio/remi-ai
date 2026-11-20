import {
  activeMealSlots,
  type MealConfiguration,
  type MealFasting,
  type MealOrientation,
  type MealConfigurationSlot,
  type MealSlotState,
} from "@remi/services/shared";
import { countLabel } from "@/components/patients/file/count-label";
import { NOT_ENTERED } from "@/components/patients/file/value";

/**
 * The words of « Repas » (REM-68, REM-70). The labels and the descriptions
 * are Morgane's, from her tables of stories 11 and 12.
 */
export const mealSlotLabels: Record<MealConfigurationSlot, string> = {
  breakfast: "Petit-déjeuner",
  lunch: "Déjeuner",
  snack: "Collation",
  dinner: "Dîner",
};

export const mealOrientationLabels: Record<MealOrientation, string> = {
  protein_fat: "Protéiné et lipidique",
  complete_balanced: "Complet et équilibré",
  light_plant: "Léger à dominante végétale",
  carb_leaning: "Plutôt glucidique",
  free: "Libre / selon les besoins",
};

export const mealOrientationDescriptions: Record<MealOrientation, string> = {
  protein_fat: "Priorité aux protéines et bons lipides, glucides modérés",
  complete_balanced: "Protéines, légumes, glucides complexes et bons lipides",
  light_plant: "Légumes, protéines adaptées et repas facile à digérer",
  carb_leaning: "Glucides de qualité, avec adaptation aux besoins",
  free: "REMI adapte selon le profil et les recommandations du praticien",
};

export const mealFastingLabels: Record<MealFasting, string> = {
  none: "Aucun jeûne intermittent",
  skip_breakfast: "Suppression du petit-déjeuner",
  skip_dinner: "Suppression du dîner",
};

export const mealFastingDescriptions: Record<MealFasting, string> = {
  none: "Aucun repas supprimé",
  skip_breakfast: "Ne pas proposer de recettes pour le petit-déjeuner",
  skip_dinner: "Ne pas proposer de recettes pour le dîner",
};

/** What a meal is, in one word beside its switch. */
export const mealSlotStateLabels: Record<MealSlotState, string> = {
  not_entered: NOT_ENTERED,
  on: "Activé",
  off: "Désactivé",
  removed_by_fasting: "Supprimé par le jeûne intermittent",
};

/** The one line of the folded row. A file with no configuration has none. */
export const mealConfigurationSummary = (
  configuration: MealConfiguration | null,
): string => {
  if (!configuration) {
    return NOT_ENTERED;
  }
  const meals = countLabel(activeMealSlots(configuration).length, {
    none: "Aucun repas actif",
    one: "repas actif",
    many: "repas actifs",
  });
  return configuration.fasting
    ? `${meals} · ${mealFastingLabels[configuration.fasting]}`
    : meals;
};
