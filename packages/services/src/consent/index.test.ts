import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  consentKeys,
  parseShownConsent,
  shownConsentValue,
} from "../shared/consent";
import {
  checkSignupConsents,
  consentText,
  consentTexts,
  currentConsentText,
  currentSalesTerms,
  salesTermsTexts,
} from "./index";

/**
 * The hash of every published text file. A failure here means a published
 * file changed. Revert the edit and add the new wording as a new version: the
 * rows that accepted the old text must still resolve to it.
 */
const publishedHashes: Record<string, string> = {
  "care/1/fr-BE":
    "2e8d016d940197d462fdf9c87138a8741b952ab6316d7ee1b5c71f492afc2d1b",
  "care/2/fr-BE":
    "4ce7a5efa35ca4248a83a762d30fccc20d93255a1d2c7d5d473ae3d7cb10826b",
  "care/3/fr-BE":
    "72e07a6e66692deafeff9d969e203f4d00d8cf3a6aa351926a3d9ccc0255e12d",
  "genetic/1/fr-BE":
    "f4fc3aa65bfc4081c77801a4ffc400c4bb29de30addc979707e7c8d252a4920b",
  "genetic/2/fr-BE":
    "c22213ee66e298c34fc91ba77cbede7078746eb7183fc96bd9061e747bae0d5a",
};

const idOf = (text: { key: string; version: string; locale: string }) =>
  `${text.key}/${text.version}/${text.locale}`;

describe("consent texts", () => {
  it("pins the hash of every published file", () => {
    expect(
      Object.fromEntries(consentTexts.map((text) => [idOf(text), text.hash])),
    ).toEqual(publishedHashes);
  });

  it("hashes the body bytes with SHA-256", () => {
    for (const text of consentTexts) {
      const expected = createHash("sha256")
        .update(text.body, "utf8")
        .digest("hex");
      expect(text.hash).toBe(expected);
    }
  });

  it("names each key, version and locale once", () => {
    const ids = consentTexts.map(idOf);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("carries a fr-BE text for every key", () => {
    for (const key of consentKeys) {
      expect(currentConsentText(key, "fr-BE").locale).toBe("fr-BE");
    }
  });

  it("resolves an exact version, and null for one no file carries", () => {
    expect(consentText("care", "1", "fr-BE")?.body).toContain(
      "Politique de confidentialité",
    );
    expect(consentText("care", "legacy", "fr-BE")).toBeNull();
    expect(consentText("care", "1", "en")).toBeNull();
  });

  it("shows care version 3, with no draft mark and no free pilot", () => {
    const care = currentConsentText("care", "fr-BE");
    expect(care.version).toBe("3");
    expect(care.body).not.toMatch(/À CONFIRMER|À VALIDER|À COMPLÉTER|gratuit/);
  });

  it("falls back to fr-BE when the language has no text yet", () => {
    const text = currentConsentText("genetic", "en");
    expect(text.locale).toBe("fr-BE");
    expect(text.version).toBe("2");
  });
});

describe("the sales terms (REM-9)", () => {
  it("pins the hash of every published file", () => {
    expect(
      Object.fromEntries(
        salesTermsTexts.map((text) => [
          `cgv/${text.version}/${text.locale}`,
          text.hash,
        ]),
      ),
    ).toEqual({
      "cgv/1/fr-BE":
        "5e17d3c76f0c744b91e46fca55269e08a7f4567a92297e06232284f75741db42",
    });
  });

  it("shows version 1, the public site's CGV with its draft banner", () => {
    const terms = currentSalesTerms("fr-BE");
    expect(terms.version).toBe("1");
    expect(terms.body).toContain("# Conditions Générales de Vente");
    expect(terms.body).toContain("à faire valider par un juriste");
  });

  it("falls back to fr-BE when the language has no text yet", () => {
    expect(currentSalesTerms("en").locale).toBe("fr-BE");
  });
});

describe("the sign-up consent check", () => {
  const care = currentConsentText("care", "fr-BE");
  const shown = {
    key: "care",
    version: care.version,
    locale: care.locale,
  } as const;

  it("accepts the current care text", () => {
    expect(checkSignupConsents([shown])).toEqual({
      ok: true,
      consents: [shown],
    });
  });

  it("names a mandatory key with no tick as missing", () => {
    expect(checkSignupConsents([])).toEqual({
      ok: false,
      missing: ["care"],
      stale: [],
    });
  });

  it("names an old version, a text in another language and a duplicate as stale", () => {
    for (const consents of [
      [{ ...shown, version: "0" }],
      [{ ...shown, locale: "en" as const }],
      [shown, shown],
    ]) {
      expect(checkSignupConsents(consents)).toEqual({
        ok: false,
        missing: [],
        stale: ["care"],
      });
    }
  });

  it("refuses a key the sign-up does not ask", () => {
    const genetic = currentConsentText("genetic", "fr-BE");
    expect(
      checkSignupConsents([
        shown,
        { key: "genetic", version: genetic.version, locale: genetic.locale },
      ]),
    ).toEqual({ ok: false, missing: [], stale: ["genetic"] });
  });
});

describe("a posted consent", () => {
  it("reads back the value a form posts", () => {
    const shown = { key: "care", version: "1", locale: "fr-BE" } as const;
    expect(parseShownConsent(shownConsentValue(shown))).toEqual(shown);
  });

  it("reads a malformed value as no consent", () => {
    const malformed = [
      null,
      "",
      "care",
      "care:1",
      "care::fr-BE",
      "x:1:fr-BE",
      "care:1:de",
      "care:1:fr-BE:x",
    ];
    for (const value of malformed) {
      expect(parseShownConsent(value)).toBeNull();
    }
  });
});
