import { createHash } from "node:crypto";
import type { ConsentKey, ConsentTextLocale } from "../shared/consent";
import care1FrBe from "./texts/care/1.fr-BE.md";
import genetic1FrBe from "./texts/genetic/1.fr-BE.md";

/**
 * The consent texts a patient reads — story 3, D-32. One markdown file per
 * key, version and language, under `texts/<key>/<version>.<locale>.md`
 * (Jamie, 2026-10-23: markdown in the repo, the hash on the row).
 *
 * A published file never changes. A new wording is a new version file and a
 * new line below. `index.test.ts` pins the hash of every file, so an edit of a
 * published file turns CI red: the rows that accepted it would no longer
 * resolve to the text they accepted.
 *
 * The bodies are inlined at build, so no route reads a file at run time.
 */

export type ConsentText = {
  key: ConsentKey;
  version: string;
  locale: ConsentTextLocale;
  /** The day the text took effect, as the document states it. */
  date: string;
  body: string;
  /** SHA-256 of the body's UTF-8 bytes, in hex. The row stores it. */
  hash: string;
};

const sha256 = (body: string) =>
  createHash("sha256").update(body, "utf8").digest("hex");

/** Oldest first per key. The last line of a key is its current version. */
const files: readonly Omit<ConsentText, "hash">[] = [
  // The pilot privacy policy, from Drive
  // (`01_Politique_de_confidentialite_REMI_AI_Pilote.docx`), stored with its
  // « À COMPLÉTER » marks (Jamie, 2026-11-01). The fills are version 2.
  {
    key: "care",
    version: "1",
    locale: "fr-BE",
    date: "2026-11-01",
    body: care1FrBe,
  },
  // A draft from sections 2 and 4 of the policy. Morgane validates it before
  // `genetic-consent-and-optional-data` ships. Her edit is version 2.
  {
    key: "genetic",
    version: "1",
    locale: "fr-BE",
    date: "2026-11-01",
    body: genetic1FrBe,
  },
];

export const consentTexts: readonly ConsentText[] = files.map((file) => ({
  ...file,
  hash: sha256(file.body),
}));

/** The exact text of one version, or null when no file carries it. */
export const consentText = (
  key: ConsentKey,
  version: string,
  locale: ConsentTextLocale,
): ConsentText | null => {
  const found = consentTexts.find(
    (text) =>
      text.key === key && text.version === version && text.locale === locale,
  );
  return found ?? null;
};

/**
 * The text a patient reads now: the newest version in their language, else the
 * newest `fr-BE` version. The caller records the locale of the text it shows,
 * which this returns, never the locale it asked for.
 */
export const currentConsentText = (
  key: ConsentKey,
  locale: ConsentTextLocale,
): ConsentText => {
  const newestFirst = consentTexts
    .filter((text) => text.key === key)
    .reverse();
  const current =
    newestFirst.find((text) => text.locale === locale) ??
    newestFirst.find((text) => text.locale === "fr-BE");
  if (!current) {
    throw new Error(`no consent text for the key "${key}"`);
  }
  return current;
};
