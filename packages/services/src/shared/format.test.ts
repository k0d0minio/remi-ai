import { describe, expect, it } from "vitest";
import { formatDayInWords } from "./format";

describe("formatDayInWords", () => {
  it("writes a calendar day in French words", () => {
    expect(formatDayInWords("2026-12-03")).toBe("3 décembre 2026");
  });

  it("keeps the day at the edge of a year, in any timezone", () => {
    expect(formatDayInWords("2027-01-01")).toBe("1 janvier 2027");
    expect(formatDayInWords("2026-12-31")).toBe("31 décembre 2026");
  });
});
