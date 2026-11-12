import { createHash } from "node:crypto";
import {
  mandatoryConsentKeys,
  type ConsentKey,
  type ConsentTextLocale,
  type ShownConsent,
} from "../shared/consent";
import care1FrBe from "./texts/care/1.fr-BE.md";
import care2FrBe from "./texts/care/2.fr-BE.md";
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
  // Version 1 with Jamie's answers of 2026-11-12 (triage/care-consent-v2):
  // no draft mark, the paid pilot, the sub-processors the repo holds.
  {
    key: "care",
    version: "2",
    locale: "fr-BE",
    date: "2026-11-12",
    body: care2FrBe,
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

export type SignupConsentCheck =
  | { ok: true; consents: ShownConsent[] }
  | { ok: false; missing: ConsentKey[]; stale: ConsentKey[] };

/**
 * Checks the consents a sign-up posted (story 3), before anything is written.
 *
 * - `missing`: a mandatory key with no entry. The patient did not tick it.
 * - `stale`: an entry that does not name the text a page shows now in that
 *   language, a key named twice, or a key the sign-up does not ask. A new
 *   version shipped since the render, or the form was forged.
 *
 * The sign-up asks only the mandatory keys. The genetic consent comes later,
 * when a génotype is entered (`genetic-consent-and-optional-data`).
 */
export const checkSignupConsents = (
  shown: readonly ShownConsent[],
): SignupConsentCheck => {
  const missing: ConsentKey[] = [];
  const stale: ConsentKey[] = [];
  const accepted: ShownConsent[] = [];
  for (const key of mandatoryConsentKeys) {
    const entries = shown.filter((entry) => entry.key === key);
    const [entry] = entries;
    if (!entry) {
      missing.push(key);
      continue;
    }
    const current = currentConsentText(key, entry.locale);
    if (
      entries.length > 1 ||
      entry.version !== current.version ||
      entry.locale !== current.locale
    ) {
      stale.push(key);
      continue;
    }
    accepted.push(entry);
  }
  for (const entry of shown) {
    const asked = mandatoryConsentKeys.includes(entry.key);
    if (!asked && !stale.includes(entry.key)) {
      stale.push(entry.key);
    }
  }
  if (missing.length > 0 || stale.length > 0) {
    return { ok: false, missing, stale };
  }
  return { ok: true, consents: accepted };
};
