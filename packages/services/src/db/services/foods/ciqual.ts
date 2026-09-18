import { normaliseNutritionText } from "../../../shared/nutrition";
import type {
  ConfidenceCode,
  Food,
  FoodNutrient,
  NutrientMarker,
} from "../../models/food";

/**
 * Reading ANSES's Ciqual 2025 export.
 *
 * Pure functions over the XML *text* — no filesystem, no database, no network —
 * so the whole normalisation is exercised by the unit tests rather than only by
 * a 75 MB import nobody re-runs. `scripts/ciqual-import.mjs` is the thin shell
 * that reads the files and writes the rows; everything that can be got wrong
 * lives here.
 *
 * The export is five flat XML files of `<RECORD><field> value </field>…`. A
 * streaming parser would be the right tool for a deeply nested document; this
 * one is a record scan, which is what the shape actually is, and it keeps the
 * package at its current dependency count.
 */

/** The four things a `teneur` cell can be, already separated from its string. */
export type ParsedValue = {
  value: number | null;
  marker: NutrientMarker;
  rawValue: string;
};

const ENTITIES: Record<string, string> = {
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&amp;": "&",
};

/**
 * `&amp;` last: decoding it first would turn `&amp;lt;` into `<` instead of
 * the literal `&lt;` the publisher wrote.
 */
const decodeEntities = (value: string): string =>
  value
    .replace(/&(lt|gt|quot|apos);/g, (match) => ENTITIES[match])
    .replace(/&amp;/g, "&");

const fieldPattern = (name: string) =>
  new RegExp(`<${name}(?:\\s[^>]*?/>|[^>]*>([\\s\\S]*?)</${name}>)`);

/**
 * One field out of a record, or "" when the publisher marked it absent.
 *
 * Absence is `<min missing=" " />` — a self-closing tag with an attribute —
 * which is why this cannot be a plain open/close match.
 */
export const readField = (record: string, name: string): string => {
  const match = fieldPattern(name).exec(record);
  if (!match || match[1] === undefined) {
    return "";
  }
  return decodeEntities(match[1]).trim();
};

/** Every `<NAME>…</NAME>` block in a file, in document order. */
export const readRecords = (xml: string, name: string): readonly string[] => {
  const pattern = new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "g");
  const records: string[] = [];
  let match = pattern.exec(xml);
  while (match !== null) {
    records.push(match[1]);
    match = pattern.exec(xml);
  }
  return records;
};

/** CIQUAL writes `20,9`, not `20.9`. */
const toNumber = (raw: string): number | null => {
  const parsed = Number.parseFloat(raw.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Turn one `teneur` cell into a value and the reason it reads that way.
 *
 * Counted across the real Ciqual 2025 file: 83 246 cells are `-`, 2 514 are
 * `traces`, and some seventeen thousand are `< x`. Coercing any of them to a
 * bare number is how a ranking ends up recommending a food nobody measured.
 * `< 20 µg` in particular is an *upper bound* — treating it as 20 would put it
 * above a food measured at 5.
 */
export const parseTeneur = (raw: string): ParsedValue => {
  const trimmed = decodeEntities(raw).trim();

  if (trimmed === "" || trimmed === "-") {
    return { value: null, marker: "not_determined", rawValue: trimmed };
  }
  if (trimmed.toLowerCase() === "traces") {
    return { value: 0, marker: "traces", rawValue: trimmed };
  }
  if (trimmed.startsWith("<")) {
    return {
      value: toNumber(trimmed.slice(1).trim()),
      marker: "less_than",
      rawValue: trimmed,
    };
  }

  const value = toNumber(trimmed);
  return value === null
    ? { value: null, marker: "not_determined", rawValue: trimmed }
    : { value, marker: "exact", rawValue: trimmed };
};

const CONFIDENCE: readonly string[] = ["A", "B", "C", "D"];

const parseConfidence = (raw: string): ConfidenceCode | "" => {
  const code = raw.trim().toUpperCase();
  return CONFIDENCE.includes(code) ? (code as ConfidenceCode) : "";
};

/**
 * CIQUAL puts the unit in the component's name — `Magnésium (mg/100 g)` — so
 * the last parenthesised group at the end of the string is the unit and the
 * rest is the label. Splitting on the *last* group matters: the alpha-linolenic
 * acid's own name carries `(n-3)` in the middle of it.
 */
export const splitComponentName = (
  nameFr: string,
): { label: string; unit: string } => {
  const match = /^(.*)\s*\(([^()]*)\)\s*$/.exec(nameFr.trim());
  if (!match) {
    return { label: nameFr.trim(), unit: "" };
  }
  return { label: match[1].trim(), unit: match[2].trim() };
};

export type CiqualComponent = {
  code: string;
  label: string;
  unit: string;
};

/** A food as the export describes it, before the seam gives it an id. */
export type ParsedFood = Omit<Food, "id" | "createdAt" | "updatedAt">;

/** A composition row, before the seam gives it an id. */
export type ParsedNutrient = Omit<
  FoodNutrient,
  "id" | "createdAt" | "updatedAt"
>;

export type CiqualExport = {
  components: readonly CiqualComponent[];
  foods: readonly ParsedFood[];
  nutrients: readonly ParsedNutrient[];
};

export type CiqualSourceText = {
  /** `alim_*.xml` — the foods. */
  alim: string;
  /** `alim_grp_*.xml` — the group and sub-group names. */
  alimGrp: string;
  /** `const_*.xml` — the component vocabulary. */
  components: string;
  /** `compo_*.xml` — every food × component cell. */
  compo: string;
};

export const parseComponents = (xml: string): readonly CiqualComponent[] =>
  readRecords(xml, "CONST").map((record) => {
    const { label, unit } = splitComponentName(
      readField(record, "const_nom_fr"),
    );
    return { code: readField(record, "const_code"), label, unit };
  });

/**
 * The group and sub-group names, keyed by code.
 *
 * The file has one row per (group, sub-group, sub-sub-group) triple, so both
 * names repeat; the map keeps the first of each, which is the only one.
 */
const parseGroupNames = (xml: string) => {
  const groups = new Map<string, string>();
  const subGroups = new Map<string, string>();

  for (const record of readRecords(xml, "ALIM_GRP")) {
    const groupCode = readField(record, "alim_grp_code");
    const subGroupCode = readField(record, "alim_ssgrp_code");
    if (groupCode !== "" && !groups.has(groupCode)) {
      groups.set(groupCode, readField(record, "alim_grp_nom_fr"));
    }
    if (subGroupCode !== "" && !subGroups.has(subGroupCode)) {
      subGroups.set(subGroupCode, readField(record, "alim_ssgrp_nom_fr"));
    }
  }

  return { groups, subGroups };
};

export const parseFoods = (
  alimXml: string,
  alimGrpXml: string,
): readonly ParsedFood[] => {
  const { groups, subGroups } = parseGroupNames(alimGrpXml);

  return readRecords(alimXml, "ALIM").map((record) => {
    const nameFr = readField(record, "alim_nom_fr");
    const groupCode = readField(record, "alim_grp_code");
    const subGroupCode = readField(record, "alim_ssgrp_code");

    return {
      code: readField(record, "alim_code"),
      nameFr,
      nameEn: readField(record, "alim_nom_eng"),
      searchName: normaliseNutritionText(nameFr),
      groupCode,
      groupNameFr: groups.get(groupCode) ?? "",
      subGroupCode,
      subGroupNameFr: subGroups.get(subGroupCode) ?? "",
    };
  });
};

export const parseNutrients = (
  compoXml: string,
  components: readonly CiqualComponent[],
): readonly ParsedNutrient[] => {
  const byCode = new Map(components.map((entry) => [entry.code, entry]));

  return readRecords(compoXml, "COMPO").map((record) => {
    const componentCode = readField(record, "const_code");
    const component = byCode.get(componentCode);
    const parsed = parseTeneur(readField(record, "teneur"));

    return {
      foodCode: readField(record, "alim_code"),
      componentCode,
      componentNameFr: component?.label ?? "",
      unit: component?.unit ?? "",
      value: parsed.value,
      marker: parsed.marker,
      rawValue: parsed.rawValue,
      confidence: parseConfidence(readField(record, "code_confiance")),
    };
  });
};

/**
 * Refuse an export whose component vocabulary is not the one this build knows.
 *
 * The point is not to pin a version number — it is that a later edition may
 * renumber or retire a component, and an import that quietly writes the new
 * numbering leaves every ranking reading a column that no longer means what
 * the recommendation map says it does. Better to stop and be told.
 */
export const checkComponents = (
  components: readonly CiqualComponent[],
  expectedCodes: readonly string[],
): readonly string[] => {
  const present = new Set(components.map((entry) => entry.code));
  return expectedCodes.filter((code) => !present.has(code));
};

export const parseCiqualExport = (source: CiqualSourceText): CiqualExport => {
  const components = parseComponents(source.components);
  return {
    components,
    foods: parseFoods(source.alim, source.alimGrp),
    nutrients: parseNutrients(source.compo, components),
  };
};
