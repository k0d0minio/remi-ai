import { describe, expect, it } from "vitest";
import {
  blankPersonalFields,
  blankPersonalFieldsOf,
  isProtocolCopyKind,
  isProtocolTemplateKind,
  protocolKindFields,
  readProtocolRow,
  readProtocolRows,
} from "./protocol-reuse";

/**
 * Written from the spec's acceptance criteria rather than from the
 * implementation — the two criteria this file owns are "a copied row carries
 * the factual fields and arrives with the personal ones blank" and "a template
 * whose stored rows lack a field the row shape has gained inserts rows with
 * that field at its default, with no migration and no error".
 */

describe("the copy rule", () => {
  it("carries a recommendation's category and title, and blanks its detail", () => {
    expect(
      blankPersonalFields("recommendation", {
        category: "nutrition",
        title: "Augmenter les protéines",
        detail: "Tu m'as dit que le petit-déjeuner était difficile.",
      }),
    ).toEqual({
      category: "nutrition",
      title: "Augmenter les protéines",
      detail: "",
    });
  });

  it("carries a supplement's dose and moment — facts about the supplement — and blanks its reason", () => {
    expect(
      blankPersonalFields("supplement", {
        name: "Magnésium bisglycinate",
        dose: "300 mg",
        timing: "le soir, au coucher",
        reason: "Pour tes crampes nocturnes.",
      }),
    ).toEqual({
      name: "Magnésium bisglycinate",
      dose: "300 mg",
      timing: "le soir, au coucher",
      reason: "",
    });
  });

  it("carries a pantry item and blanks its pourquoi", () => {
    expect(
      blankPersonalFields("pantry", {
        item: "Sardines",
        why: "oméga-3, et tu aimes ça",
      }),
    ).toEqual({ item: "Sardines", why: "" });
  });

  it("blanks a whole list at once", () => {
    expect(
      blankPersonalFieldsOf("pantry", [
        { item: "Sardines", why: "oméga-3" },
        { item: "Amandes", why: "magnésium" },
      ]),
    ).toEqual([
      { item: "Sardines", why: "" },
      { item: "Amandes", why: "" },
    ]);
  });
});

describe("reading a stored row back", () => {
  it("defaults a field the stored row never carried, rather than failing", () => {
    // A template saved before `timing` existed on the supplement row shape.
    expect(
      readProtocolRow("supplement", { name: "Oméga-3", dose: "1 g" }),
    ).toEqual({ name: "Oméga-3", dose: "1 g", timing: "", reason: "" });
  });

  it("drops a field the kind's row shape does not have", () => {
    // A template saved when the shape still carried a field since removed.
    expect(
      readProtocolRow("pantry", {
        item: "Sardines",
        why: "oméga-3",
        season: "hiver",
      }),
    ).toEqual({ item: "Sardines", why: "oméga-3" });
  });

  it("treats a non-string value as absent", () => {
    expect(readProtocolRow("pantry", { item: "Sardines", why: 42 })).toEqual({
      item: "Sardines",
      why: "",
    });
  });

  it("reads nothing out of a blob that is not a row", () => {
    expect(readProtocolRow("pantry", null)).toEqual({ item: "", why: "" });
    expect(readProtocolRow("pantry", "sardines")).toEqual({
      item: "",
      why: "",
    });
  });

  it("reads nothing out of a rows blob that is not a list", () => {
    expect(readProtocolRows("pantry", null)).toEqual([]);
    expect(readProtocolRows("pantry", { item: "Sardines" })).toEqual([]);
  });

  it("reads a whole stored list", () => {
    expect(
      readProtocolRows("recommendation", [
        { category: "nutrition", title: "Protéines", detail: "" },
        { title: "Oméga-3" },
      ]),
    ).toEqual([
      { category: "nutrition", title: "Protéines", detail: "" },
      { category: "", title: "Oméga-3", detail: "" },
    ]);
  });
});

describe("the kind vocabulary", () => {
  it("names every field of each row shape", () => {
    expect(protocolKindFields("recommendation")).toEqual([
      "category",
      "title",
      "detail",
    ]);
    expect(protocolKindFields("supplement")).toEqual([
      "name",
      "dose",
      "timing",
      "reason",
    ]);
    expect(protocolKindFields("pantry")).toEqual(["item", "why"]);
  });

  it("offers recipes for copying but never for a template", () => {
    expect(isProtocolCopyKind("recipe")).toBe(true);
    expect(isProtocolTemplateKind("recipe")).toBe(false);
  });

  it("rejects a kind it does not know", () => {
    expect(isProtocolTemplateKind("goal")).toBe(false);
    expect(isProtocolCopyKind("goal")).toBe(false);
  });
});
