import { describe, expect, it } from "vitest";
import {
  safetyList,
  strictGlutenLabel,
  type SafetyBox,
} from "./safety-highlights";

const box = (
  kind: SafetyBox["kind"],
  key: string,
  subKey: string | null = null,
  otherText: string | null = null,
): SafetyBox => ({ kind, key, subKey, otherText });

describe("the lists of the safety block", () => {
  it("reads no answer as not entered, never as none known", () => {
    expect(safetyList("allergy", null, [])).toEqual({ state: "not_entered" });
    expect(safetyList("allergy", false, [])).toEqual({ state: "not_entered" });
    expect(safetyList("intolerance", null, [])).toEqual({
      state: "not_entered",
    });
  });

  it("reads the patient's declaration as none known", () => {
    expect(safetyList("allergy", true, [])).toEqual({ state: "none_known" });
    expect(safetyList("intolerance", true, [])).toEqual({
      state: "none_known",
    });
  });

  it("reads a family stored as all", () => {
    expect(
      safetyList("allergy", false, [box("allergy", "tree_nuts", "all")]),
    ).toEqual({ state: "listed", items: ["Fruits à coque — tous"] });
  });

  it("groups the sub-choices of one family, in the questionnaire's order", () => {
    expect(
      safetyList("allergy", false, [
        box("allergy", "fish", "tuna"),
        box("allergy", "fish", "salmon"),
      ]),
    ).toEqual({ state: "listed", items: ["Poissons — Saumon, Thon"] });
  });

  it("orders the families as the questionnaire does", () => {
    const result = safetyList("allergy", false, [
      box("allergy", "sesame"),
      box("allergy", "peanuts"),
    ]);
    expect(result).toEqual({ state: "listed", items: ["Arachides", "Sésame"] });
  });

  it("shows the patient's own text for « Autre »", () => {
    expect(
      safetyList("allergy", false, [box("allergy", "other", null, "kiwi")]),
    ).toEqual({ state: "listed", items: ["Autre — kiwi"] });
    expect(
      safetyList("allergy", false, [
        box("allergy", "fish", "other", "espadon"),
      ]),
    ).toEqual({ state: "listed", items: ["Poissons — Autre (espadon)"] });
  });

  it("keeps the two kinds apart", () => {
    const boxes = [
      box("allergy", "peanuts"),
      box("intolerance", "lactose"),
      box("intolerance", "gluten"),
    ];
    expect(safetyList("allergy", false, boxes)).toEqual({
      state: "listed",
      items: ["Arachides"],
    });
    expect(safetyList("intolerance", false, boxes)).toEqual({
      state: "listed",
      items: ["Lactose", "Gluten"],
    });
  });

  it("shows a checked box even if the flag says none known", () => {
    expect(safetyList("allergy", true, [box("allergy", "peanuts")])).toEqual({
      state: "listed",
      items: ["Arachides"],
    });
  });

  it("shows an unknown key as stored, never drops it", () => {
    expect(
      safetyList("allergy", false, [box("allergy", "mystery", "odd")]),
    ).toEqual({ state: "listed", items: ["mystery — odd"] });
  });

  it("answers in English on request", () => {
    expect(
      safetyList("allergy", false, [box("allergy", "tree_nuts", "all")], "en"),
    ).toEqual({ state: "listed", items: ["Tree nuts — all"] });
  });
});

describe("the strict gluten line", () => {
  it("names the strict exclusion and the cross-contamination", () => {
    expect(strictGlutenLabel.fr).toContain("exclusion stricte");
    expect(strictGlutenLabel.fr).toContain("contaminations croisées");
    expect(strictGlutenLabel.en).toContain("cross-contamination");
  });
});
