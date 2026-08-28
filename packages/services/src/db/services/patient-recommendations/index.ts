import { z } from "zod";
import { recommendationCategories } from "../../../shared/patient";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { PatientRecommendation } from "../../models/patient-recommendation";
import type { RecommendationCategory } from "../../models/recommendation";
import { touchPatient } from "../patients";

/**
 * The recommendations Morgane encodes into a patient profile — the protocol,
 * as structured text. Phase 1 has no parser and no consultation record; she is
 * the structuring step, and this service is where what she types lands.
 *
 * Two orderings matter and they are not the same: `position` is the order
 * Morgane chose within a category, and `archivedAt` splits the protocol in
 * force from the protocol that was. Nothing here deletes by default — a
 * recommendation that stopped is the answer to "why did we stop it".
 */

const recommendations = () =>
  getDatabase().collection<PatientRecommendation>("patient_recommendations");

const uuidSchema = z.uuid();

const recommendationFields = z.object({
  category: z.enum(recommendationCategories),
  title: z.string().trim().min(1, "a title is required").max(200),
  detail: z.string().trim().max(10_000),
});

export type RecommendationInput = Partial<z.infer<typeof recommendationFields>>;

/**
 * The category order in `recommendationCategories` is the reading order of a
 * protocol; `position` orders within it, and creation time is the tiebreak for
 * the rows that predate positions.
 */
const byCategoryThenPosition = (
  a: PatientRecommendation,
  b: PatientRecommendation,
) => {
  const categoryDelta =
    recommendationCategories.indexOf(a.category) -
    recommendationCategories.indexOf(b.category);
  if (categoryDelta !== 0) {
    return categoryDelta;
  }
  if (a.position !== b.position) {
    return a.position - b.position;
  }
  return a.createdAt.getTime() - b.createdAt.getTime();
};

const allForPatient = async (
  patientId: Id,
): Promise<readonly PatientRecommendation[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await recommendations().findMany({ patientId }, { limit: 200 });
  return [...page.items].sort(byCategoryThenPosition);
};

/** The protocol in force — what the patient link shows. */
export const listPatientRecommendations = async (
  patientId: Id,
): Promise<readonly PatientRecommendation[]> =>
  (await allForPatient(patientId)).filter(
    (recommendation) => recommendation.archivedAt === null,
  );

/** What was in force and no longer is, newest archive first. */
export const listArchivedPatientRecommendations = async (
  patientId: Id,
): Promise<readonly PatientRecommendation[]> =>
  (await allForPatient(patientId))
    .filter((recommendation) => recommendation.archivedAt !== null)
    .sort(
      (a, b) => (b.archivedAt?.getTime() ?? 0) - (a.archivedAt?.getTime() ?? 0),
    );

/** Appends to the end of its category, leaving the existing run untouched. */
const nextPosition = async (
  patientId: Id,
  category: RecommendationCategory,
) => {
  const siblings = (await allForPatient(patientId)).filter(
    (recommendation) => recommendation.category === category,
  );
  return siblings.reduce(
    (highest, recommendation) => Math.max(highest, recommendation.position + 1),
    0,
  );
};

export const addPatientRecommendation = async (
  patientId: Id,
  input: RecommendationInput,
): Promise<Result<PatientRecommendation>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsed = recommendationFields
    .partial({ detail: true })
    .safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const created = await recommendations().insert({
    patientId,
    category: parsed.data.category,
    title: parsed.data.title,
    detail: parsed.data.detail ?? "",
    position: await nextPosition(patientId, parsed.data.category),
    archivedAt: null,
  });
  await touchPatient(patientId);
  return ok(created);
};

export const updatePatientRecommendation = async (
  id: Id,
  input: RecommendationInput,
): Promise<Result<PatientRecommendation>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such recommendation");
  }
  const parsed = recommendationFields.partial().safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const existing = await recommendations().findById(id);
  if (!existing) {
    return err("not_found", "no such recommendation");
  }
  // Moving between categories appends to the destination — keeping the old
  // rank would drop the entry into an arbitrary slot in a run it never joined.
  const patch: Partial<PatientRecommendation> = { ...parsed.data };
  if (parsed.data.category && parsed.data.category !== existing.category) {
    patch.position = await nextPosition(
      existing.patientId,
      parsed.data.category,
    );
  }
  const updated = await recommendations().update(id, patch);
  if (!updated) {
    return err("not_found", "no such recommendation");
  }
  await touchPatient(existing.patientId);
  return ok(updated);
};

/**
 * Moves an entry one slot up or down within its category.
 *
 * The move is done in an array and the whole run is then renumbered 0…n-1,
 * rather than swapping the two stored ranks. Two reasons: every row created
 * before this column existed carries position 0, so swapping stored values
 * would swap two zeroes for two zeroes; and a renumber leaves the run in a
 * canonical state, so the repair is a side effect of the first reorder rather
 * than a backfill nobody remembers to run. A category holds a handful of
 * entries — the extra writes are not worth optimising away.
 */
export const movePatientRecommendation = async (
  id: Id,
  direction: "up" | "down",
): Promise<Result<PatientRecommendation>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such recommendation");
  }
  const existing = await recommendations().findById(id);
  if (!existing) {
    return err("not_found", "no such recommendation");
  }
  const run = (await listPatientRecommendations(existing.patientId)).filter(
    (recommendation) => recommendation.category === existing.category,
  );
  const index = run.findIndex((recommendation) => recommendation.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= run.length) {
    // Already at the end of its run: not an error, just nothing to do.
    return ok(existing);
  }

  const reordered = [...run];
  reordered[index] = run[target];
  reordered[target] = run[index];

  for (const [position, recommendation] of reordered.entries()) {
    if (recommendation.position !== position) {
      await recommendations().update(recommendation.id, { position });
    }
  }
  await touchPatient(existing.patientId);

  const moved = await recommendations().findById(id);
  return moved ? ok(moved) : err("not_found", "no such recommendation");
};

export const archivePatientRecommendation = async (
  id: Id,
  archived: boolean,
): Promise<Result<PatientRecommendation>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such recommendation");
  }
  const updated = await recommendations().update(id, {
    archivedAt: archived ? new Date() : null,
  });
  if (!updated) {
    return err("not_found", "no such recommendation");
  }
  await touchPatient(updated.patientId);
  return ok(updated);
};

/**
 * The permanent one. Archiving is the everyday move; this exists for a row
 * that should never have been written — a wrong patient, a test entry.
 */
export const deletePatientRecommendation = async (
  id: Id,
): Promise<Result<true>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such recommendation");
  }
  const existing = await recommendations().findById(id);
  const removed = await recommendations().remove(id);
  if (!removed) {
    return err("not_found", "no such recommendation");
  }
  if (existing) {
    await touchPatient(existing.patientId);
  }
  return ok(true);
};
