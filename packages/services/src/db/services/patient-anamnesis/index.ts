import { z } from "zod";
import { anamnesisCategories } from "../../../shared/patient";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type {
  AnamnesisCategory,
  PatientAnamnesis,
} from "../../models/patient-anamnesis";
import { touchPatient } from "../patients";

/**
 * The structured anamnesis — § B's twelve categories, one row per (patient,
 * category), replacing the single `anamnesis` blob on the profile.
 *
 * Emptiness is the absence of a row. `setPatientAnamnesis` with an empty body
 * deletes rather than storing `""`, so a category Morgane has not touched costs
 * nothing and the two ways of having nothing to say are one state.
 *
 * These never reach the patient link, and — as with the consultation notes —
 * that is a property of this service's callers rather than a flag on the row:
 * `getPatientByShareToken` reads `patient_profiles` and nothing here.
 */

const entries = () =>
  getDatabase().collection<PatientAnamnesis>("patient_anamnesis");

const uuidSchema = z.uuid();

const categorySchema = z.enum(anamnesisCategories);

const bodySchema = z.string().trim().max(20_000);

/** § B's order, which is the order she works through them. */
const rank = (category: AnamnesisCategory) =>
  anamnesisCategories.indexOf(category);

/**
 * The rows that exist, in § B's order. Categories with nothing recorded are
 * absent — the caller renders the full twelve from `anamnesisCategories` and
 * looks each one up here, so an unknown key left over from a trimmed vocabulary
 * simply stops being rendered instead of breaking the page.
 */
export const listPatientAnamnesis = async (
  patientId: Id,
): Promise<readonly PatientAnamnesis[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await entries().findMany({ patientId }, { limit: 200 });
  return [...page.items].sort((a, b) => rank(a.category) - rank(b.category));
};

/**
 * Write one category. The other eleven are never read or touched, which is what
 * makes the block safe to edit one area at a time mid-consultation.
 */
export const setPatientAnamnesis = async (
  patientId: Id,
  category: string,
  body: string,
): Promise<Result<PatientAnamnesis | null>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsedCategory = categorySchema.safeParse(category);
  if (!parsedCategory.success) {
    return err("invalid_input", "that anamnesis category does not exist");
  }
  const parsedBody = bodySchema.safeParse(body);
  if (!parsedBody.success) {
    return err("invalid_input", parsedBody.error.issues[0].message);
  }

  const page = await entries().findMany(
    { patientId, category: parsedCategory.data },
    { limit: 1 },
  );
  const existing = page.items[0] ?? null;

  // An empty body is a deletion, not a stored blank: see the module comment.
  if (parsedBody.data === "") {
    if (existing) {
      await entries().remove(existing.id);
      await touchPatient(patientId);
    }
    return ok(null);
  }

  const written = existing
    ? await entries().update(existing.id, { body: parsedBody.data })
    : await entries().insert({
        patientId,
        category: parsedCategory.data,
        body: parsedBody.data,
      });
  if (!written) {
    return err("not_found", "no such anamnesis entry");
  }
  await touchPatient(patientId);
  return ok(written);
};
