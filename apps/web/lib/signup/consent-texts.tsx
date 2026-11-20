import { currentConsentText } from "@remi/services/server";
import {
  consentTextLocaleFor,
  formatDate,
  mandatoryConsentKeys,
  type Locale,
} from "@remi/services/shared";
import { Markdown } from "@remi/ui/server";
import type { ConsentStepText } from "@/components/signup/consent-step";

/**
 * The mandatory consent texts in French, the one language of the texts. The body renders here, on the server: `Markdown`
 * is a server component, and the client step only places it. The sign-up page
 * and the takeover page show the same step (story 3).
 */
export const consentTexts = (locale: Locale): ConsentStepText[] =>
  mandatoryConsentKeys.map((key) => {
    const text = currentConsentText(key, consentTextLocaleFor(locale));
    return {
      key,
      version: text.version,
      locale: text.locale,
      // Noon UTC: the same calendar day in every time zone of Europe.
      date: formatDate(`${text.date}T12:00:00Z`),
      lang: "fr",
      body: <Markdown>{text.body}</Markdown>,
    };
  });
