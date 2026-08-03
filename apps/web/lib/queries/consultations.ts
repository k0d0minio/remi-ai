import type { Consultation, Id } from "@remi/services/shared";
import { consultations } from "@/lib/fixtures/consultations";

/** The consultation a plan came out of. See the note in `./clients.ts`. */
export const getConsultation = async (
  consultationId: Id,
): Promise<Consultation | null> =>
  consultations.find((consultation) => consultation.id === consultationId) ??
  null;

/**
 * The most recent consultation with a person — what the plan composer works
 * from. The practitioner comes to that screen from a session they have just
 * held, so the question is always "the last one", never "which one".
 */
export const getLatestConsultation = async (
  personId: Id,
): Promise<Consultation | null> =>
  consultations
    .filter((consultation) => consultation.personId === personId)
    .sort((a, b) => b.heldAt.getTime() - a.heldAt.getTime())[0] ?? null;
