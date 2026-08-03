import type { Id, TherapeuticFrame } from "@remi/services/shared";
import { frame } from "@/lib/fixtures/practitioner";

/**
 * The frame REMI generates inside. See the note in `./clients.ts`.
 *
 * Keyed by practitioner rather than by frame id: a practice has exactly one
 * frame in force, and asking for "the frame of practitioner X" is the only
 * question any surface has ever needed to ask.
 */
export const getFrame = async (
  practitionerId: Id,
): Promise<TherapeuticFrame | null> =>
  frame.practitionerId === practitionerId ? frame : null;
