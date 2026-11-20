import { describe, expect, it } from "vitest";
import { defaultLocalePath, isLocale, localePath, locales } from "./i18n";

describe("the locale vocabulary", () => {
  it("serves French only", () => {
    expect(locales).toEqual(["fr"]);
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("en")).toBe(false);
  });

  it("builds a path under the locale", () => {
    expect(localePath("fr", "/")).toBe("/fr");
    expect(localePath("fr", "/accueil")).toBe("/fr/accueil");
  });
});

describe("defaultLocalePath", () => {
  it("gives a path with no language the /fr prefix", () => {
    expect(defaultLocalePath("/")).toBe("/fr");
    expect(defaultLocalePath("/accueil")).toBe("/fr/accueil");
    expect(defaultLocalePath("/p/abc123/repas")).toBe("/fr/p/abc123/repas");
  });

  it("sends an address of another language to the same page under /fr", () => {
    expect(defaultLocalePath("/en")).toBe("/fr");
    expect(defaultLocalePath("/en/")).toBe("/fr");
    expect(defaultLocalePath("/en/connexion")).toBe("/fr/connexion");
    expect(defaultLocalePath("/EN/p/abc123")).toBe("/fr/p/abc123");
  });

  it("keeps a first segment that is not a language", () => {
    expect(defaultLocalePath("/connexion/lien")).toBe("/fr/connexion/lien");
  });
});
