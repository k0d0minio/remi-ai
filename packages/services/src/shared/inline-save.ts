/**
 * Two rules for a field that the console saves in place (REM-112).
 *
 * The page receives the stored value as a server prop. After a save, the
 * action returns before the revalidated prop arrives. For that short time,
 * the prop still holds the text from before the save.
 */

/** A save that the action confirmed: the stored text, and the prop at the save. */
export type ConfirmedSave = {
  /** The text that the action stored. Null when the field is now empty. */
  stored: string | null;
  /** The server prop when the save started. */
  before: string | null;
};

/**
 * The text to show after a save. While the server prop is still the value
 * from before the save, show the stored text. When the prop changes, the
 * server is current again, so show the prop.
 */
export const shownAfterSave = (
  server: string | null,
  save: ConfirmedSave | null,
): string | null =>
  save !== null && server === save.before ? save.stored : server;

/** A latch that lets one save start and refuses the next until the first ends. */
export type SingleFlight = {
  /** True when no save runs: the caller may send. False when one runs. */
  start: () => boolean;
  /** The save is done. The next `start()` is accepted. */
  end: () => void;
};

/**
 * One send for each save. A click on « Enregistrer » first moves the focus
 * out of the field. The blur sends, then the click sends. React has not yet
 * rendered `pending`, so a check of `pending` does not stop the second send.
 * This latch changes synchronously, so the second `start()` returns false.
 */
export const singleFlight = (): SingleFlight => {
  let running = false;
  return {
    start: () => {
      if (running) {
        return false;
      }
      running = true;
      return true;
    },
    end: () => {
      running = false;
    },
  };
};
