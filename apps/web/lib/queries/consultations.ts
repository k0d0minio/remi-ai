import type { Consultation, Id } from "@remi/services/shared";
import { consultations } from "@/lib/fixtures/consultations";

/** The consultation a plan came out of. See the note in `./clients.ts`. */
export const getConsultation = async (
  consultationId: Id,
): Promise<Consultation | null> =>
  consultations.find((consultation) => consultation.id === consultationId) ??
  null;
