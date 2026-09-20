import { z } from "zod";
import { goalDirections } from "../../../shared/patient";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { PatientRecommendation } from "../../models/patient-recommendation";
import type { PatientRecommendationCheckIn } from "../../models/patient-recommendation-check-in";
import { touchPatient } from "../patients";

/**
 * The patient's own answers about their non-food recommendations — decision
 * D-9's « comment ça se passe ? », the half that has no console form.
 *
 * It is the goal trail's twin and stays deliberately thinner: a face and maybe
 * a word, written by the patient through the link and never by Morgane. So
 * there is no update path and no `writtenBy` — the one thing she does to a row
 * here is mark it seen.
 */

const checkIns = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientRecommendationCheckIn>(
    "patient_recommendation_check_ins",
  );

const recommendations = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientRecommendation>("patient_recommendations");

const uuidSchema = z.uuid();

/** The same day-not-instant date the goal trail keeps. */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "a date is required")
  .refine(
    (value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()),
    "that date is not valid",
  );

const checkInFields = z.object({
  checkedOn: isoDate,
  /**
   * Required, unlike a goal check-in's. A goal row may carry a measure or a
   * note instead; here the face is the entire answer, so a row without one
   * records nothing.
   */
  direction: z.enum(goalDirections),
  note: z.string().trim().max(2000),
});

export type RecommendationCheckInInput = Omit<
  z.infer<typeof checkInFields>,
  "note"
> & {
  note?: string;
};

/** One recommendation's answers, newest first — the date orders, not the write. */
export const listRecommendationCheckIns = async (
  recommendationId: Id,
): Promise<readonly PatientRecommendationCheckIn[]> => {
  if (!uuidSchema.safeParse(recommendationId).success) {
    return [];
  }
  const page = await checkIns().findMany({ recommendationId }, { limit: 200 });
  return [...page.items].sort((a, b) => {
    if (a.checkedOn !== b.checkedOn) {
      return a.checkedOn < b.checkedOn ? 1 : -1;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
};

export const addRecommendationCheckIn = async (
  recommendationId: Id,
  input: RecommendationCheckInInput,
): Promise<Result<PatientRecommendationCheckIn>> => {
  if (!uuidSchema.safeParse(recommendationId).success) {
    return err("not_found", "no such recommendation");
  }
  const recommendation = await recommendations().findById(recommendationId);
  if (!recommendation) {
    return err("not_found", "no such recommendation");
  }
  const parsed = checkInFields.partial({ note: true }).safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const created = await checkIns().insert({
    recommendationId,
    checkedOn: parsed.data.checkedOn,
    direction: parsed.data.direction,
    note: parsed.data.note ?? "",
    acknowledgedAt: null,
  });
  await touchPatient(recommendation.patientId);
  return ok(created);
};

/**
 * Whose recommendation is this? The ownership answer
 * `writeThroughPatientLink` needs before a token may write against a row it
 * named by id — the same guard `mealEntryOwner` provides for the journal.
 */
export const recommendationCheckInSubjectOwner = async (
  recommendationId: Id,
): Promise<Id | null> => {
  if (!uuidSchema.safeParse(recommendationId).success) {
    return null;
  }
  const recommendation = await recommendations().findById(recommendationId);
  return recommendation?.patientId ?? null;
};

/**
 * « Vu » — Morgane has looked at this answer.
 *
 * Idempotent on purpose: the stamp is what the count reads, so marking an
 * already-seen row seen again is a no-op rather than a moved timestamp, and
 * two clicks cannot make one answer look freshly handled.
 */
export const acknowledgeRecommendationCheckIn = async (
  id: Id,
): Promise<Result<PatientRecommendationCheckIn>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such check-in");
  }
  const existing = await checkIns().findById(id);
  if (!existing) {
    return err("not_found", "no such check-in");
  }
  if (existing.acknowledgedAt !== null) {
    return ok(existing);
  }
  const updated = await checkIns().update(id, { acknowledgedAt: new Date() });
  return updated ? ok(updated) : err("not_found", "no such check-in");
};
