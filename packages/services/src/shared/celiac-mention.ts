/**
 * The patient no longer ticks « Maladie cœliaque » (REM-165): they write their
 * pathologies as free text, and the practitioner confirms the disease in the
 * console. `celiac_disease` stays the one structured fact that starts the
 * strict gluten exclusion.
 *
 * This reads the free text for a mention only. A text that says « pas de
 * maladie cœliaque » also mentions it, and the practitioner reads it and
 * answers « Non ».
 *
 * A mention with no answer of the practitioner is an unknown, and an unknown
 * is never shown as safe (D-30). While it lasts, `strictGlutenApplies` is
 * true: the compatibility gate excludes gluten as for a confirmed disease.
 * `celiacToConfirm` is true: the activation of the care and the validation of
 * the recommendations are refused. The practitioner's « Oui » keeps the
 * exclusion. The practitioner's « Non » lifts it. The text alone never lifts
 * an exclusion.
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

/** The two answers that the confirmation reads. */
export type CeliacAnswers = {
  /** The practitioner's answer: « Oui », « Non », or none. */
  celiacDisease?: boolean | null | undefined;
  /** The patient's free text. */
  pathologies?: string | null | undefined;
};

/**
 * True while the patient names the disease and the practitioner has answered
 * neither « Oui » nor « Non ».
 */
export const celiacToConfirm = ({
  celiacDisease,
  pathologies,
}: CeliacAnswers) =>
  (celiacDisease ?? null) === null && mentionsCeliacDisease(pathologies);

/**
 * True when the strict gluten exclusion applies: the disease is confirmed, or
 * a mention waits for the practitioner's answer.
 */
export const strictGlutenApplies = (answers: CeliacAnswers) =>
  answers.celiacDisease === true || celiacToConfirm(answers);
