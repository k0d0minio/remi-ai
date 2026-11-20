import { describe, expect, it } from "vitest";
import {
  celiacToConfirm,
  mentionsCeliacDisease,
  strictGlutenApplies,
} from "./celiac-mention";

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

describe("celiacToConfirm", () => {
  it("is true for a mention with no answer of the practitioner", () => {
    expect(
      celiacToConfirm({ celiacDisease: null, pathologies: "Maladie cœliaque" }),
    ).toBe(true);
    expect(
      celiacToConfirm({ celiacDisease: undefined, pathologies: "coeliaque" }),
    ).toBe(true);
  });

  it("is true for « pas de maladie cœliaque »: the practitioner answers", () => {
    expect(
      celiacToConfirm({
        celiacDisease: null,
        pathologies: "pas de maladie cœliaque",
      }),
    ).toBe(true);
  });

  it("is false after « Oui » and after « Non »", () => {
    for (const celiacDisease of [true, false]) {
      expect(
        celiacToConfirm({ celiacDisease, pathologies: "maladie cœliaque" }),
      ).toBe(false);
    }
  });

  it("is false with no mention", () => {
    for (const pathologies of ["Hypothyroïdie", "", null, undefined]) {
      expect(celiacToConfirm({ celiacDisease: null, pathologies })).toBe(false);
    }
  });
});

describe("strictGlutenApplies", () => {
  it("applies for a confirmed disease, with or without a mention", () => {
    expect(strictGlutenApplies({ celiacDisease: true, pathologies: null })).toBe(
      true,
    );
    expect(
      strictGlutenApplies({ celiacDisease: true, pathologies: "cœliaque" }),
    ).toBe(true);
  });

  it("applies while a mention is not confirmed", () => {
    expect(
      strictGlutenApplies({ celiacDisease: null, pathologies: "cœliaque" }),
    ).toBe(true);
  });

  it("is lifted by the practitioner's « Non », also with a mention", () => {
    expect(
      strictGlutenApplies({ celiacDisease: false, pathologies: "cœliaque" }),
    ).toBe(false);
  });

  it("does not apply with no mention and no confirmation", () => {
    expect(
      strictGlutenApplies({ celiacDisease: null, pathologies: "Diabète" }),
    ).toBe(false);
    expect(strictGlutenApplies({ celiacDisease: false, pathologies: null })).toBe(
      false,
    );
  });
});
