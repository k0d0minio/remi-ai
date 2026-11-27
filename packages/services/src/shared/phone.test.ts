import { describe, expect, it } from "vitest";
import { maskPhoneEntry, normalizePhone } from "./phone";

describe("normalizePhone", () => {
  it("accepts an international number and removes the spaces", () => {
    expect(normalizePhone("+32 470 12 34 56")).toBe("+32470123456");
    expect(normalizePhone(" +32470123456 ")).toBe("+32470123456");
    expect(normalizePhone("+32 2 123 45 67")).toBe("+3221234567");
    expect(normalizePhone("+33 6 12 34 56 78")).toBe("+33612345678");
    expect(normalizePhone("+31 6 12345678")).toBe("+31612345678");
    expect(normalizePhone("+352 621 123 456")).toBe("+352621123456");
    expect(normalizePhone("+44 7911 123456")).toBe("+447911123456");
    expect(normalizePhone("+1 415 555 2671")).toBe("+14155552671");
    expect(normalizePhone("+212 6 12 34 56 78")).toBe("+212612345678");
  });

  it("keeps the 0 of an Italian number", () => {
    expect(normalizePhone("+39 06 1234 5678")).toBe("+390612345678");
  });

  it("asks for the country code", () => {
    expect(normalizePhone("0470 12 34 56")).toBeNull();
    expect(normalizePhone("32470123456")).toBeNull();
    expect(normalizePhone("0032 470 12 34 56")).toBeNull();
  });

  it("refuses a country code that does not exist", () => {
    expect(normalizePhone("+0 470 12 34 56")).toBeNull();
    expect(normalizePhone("+999 123 456 789")).toBeNull();
  });

  it("refuses a wrong length or a trunk 0 in a neighbour country", () => {
    expect(normalizePhone("+32 0470 12 34 56")).toBeNull();
    expect(normalizePhone("+32 470 12 3")).toBeNull();
    expect(normalizePhone("+32 470 12 34 56 7")).toBeNull();
    expect(normalizePhone("+33 06 12 34 56 78")).toBeNull();
  });

  it("refuses other characters and lengths outside E.164", () => {
    expect(normalizePhone("+32-470-12-34-56")).toBeNull();
    expect(normalizePhone("++32470123456")).toBeNull();
    expect(normalizePhone("+32 47a 12 34 56")).toBeNull();
    expect(normalizePhone("+1 234")).toBeNull();
    expect(normalizePhone("+1 2345 6789 0123 456")).toBeNull();
    expect(normalizePhone("")).toBeNull();
  });
});

describe("maskPhoneEntry", () => {
  it("keeps the +, the digits and the spaces", () => {
    expect(maskPhoneEntry("+32 (470) 12-34.56")).toBe("+32 470 123456");
    expect(maskPhoneEntry("abc")).toBe("");
  });
});
