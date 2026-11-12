import { currentConsentText } from "@remi/services/server";
import {
  consentTextLocaleFor,
  formatDate,
  type Locale,
} from "@remi/services/shared";
import { Markdown } from "@remi/ui/server";
import type { ConsentStepText } from "@/components/signup/consent-step";

/**
 * The genetic consent text in the page's language, or in French when that
 * language has no text yet (story 4, `genotype-section`). The body renders
 * here, on the server: `Markdown` is a server component, and the
 * questionnaire's client section only places it. The sign-up's
 * `consentTexts()` does the same for the mandatory texts.
 */
export const geneticConsentText = (locale: Locale): ConsentStepText => {
  const text = currentConsentText("genetic", consentTextLocaleFor(locale));
  return {
    key: "genetic",
    version: text.version,
    locale: text.locale,
    // Noon UTC: the same calendar day in every time zone of Europe.
    date: formatDate(
      `${text.date}T12:00:00Z`,
      locale === "fr" ? "fr-BE" : "en-GB",
    ),
    lang: text.locale === "fr-BE" ? "fr" : "en",
    body: <Markdown>{text.body}</Markdown>,
  };
};
