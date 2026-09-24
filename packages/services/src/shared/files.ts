/**
 * The rules a stored file answers to — the half of the files seam that is pure
 * data, so the console's picker can say what it accepts before a byte leaves
 * the browser. The seam (`../files`) enforces the same constants on every
 * upload grant and again on the stored object; the picker only repeats them as
 * a courtesy. Decided with the operator at Define (D-25): PDF and the three
 * image types a browser renders inline, 10 MB each. HEIC is left out on
 * purpose — a patient's browser would download it rather than show it.
 */

export const documentFileTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type DocumentFileType = (typeof documentFileTypes)[number];

export const MAX_DOCUMENT_FILE_BYTES = 10 * 1024 * 1024;

export const isDocumentFileType = (value: string): value is DocumentFileType =>
  (documentFileTypes as readonly string[]).includes(value);

/**
 * Where a patient's files live in the store. One prefix per patient is what
 * lets deleting the patient remove every file in one sweep, and what the
 * upload grant checks a requested key against — a key outside it is refused.
 */
export const patientFilesPrefix = (patientId: string) =>
  `patients/${patientId}/`;

/**
 * The key the browser asks to write: the patient's prefix plus the file's
 * name reduced to a safe, readable slug. The store appends a random suffix,
 * so two uploads of « recette.pdf » never collide.
 */
export const patientFileKey = (patientId: string, fileName: string) => {
  const dot = fileName.lastIndexOf(".");
  const stem = dot > 0 ? fileName.slice(0, dot) : fileName;
  const extension = dot > 0 ? fileName.slice(dot + 1) : "";
  const slug = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  const safeStem = slug(stem) || "document";
  const safeExtension = slug(extension).slice(0, 8);
  return `${patientFilesPrefix(patientId)}${safeStem}${safeExtension ? `.${safeExtension}` : ""}`;
};
