import type { Locale } from "./i18n";
import { consentChannels } from "./patient";

/**
 * The consent vocabulary — story 3, D-32. Isomorphic: the sign-up screen and
 * the console read the same keys and decisions.
 *
 * `care` is the processing of the patient's data for the care, and it is
 * mandatory. `genetic` is the genotype, and it is optional (Morgane, call of
 * 2026-10-23). The policy's two other consents, feedback and cookies, have no
 * key because no feature uses them yet (Jamie, 2026-11-01).
 */
export const consentKeys = ["care", "genetic"] as const;

export type ConsentKey = (typeof consentKeys)[number];

export const mandatoryConsentKeys: readonly ConsentKey[] = ["care"];

/** Append-only: a change of mind is a new row, never an edit of the old one. */
export const consentDecisions = ["given", "refused", "withdrawn"] as const;

export type ConsentDecision = (typeof consentDecisions)[number];

/**
 * The languages a consent text exists in. Version 1 is `fr-BE` only. An `en`
 * file comes from Morgane's counsel (Jamie, 2026-11-01).
 */
export const consentTextLocales = ["fr-BE", "en"] as const;

export type ConsentTextLocale = (typeof consentTextLocales)[number];

/**
 * The version of the rows the migration made from the two hand-filled columns
 * of `patient_profiles`. No text file carries it: what Morgane read out in
 * consultation was never stored.
 */
export const legacyConsentVersion = "legacy";

/**
 * Where the decision was taken. `app` is a screen of REMI. The rest are the
 * channels Morgane recorded by hand before this table, kept on the `legacy`
 * rows so nothing she wrote is lost.
 */
export const consentRecordChannels = ["app", ...consentChannels] as const;

export type ConsentRecordChannel = (typeof consentRecordChannels)[number];

/**
 * One consent text as a screen showed it: the key, the version and the
 * language. The sign-up form posts one per ticked box, and the service checks
 * each against the current text before it writes a row.
 */
export type ShownConsent = {
  key: ConsentKey;
  version: string;
  locale: ConsentTextLocale;
};

/** The text language a page shows for a locale of the app. */
export const consentTextLocaleFor = (locale: Locale): ConsentTextLocale =>
  locale === "fr" ? "fr-BE" : "en";

/** How a form posts one shown consent: `key:version:locale`. */
export const shownConsentValue = (shown: ShownConsent) =>
  `${shown.key}:${shown.version}:${shown.locale}`;

const isConsentKey = (value: string): value is ConsentKey =>
  (consentKeys as readonly string[]).includes(value);

const isConsentTextLocale = (value: string): value is ConsentTextLocale =>
  (consentTextLocales as readonly string[]).includes(value);

/** Reads one posted value back. A malformed value is null: no consent. */
export const parseShownConsent = (value: unknown): ShownConsent | null => {
  if (typeof value !== "string") {
    return null;
  }
  const [key = "", version = "", locale = "", ...rest] = value.split(":");
  if (
    rest.length > 0 ||
    !isConsentKey(key) ||
    !version ||
    !isConsentTextLocale(locale)
  ) {
    return null;
  }
  return { key, version, locale };
};
