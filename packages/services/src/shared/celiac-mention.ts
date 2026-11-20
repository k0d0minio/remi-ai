/**
 * The patient no longer ticks « Maladie cœliaque » (REM-165): they write their
 * pathologies as free text, and the practitioner confirms the disease in the
 * console. `celiac_disease` stays the one structured fact that starts the
 * strict gluten exclusion.
 *
 * This reads the free text for a mention only. A mention starts no
 * restriction and removes none: it tells the practitioner that a confirmation
 * is due. A text that says « pas de maladie cœliaque » also mentions it, and
 * the practitioner reads it and answers « Non ».
 *
 * Isomorphic and pure: no I/O.
 */

/** « cœliaque », « coeliaque », « céliaque », « celiac », « coeliac », « cœliakie ». */
const CELIAC = /c(?:oe|e)lia(?:qu|c|k)/;

/** True when the text names coeliac disease, in any case and with any accent. */
export const mentionsCeliacDisease = (text: string | null | undefined) => {
  if (!text) {
    return false;
  }
  const plain = text
    .toLowerCase()
    .replaceAll("œ", "oe")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  return CELIAC.test(plain);
};
