import { z } from "zod";
import { recommendationCategories } from "../../../shared/patient";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { PatientRecommendation } from "../../models/patient-recommendation";

/**
 * The recommendations Morgane encodes into a patient profile — the protocol,
 * as structured text. Phase 1 has no parser and no consultation record; she is
 * the structuring step, and this service is where what she types lands.
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

/** Oldest first — the order Morgane encoded the protocol in is the order it reads in. */
export const listPatientRecommendations = async (
  patientId: Id,
): Promise<readonly PatientRecommendation[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await recommendations().findMany({ patientId }, { limit: 200 });
  return [...page.items].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
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
  });
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
  const updated = await recommendations().update(id, parsed.data);
  return updated ? ok(updated) : err("not_found", "no such recommendation");
};

export const deletePatientRecommendation = async (
  id: Id,
): Promise<Result<true>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such recommendation");
  }
  const removed = await recommendations().remove(id);
  return removed ? ok(true) : err("not_found", "no such recommendation");
};
