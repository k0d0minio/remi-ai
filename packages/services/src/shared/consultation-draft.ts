/**
 * The draft of the "Nouvelle consultation" screen, kept in the browser's
 * `localStorage` while the practitioner types (apps/admin).
 *
 * The key lives here so that the form that writes the draft and the sign-out
 * that clears it can never disagree on its shape.
 */

const CONSULTATION_DRAFT_PREFIX = "remi:consultation:";

/** The storage key of one patient's consultation draft. */
export const consultationDraftKey = (patientId: string) =>
  `${CONSULTATION_DRAFT_PREFIX}${patientId}`;

/** The part of the Web Storage API that the sign-out uses. */
type DraftStore = Pick<Storage, "key" | "length" | "removeItem">;

/**
 * Removes every consultation draft from the store (REM-117).
 *
 * A sign-out ends the session, but a draft stays in the browser profile until
 * its TTL expires. On a shared workstation the next person could read it, so
 * the sign-out clears them all. A missing, blocked or failing store never
 * throws: the sign-out always goes on.
 */
export const clearConsultationDrafts = (
  getStore: () => DraftStore | undefined = () => globalThis.localStorage,
) => {
  try {
    // The read is inside the `try`: a blocked store throws on access.
    const store = getStore();
    if (!store) {
      return;
    }
    const keys: string[] = [];
    for (let index = 0; index < store.length; index += 1) {
      const key = store.key(index);
      if (key?.startsWith(CONSULTATION_DRAFT_PREFIX)) {
        keys.push(key);
      }
    }
    for (const key of keys) {
      store.removeItem(key);
    }
  } catch {
    // A blocked store costs the clean-up, never the sign-out.
  }
};
