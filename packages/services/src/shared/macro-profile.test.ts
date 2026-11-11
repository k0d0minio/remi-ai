import { describe, expect, it } from "vitest";
import {
  defaultMacroSplit,
  genotypeMappingValidated,
  macroProfile,
  type MacroProfileInput,
} from "./macro-profile";
import {
  amy1aCategories,
  apoeGenotypes,
  dio2Categories,
} from "./questionnaire";

const complete: MacroProfileInput = {
  geneticTest: "yes",
  apoe: "E3/E3",
  dio2: "H",
  amy1a: "M",
  geneticConsentGiven: true,
};

const expectDefault = (
  input: MacroProfileInput,
  mappingValidated?: boolean,
) => {
  const profile = macroProfile(input, mappingValidated);
  expect(profile.source).toBe("default");
  expect(profile.carbohydrate).toBe(45);
  expect(profile.fat).toBe(30);
  expect(profile.protein).toBe(25);
  return profile.reason;
};

describe("macroProfile", () => {
  it("defines DEFAULT as 45 / 30 / 25", () => {
    expect(defaultMacroSplit).toEqual({
      carbohydrate: 45,
      fat: 30,
      protein: 25,
    });
  });

  it("keeps the laboratory mapping unvalidated until Morgane's validation", () => {
    expect(genotypeMappingValidated).toBe(false);
  });

  it("returns DEFAULT when the test question is not « Oui »", () => {
    expect(expectDefault({ ...complete, geneticTest: null })).toBe("no-test");
    expect(expectDefault({ ...complete, geneticTest: "no_or_unknown" })).toBe(
      "no-test",
    );
  });

  it("returns DEFAULT without the genetic consent", () => {
    expect(expectDefault({ ...complete, geneticConsentGiven: false })).toBe(
      "no-consent",
    );
  });

  it("returns DEFAULT when any of the three results is empty", () => {
    expect(expectDefault({ ...complete, apoe: null })).toBe("incomplete");
    expect(expectDefault({ ...complete, dio2: null })).toBe("incomplete");
    expect(expectDefault({ ...complete, amy1a: null })).toBe("incomplete");
  });

  it("returns DEFAULT for every complete trio while the mapping is unvalidated", () => {
    for (const apoe of apoeGenotypes) {
      for (const dio2 of dio2Categories) {
        for (const amy1a of amy1aCategories) {
          expect(expectDefault({ ...complete, apoe, dio2, amy1a })).toBe(
            "mapping-unvalidated",
          );
        }
      }
    }
  });

  it("returns DEFAULT for a trio with no table row once the mapping is validated", () => {
    expect(expectDefault(complete, true)).toBe("absent");
  });
});
