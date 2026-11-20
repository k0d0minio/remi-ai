import { describe, expect, it } from "vitest";
import {
  allergenOptionOfRow,
  allergenOptions,
  allergenRowLabel,
  uncategorisedAllergenRows,
} from "./allergen-options";
import {
  allergens,
  allergenSubLists,
  intoleranceDescriptions,
  intolerances,
} from "./questionnaire";

const row = (key: string, subKey: string | null = null) => ({
  key,
  subKey,
  otherText: null,
});

describe("the boxes of the allergy list", () => {
  const options = allergenOptions("allergy");
  const ids = options.map((option) => option.id);

  it("shows each cereal as a box of its own, and no gluten box", () => {
    expect(ids).not.toContain("gluten");
    expect(ids.slice(0, 5)).toEqual([
      "gluten/wheat",
      "gluten/rye",
      "gluten/barley",
      "gluten/oats",
      "gluten/spelt",
    ]);
    const wheat = options[0];
    expect(wheat).toMatchObject({ key: "gluten", subKey: "wheat" });
    expect(wheat?.label.fr).toBe("Blé");
    expect(wheat?.subList).toEqual([]);
  });

  it("keeps every other allergen of the story, in its order", () => {
    expect(ids.filter((id) => !id.startsWith("gluten/"))).toEqual(
      allergens.filter((key) => key !== "gluten"),
    );
    expect(ids.at(-1)).toBe("other");
  });

  it("gives the four families their sub-list, without « Tous »", () => {
    for (const key of ["tree_nuts", "fish", "crustaceans", "molluscs"] as const) {
      const option = options.find((candidate) => candidate.id === key);
      expect(option?.subList.map((sub) => sub.key)).toEqual(
        allergenSubLists[key],
      );
      expect(option?.subList.at(-1)?.label.fr).toBe("Autre");
    }
    expect(options.find((option) => option.id === "eggs")?.subList).toEqual([]);
  });

  it("has unique ids", () => {
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("the boxes of the intolerance list", () => {
  const options = allergenOptions("intolerance");

  it("keeps the story's categories in their order, with no sub-list", () => {
    expect(options.map((option) => option.id)).toEqual([...intolerances]);
    expect(options.every((option) => option.subList.length === 0)).toBe(true);
    expect(options.find((option) => option.id === "gluten")?.label.fr).toBe(
      "Gluten",
    );
  });

  it("explains polyols, FODMAP and histamine, and nothing else", () => {
    const explained = options
      .filter((option) => option.description !== null)
      .map((option) => option.id);
    expect(explained).toEqual(["polyols", "histamine", "fodmap"]);
    expect(
      options.find((option) => option.id === "polyols")?.description,
    ).toEqual(intoleranceDescriptions.polyols);
  });
});

describe("the box of a stored row", () => {
  it("finds the cereal box of a cereal row", () => {
    expect(allergenOptionOfRow("allergy", row("gluten", "wheat"))?.id).toBe(
      "gluten/wheat",
    );
  });

  it("finds the family box of a bare row, of « Tous » and of a sub-key", () => {
    expect(allergenOptionOfRow("allergy", row("fish"))?.id).toBe("fish");
    expect(allergenOptionOfRow("allergy", row("fish", "all"))?.id).toBe("fish");
    expect(allergenOptionOfRow("allergy", row("fish", "cod"))?.id).toBe("fish");
    expect(allergenOptionOfRow("allergy", row("eggs"))?.id).toBe("eggs");
    expect(allergenOptionOfRow("intolerance", row("gluten"))?.id).toBe(
      "gluten",
    );
  });

  it("finds no box for the whole gluten family or for an unknown row", () => {
    expect(allergenOptionOfRow("allergy", row("gluten"))).toBeNull();
    expect(allergenOptionOfRow("allergy", row("gluten", "all"))).toBeNull();
    expect(allergenOptionOfRow("allergy", row("fish", "shark"))).toBeNull();
    expect(allergenOptionOfRow("allergy", row("eggs", "all"))).toBeNull();
    expect(allergenOptionOfRow("allergy", row("mystery"))).toBeNull();
    expect(allergenOptionOfRow("intolerance", row("lactose", "all"))).toBeNull();
  });
});

describe("the stored rows that no box holds", () => {
  it("keeps them all, in their order, and leaves the others out", () => {
    const rows = [
      row("gluten", "all"),
      row("gluten", "wheat"),
      row("peanuts"),
      row("mystery"),
    ];
    expect(uncategorisedAllergenRows("allergy", rows)).toEqual([
      row("gluten", "all"),
      row("mystery"),
    ]);
  });

  it("is empty when each row has a box", () => {
    expect(
      uncategorisedAllergenRows("allergy", [row("fish", "cod"), row("soy")]),
    ).toEqual([]);
  });
});

describe("the label of a stored row", () => {
  it("names the family and the sub-choice", () => {
    expect(allergenRowLabel("allergy", row("gluten", "all"))).toBe(
      "Céréales contenant du gluten — tous",
    );
    expect(allergenRowLabel("allergy", row("gluten"))).toBe(
      "Céréales contenant du gluten",
    );
    expect(allergenRowLabel("allergy", row("fish", "cod"))).toBe(
      "Poissons — Cabillaud",
    );
  });

  it("keeps the text of « Autre », and shows an unknown key as stored", () => {
    expect(
      allergenRowLabel("allergy", {
        key: "other",
        subKey: null,
        otherText: "kiwi",
      }),
    ).toBe("Autre — kiwi");
    expect(allergenRowLabel("allergy", row("mystery"))).toBe("mystery");
  });
});
