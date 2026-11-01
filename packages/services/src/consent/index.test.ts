import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { consentKeys } from "../shared/consent";
import { consentText, consentTexts, currentConsentText } from "./index";

/**
 * The hash of every published text file. A failure here means a published
 * file changed. Revert the edit and add the new wording as a new version: the
 * rows that accepted the old text must still resolve to it.
 */
const publishedHashes: Record<string, string> = {
  "care/1/fr-BE":
    "2e8d016d940197d462fdf9c87138a8741b952ab6316d7ee1b5c71f492afc2d1b",
  "genetic/1/fr-BE":
    "f4fc3aa65bfc4081c77801a4ffc400c4bb29de30addc979707e7c8d252a4920b",
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

  it("falls back to fr-BE when the language has no text yet", () => {
    const text = currentConsentText("genetic", "en");
    expect(text.locale).toBe("fr-BE");
    expect(text.version).toBe("1");
  });
});
