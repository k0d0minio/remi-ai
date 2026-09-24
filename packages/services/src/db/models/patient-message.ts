import type { Entity, Id } from "../../types";
import type { WrittenBy } from "./meal-entry";

/**
 * One message in the general thread between a patient and Morgane — her
 * 14 Sept document, § 6. The patient writes « comment se passe votre
 * accompagnement cette semaine » through their link; she answers from the
 * console. One thread per patient, append-only on both sides.
 */
export type PatientMessage = Entity & {
  patientId: Id;
  /** The patient through their link, or her reply from the console. */
  author: WrittenBy;
  body: string;
  sentAt: Date;
  /**
   * Set when she has dealt with a patient message — by replying after it or
   * by « Marquer comme lu ». Always null on her own replies.
   */
  readAt: Date | null;
  /** The operator who replied; null on the patient's messages. */
  operatorId: Id | null;
};
