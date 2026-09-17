import { describe, expect, it } from "vitest";
import { normaliseNutritionText } from "../../../shared/nutrition";
import {
  checkComponents,
  parseCiqualExport,
  parseTeneur,
  readField,
  readRecords,
  splitComponentName,
} from "./ciqual";

/**
 * The parser, against the real export's own shapes.
 *
 * Every string below is copied verbatim out of the Ciqual 2025 XML — the
 * `missing=" "` self-closing tags, the decimal commas, the `&lt;` entity, the
 * confidence codes. That is deliberate: a parser tested against invented input
 * proves only that it agrees with whoever invented it.
 */

const COMPO_RECORD = `
      <alim_code> 1000 </alim_code>
      <const_code> 400 </const_code>
      <teneur> 59,7 </teneur>
      <min>         58,7 </min>
      <max>         60,4 </max>
      <code_confiance> D </code_confiance>
      <source_code> 1373 </source_code>
`;

const ABSENT_RECORD = `
      <alim_code> 1000 </alim_code>
      <const_code> 327 </const_code>
      <teneur> 1140 </teneur>
      <min missing=" " />
      <max missing=" " />
      <code_confiance> D </code_confiance>
`;

describe("reading the export's fields", () => {
  it("trims the padding the publisher writes around every value", () => {
    expect(readField(COMPO_RECORD, "alim_code")).toBe("1000");
    expect(readField(COMPO_RECORD, "teneur")).toBe("59,7");
  });

  it("reads an absent field as empty, not as the tag's attributes", () => {
    // `<min missing=" " />` is self-closing — a naive open/close match returns
    // the rest of the document instead of nothing.
    expect(readField(ABSENT_RECORD, "min")).toBe("");
    expect(readField(ABSENT_RECORD, "max")).toBe("");
    expect(readField(ABSENT_RECORD, "teneur")).toBe("1140");
  });

  it("decodes the entities, without double-decoding &amp;", () => {
    expect(readField("<a>&lt; 0,01</a>", "a")).toBe("< 0,01");
    expect(readField("<a>Energie, N x facteur Jones&apos;</a>", "a")).toBe(
      "Energie, N x facteur Jones'",
    );
    expect(readField("<a>&amp;lt;</a>", "a")).toBe("&lt;");
  });

  it("finds every record in a file, in document order", () => {
    const xml = "<TABLE><ALIM><a>1</a></ALIM><ALIM><a>2</a></ALIM></TABLE>";
    expect(readRecords(xml, "ALIM").map((r) => readField(r, "a"))).toEqual([
      "1",
      "2",
    ]);
  });
});

describe("the four kinds of teneur cell", () => {
  it("reads a measurement, decimal comma and all", () => {
    expect(parseTeneur(" 59,7 ")).toEqual({
      value: 59.7,
      marker: "exact",
      rawValue: "59,7",
    });
    expect(parseTeneur("0")).toEqual({
      value: 0,
      marker: "exact",
      rawValue: "0",
    });
  });

  it("keeps traces as traces rather than as a zero nobody wrote", () => {
    expect(parseTeneur("traces")).toEqual({
      value: 0,
      marker: "traces",
      rawValue: "traces",
    });
  });

  it("keeps an upper bound as an upper bound", () => {
    // `< 20` is the limit of quantification, not a measurement of 20 — which
    // is exactly why ranking excludes it by default.
    expect(parseTeneur("< 20")).toEqual({
      value: 20,
      marker: "less_than",
      rawValue: "< 20",
    });
    expect(parseTeneur("&lt; 0,01")).toEqual({
      value: 0.01,
      marker: "less_than",
      rawValue: "< 0,01",
    });
  });

  it("reads a dash as not determined, with no value at all", () => {
    expect(parseTeneur("-")).toEqual({
      value: null,
      marker: "not_determined",
      rawValue: "-",
    });
    expect(parseTeneur("")).toEqual({
      value: null,
      marker: "not_determined",
      rawValue: "",
    });
  });
});

describe("the component vocabulary", () => {
  it("splits the unit off the end of the component's name", () => {
    expect(splitComponentName("Magnésium (mg/100 g)")).toEqual({
      label: "Magnésium",
      unit: "mg/100 g",
    });
  });

  it("splits on the last group, not the first", () => {
    // The fatty acid's own name carries `(n-3)` in the middle of it.
    expect(
      splitComponentName(
        "AG 18:3 c9,c12,c15 (n-3), alpha-linolénique (g/100 g)",
      ),
    ).toEqual({
      label: "AG 18:3 c9,c12,c15 (n-3), alpha-linolénique",
      unit: "g/100 g",
    });
  });

  it("names the codes an export is missing, so a new edition stops the import", () => {
    const components = [
      { code: "25000", label: "Protéines", unit: "g/100 g" },
      { code: "34100", label: "Fibres alimentaires", unit: "g/100 g" },
    ];
    expect(checkComponents(components, ["25000", "34100"])).toEqual([]);
    expect(checkComponents(components, ["25000", "10120", "42053"])).toEqual([
      "10120",
      "42053",
    ]);
  });
});

describe("parsing a whole (small) export", () => {
  const source = {
    alim: `<TABLE>
      <ALIM>
        <alim_code> 13000 </alim_code>
        <alim_nom_fr> Bœuf, à braiser </alim_nom_fr>
        <alim_nom_eng> Beef </alim_nom_eng>
        <alim_nom_sci missing=" " />
        <alim_grp_code> 06 </alim_grp_code>
        <alim_ssgrp_code> 0603 </alim_ssgrp_code>
      </ALIM>
    </TABLE>`,
    alimGrp: `<TABLE>
      <ALIM_GRP>
        <alim_grp_code> 06 </alim_grp_code>
        <alim_grp_nom_fr> viandes, œufs, poissons </alim_grp_nom_fr>
        <alim_ssgrp_code> 0603 </alim_ssgrp_code>
        <alim_ssgrp_nom_fr> viandes cuites </alim_ssgrp_nom_fr>
      </ALIM_GRP>
    </TABLE>`,
    components: `<TABLE>
      <CONST>
        <const_code> 25000 </const_code>
        <const_nom_fr> Protéines, N x facteur de Jones (g/100 g) </const_nom_fr>
      </CONST>
    </TABLE>`,
    compo: `<TABLE>
      <COMPO>
        <alim_code> 13000 </alim_code>
        <const_code> 25000 </const_code>
        <teneur> 26,8 </teneur>
        <code_confiance> A </code_confiance>
      </COMPO>
    </TABLE>`,
  };

  const parsed = parseCiqualExport(source);

  it("joins a food to its group and sub-group names", () => {
    expect(parsed.foods).toHaveLength(1);
    expect(parsed.foods[0]).toMatchObject({
      code: "13000",
      nameFr: "Bœuf, à braiser",
      groupNameFr: "viandes, œufs, poissons",
      subGroupNameFr: "viandes cuites",
    });
  });

  it("writes a search name that matches what a search term normalises to", () => {
    // The importer and `searchFoods` must agree, or « boeuf » finds nothing.
    expect(parsed.foods[0].searchName).toBe(
      normaliseNutritionText("Bœuf, à braiser"),
    );
    // The ligature is expanded, so an operator typing « boeuf » finds it.
    expect(parsed.foods[0].searchName).toBe("boeuf, a braiser");
  });

  it("joins a value to its component's name and unit", () => {
    expect(parsed.nutrients).toHaveLength(1);
    expect(parsed.nutrients[0]).toEqual({
      foodCode: "13000",
      componentCode: "25000",
      componentNameFr: "Protéines, N x facteur de Jones",
      unit: "g/100 g",
      value: 26.8,
      marker: "exact",
      rawValue: "26,8",
      confidence: "A",
    });
  });
});
