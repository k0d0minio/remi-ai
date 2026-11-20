import { describe, expect, it } from "vitest";
import { mentionsCeliacDisease } from "./celiac-mention";

describe("a mention of coeliac disease in a free text", () => {
  it("reads each spelling, in any case", () => {
    for (const text of [
      "Hypothyroïdie, maladie cœliaque",
      "maladie coeliaque diagnostiquée en 2019",
      "Maladie Céliaque",
      "MALADIE CŒLIAQUE",
      "celiac disease",
      "coeliac",
      "cœliakie",
    ]) {
      expect(mentionsCeliacDisease(text), text).toBe(true);
    }
  });

  it("reads a negation as a mention: the practitioner decides", () => {
    expect(mentionsCeliacDisease("pas de maladie cœliaque")).toBe(true);
  });

  it("reads nothing in a text without it, or in no text", () => {
    expect(mentionsCeliacDisease("Hypothyroïdie, diabète de type 2")).toBe(
      false,
    );
    expect(mentionsCeliacDisease("intolérance au gluten")).toBe(false);
    expect(mentionsCeliacDisease("")).toBe(false);
    expect(mentionsCeliacDisease(null)).toBe(false);
    expect(mentionsCeliacDisease(undefined)).toBe(false);
  });
});
