import { cookies } from "next/headers";
import { cache } from "react";
import {
  getCurrentChallenge,
  getWeeklyCheckIn,
  getPatientByShareToken,
  getPatientInstruction,
  getPatientSummary,
  listGoalScoreStrips,
  listMealEntries,
  listPastChallenges,
  listPantryEssentials,
  listPatientDocuments,
  listPatientGoals,
  listPatientMessages,
  listPatientRecipes,
  listPatientRecommendations,
  listPatientSupplements,
  recordPatientLinkOpened,
} from "@remi/services/server";
import { ensureDatabase } from "@/lib/database";
import { LINK_PREVIEW_COOKIE } from "./preview";
import type { PatientLinkSegment } from "./segments";

/**
 * Everything the segments render, read once per request.
 *
 * The standing instruction and the running challenge ride along for the home's
 * « cette semaine » block: two more reads on the same patient, under the same
 * token check as the rest.
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
    instruction,
    challenge,
    goals,
    recommendations,
    supplements,
    essentials,
    recipes,
    meals,
    documents,
    weeklyCheckIn,
    scoreStrips,
    pastChallenges,
    messages,
  ] = await Promise.all([
    getPatientSummary(patient.id),
    getPatientInstruction(patient.id),
    getCurrentChallenge(patient.id),
    listPatientGoals(patient.id),
    listPatientRecommendations(patient.id),
    listPatientSupplements(patient.id),
    listPantryEssentials(patient.id),
    listPatientRecipes(patient.id),
    listMealEntries(patient.id),
    listPatientDocuments(patient.id),
    getWeeklyCheckIn(patient.id),
    listGoalScoreStrips(patient.id),
    listPastChallenges(patient.id),
    listPatientMessages(patient.id),
  ]);

  // Awaited rather than fired and forgotten: an unawaited promise in a server
  // component can be cut off when the response finishes. The service
  // rate-limits itself, so this is usually a read and no write at all. It
  // fires on arrival at any of its routes, so a patient who opens the
  // link and reads three segments is recorded as having opened it.
  //
  // Not while Morgane is looking « comme la patiente »: the console marks that
  // visit (`./preview.ts`), and her look is not the patient opening their link.
  const previewing =
    (await cookies()).get(LINK_PREVIEW_COOKIE)?.value === patient.shareToken;
  if (!previewing) {
    await recordPatientLinkOpened(patient.id);
  }

  return {
    patient,
    summary,
    // Only `patientBody` is ever rendered — `body` is Morgane's line to REMI
    // and the home never falls back to it. It travels no further than this
    // module's callers, which read the one field.
    instruction,
    challenge,
    goals,
    recommendations,
    supplements,
    essentials,
    recipes,
    meals,
    documents,
    weeklyCheckIn,
    scoreStrips,
    pastChallenges,
    // The general thread, newest first. Only the body, the author, the date
    // and a reply's operator name ever render.
    messages,
  };
});

export type PatientLinkData = NonNullable<
  Awaited<ReturnType<typeof loadPatientLink>>
>;

/**
 * Which segments this patient's record has something to show for.
 *
 * A segment whose read came back empty appears in no navigation and 404s at
 * its own URL: a nav entry leading to an empty page and a reachable empty page
 * are the same broken product, and Morgane fills patients at her own pace.
 *
 * Progression shows when there is a goal to score or a challenge behind the
 * patient — the two things it is made of.
 *
 * Three segments are exempt, and for the same reason — they are not waiting on
 * her. Home carries the greeting. Repas carries « Je vais manger » / « J'ai
 * mangé », and Messages carries her § 6 question, so each is where the
 * patient's first entry is written: hiding one until an entry exists would
 * make the first one impossible to make.
 */
export const visibleSegments = (
  data: PatientLinkData,
): readonly PatientLinkSegment[] => {
  const present: PatientLinkSegment[] = ["home"];
  if (data.recommendations.length > 0) {
    present.push("recommandations");
  }
  if (data.supplements.length > 0) {
    present.push("complements");
  }
  if (data.essentials.length > 0) {
    present.push("placard-frigo");
  }
  if (
    data.recipes.length > 0 ||
    data.documents.some((document) => document.tag === "recipe")
  ) {
    present.push("recettes");
  }
  if (data.documents.length > 0) {
    present.push("documents");
  }
  present.push("repas");
  if (data.goals.length > 0 || data.pastChallenges.length > 0) {
    present.push("progression");
  }
  present.push("messages");
  return present;
};

/** Whether a given segment is reachable for this patient. */
export const hasSegment = (
  data: PatientLinkData,
  segment: PatientLinkSegment,
): boolean => visibleSegments(data).includes(segment);
