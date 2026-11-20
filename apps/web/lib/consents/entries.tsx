import {
  consentsOf,
  consentText,
  currentConsentText,
  patientActor,
} from "@remi/services/server";
import {
  consentSummaries,
  consentTextLocaleFor,
  formatDate,
  type ConsentSummary,
  type Locale,
} from "@remi/services/shared";
import { Markdown } from "@remi/ui/server";
import type { ReactNode } from "react";

/** One consent text as a sheet shows it. The server renders the body. */
export type ConsentEntryText = {
  version: string;
  /** The language of the text, for the action and for `lang`. */
  textLocale: string;
  lang: string;
  /** The day the text took effect, formatted. */
  date: string;
  body: ReactNode;
};

/**
 * One line of « Mes consentements » (REM-43): the patient's answer, the text
 * that they accepted, and the current text when the settings offer the
 * consent again.
 */
export type ConsentEntry = ConsentSummary & {
  /** The day of the decision, formatted. `null` with no decision. */
  decidedOn: string | null;
  /**
   * The text of the decision. `null` with no decision, and for a `legacy`
   * row: what the practitioner read out was never stored.
   */
  accepted: ConsentEntryText | null;
  /** The text to accept now. `null` when the settings do not offer it. */
  current: ConsentEntryText | null;
};

// Noon UTC: the same calendar day in every time zone of Europe.
const textDate = (day: string) => formatDate(`${day}T12:00:00Z`);

const shown = (text: {
  version: string;
  locale: string;
  date: string;
  body: string;
}): ConsentEntryText => ({
  version: text.version,
  textLocale: text.locale,
  lang: "fr",
  date: textDate(text.date),
  body: <Markdown>{text.body}</Markdown>,
});

/**
 * The patient's consents for the settings, read as the patient (D-26). The
 * bodies render here, on the server: `Markdown` is a server component, and the
 * client controls only place them.
 */
export const consentEntries = async (
  patientId: string,
  locale: Locale,
): Promise<ConsentEntry[]> => {
  const latest = await consentsOf(patientActor(patientId), patientId);
  return consentSummaries(latest).map((summary) => {
    const accepted =
      summary.textVersion && summary.textLocale
        ? consentText(summary.key, summary.textVersion, summary.textLocale)
        : null;
    return {
      ...summary,
      decidedOn: summary.decidedAt ? formatDate(summary.decidedAt) : null,
      accepted: accepted ? shown(accepted) : null,
      current: summary.canGive
        ? shown(currentConsentText(summary.key, consentTextLocaleFor(locale)))
        : null,
    };
  });
};
