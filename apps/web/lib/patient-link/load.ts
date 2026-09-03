import { cache } from "react";
import {
  getPatientByShareToken,
  getPatientSummary,
  listMealEntries,
  listPantryEssentials,
  listPatientGoals,
  listPatientRecipes,
  listPatientRecommendations,
  listPatientSupplements,
  recordPatientLinkOpened,
} from "@remi/services/server";
import { ensureDatabase } from "@/lib/database";
import type { PatientLinkSegment } from "./segments";

/**
 * Everything the six segments render, read once per request.
 *
 * Every page loads the whole record rather than just its own slice, because
 * the navigation has to know which segments are non-empty on every route —
 * the hiding rule is data-driven, so "which segments exist for this patient"
 * is itself a read of all six. `cache` collapses the layout's call and the
 * page's call into one set of queries per request.
 */
export const loadPatientLink = cache(async (token: string) => {
  ensureDatabase();

  const result = await getPatientByShareToken(token);
  if (!result.ok) {
    return null;
  }
  const patient = result.data;

  const [
    summary,
    goals,
    recommendations,
    supplements,
    essentials,
    recipes,
    meals,
  ] = await Promise.all([
    getPatientSummary(patient.id),
    listPatientGoals(patient.id),
    listPatientRecommendations(patient.id),
    listPatientSupplements(patient.id),
    listPantryEssentials(patient.id),
    listPatientRecipes(patient.id),
    listMealEntries(patient.id),
  ]);

  // Awaited rather than fired and forgotten: an unawaited promise in a server
  // component can be cut off when the response finishes. The service
  // rate-limits itself, so this is usually a read and no write at all. It
  // fires on arrival at any of the six routes, so a patient who opens the
  // link and reads three segments is recorded as having opened it.
  await recordPatientLinkOpened(patient.id);

  return {
    patient,
    summary,
    goals,
    recommendations,
    supplements,
    essentials,
    recipes,
    meals,
  };
});

export type PatientLinkData = NonNullable<
  Awaited<ReturnType<typeof loadPatientLink>>
>;

/**
 * Which segments this patient's record has something to show for.
 *
 * Home always appears — it carries the greeting even when nothing else is
 * written. A segment whose read came back empty appears in no navigation and
 * 404s at its own URL: a nav entry leading to an empty page and a reachable
 * empty page are the same broken product, and Morgane fills patients at her
 * own pace.
 */
export const visibleSegments = (
  data: PatientLinkData,
): readonly PatientLinkSegment[] => {
  const present: PatientLinkSegment[] = ["home"];
  if (data.recommendations.length > 0) present.push("recommandations");
  if (data.supplements.length > 0) present.push("complements");
  if (data.essentials.length > 0) present.push("placard-frigo");
  if (data.recipes.length > 0) present.push("recettes");
  if (data.meals.length > 0) present.push("repas");
  return present;
};

/** Whether a given segment is reachable for this patient. */
export const hasSegment = (
  data: PatientLinkData,
  segment: PatientLinkSegment,
): boolean => visibleSegments(data).includes(segment);
