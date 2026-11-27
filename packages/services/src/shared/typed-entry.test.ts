import { describe, expect, it } from "vitest";
import {
  dateEntryFromIso,
  isAdultOn,
  isCalendarDay,
  isTodayOrLater,
  maskDateEntry,
  maskNumberEntry,
  parseDateEntry,
} from "./typed-entry";

describe("a calendar day", () => {
  it("accepts a real day", () => {
    expect(isCalendarDay("1990-05-12")).toBe(true);
    expect(isCalendarDay("2024-02-29")).toBe(true);
  });

  it("refuses a day that no calendar has", () => {
    expect(isCalendarDay("2026-02-31")).toBe(false);
    expect(isCalendarDay("2025-02-29")).toBe(false);
    expect(isCalendarDay("2026-13-01")).toBe(false);
    expect(isCalendarDay("2026-00-10")).toBe(false);
  });

  it("refuses a year before 1900 and a text that is not a day", () => {
    expect(isCalendarDay("0199-05-12")).toBe(false);
    expect(isCalendarDay("12/05/1990")).toBe(false);
    expect(isCalendarDay("")).toBe(false);
  });
});

describe("the age and the day rules (REM-159)", () => {
  it("accepts a person of 18 from the day of the 18th birthday", () => {
    expect(isAdultOn("2008-11-27", "2026-11-27")).toBe(true);
    expect(isAdultOn("2008-11-28", "2026-11-27")).toBe(false);
    expect(isAdultOn("1985-04-12", "2026-11-27")).toBe(true);
  });

  it("makes a person born on 29 February 18 on 1 March", () => {
    expect(isAdultOn("2008-02-29", "2026-02-28")).toBe(false);
    expect(isAdultOn("2008-02-29", "2026-03-01")).toBe(true);
  });

  it("accepts today and a later day, and refuses an earlier day", () => {
    expect(isTodayOrLater("2026-11-27", "2026-11-27")).toBe(true);
    expect(isTodayOrLater("2026-12-01", "2026-11-27")).toBe(true);
    expect(isTodayOrLater("2026-11-26", "2026-11-27")).toBe(false);
  });
});

describe("a stored day in the field's format", () => {
  it("reads JJ/MM/AAAA", () => {
    expect(dateEntryFromIso("1990-05-12")).toBe("12/05/1990");
  });

  it("is empty for no date, never today", () => {
    expect(dateEntryFromIso("")).toBe("");
    expect(dateEntryFromIso(null)).toBe("");
    expect(dateEntryFromIso(undefined)).toBe("");
    expect(dateEntryFromIso("not a day")).toBe("");
  });
});

describe("the mask of a date field", () => {
  it("puts the slashes in as the digits come", () => {
    expect(maskDateEntry("1")).toBe("1");
    expect(maskDateEntry("12")).toBe("12");
    expect(maskDateEntry("120")).toBe("12/0");
    expect(maskDateEntry("1205")).toBe("12/05");
    expect(maskDateEntry("12051")).toBe("12/05/1");
    expect(maskDateEntry("12051990")).toBe("12/05/1990");
  });

  it("keeps eight digits at most", () => {
    expect(maskDateEntry("120519901")).toBe("12/05/1990");
  });

  it("drops a slash that nothing follows, so the delete key works", () => {
    expect(maskDateEntry("12/05/")).toBe("12/05");
    expect(maskDateEntry("12/")).toBe("12");
  });

  it("gives its zero to a day or a month typed as one digit", () => {
    expect(maskDateEntry("1/")).toBe("01");
    expect(maskDateEntry("01/5/")).toBe("01/05");
    expect(maskDateEntry("1/5/1990")).toBe("01/05/1990");
  });

  it("does not pad the part that is still typed", () => {
    expect(maskDateEntry("12/0")).toBe("12/0");
    expect(maskDateEntry("12/05/1")).toBe("12/05/1");
  });

  it("reads a day that the browser fills in as YYYY-MM-DD", () => {
    expect(maskDateEntry("1990-05-12")).toBe("12/05/1990");
  });

  it("drops letters", () => {
    expect(maskDateEntry("ab")).toBe("");
  });
});

describe("a typed date", () => {
  it("is empty for an empty field", () => {
    expect(parseDateEntry("")).toEqual({ state: "empty" });
    expect(parseDateEntry("  ")).toEqual({ state: "empty" });
  });

  it("reads JJ/MM/AAAA", () => {
    expect(parseDateEntry("12/05/1990")).toEqual({
      state: "valid",
      iso: "1990-05-12",
    });
  });

  it("reads one-digit parts, eight digits and YYYY-MM-DD", () => {
    expect(parseDateEntry("1/5/1990")).toEqual({
      state: "valid",
      iso: "1990-05-01",
    });
    expect(parseDateEntry("12051990")).toEqual({
      state: "valid",
      iso: "1990-05-12",
    });
    expect(parseDateEntry("1990-05-12")).toEqual({
      state: "valid",
      iso: "1990-05-12",
    });
  });

  it("is incomplete while the date is typed", () => {
    expect(parseDateEntry("12")).toEqual({ state: "incomplete" });
    expect(parseDateEntry("12/05")).toEqual({ state: "incomplete" });
    expect(parseDateEntry("12/05/199")).toEqual({ state: "incomplete" });
  });

  it("refuses a day that no calendar has", () => {
    expect(parseDateEntry("31/02/2026")).toEqual({ state: "invalid" });
    expect(parseDateEntry("12/13/1990")).toEqual({ state: "invalid" });
    expect(parseDateEntry("00/05/1990")).toEqual({ state: "invalid" });
    expect(parseDateEntry("2026-02-31")).toEqual({ state: "invalid" });
  });

  it("refuses a year before 1900 and a text with letters", () => {
    expect(parseDateEntry("12/05/0199")).toEqual({ state: "invalid" });
    expect(parseDateEntry("12 mai 1990")).toEqual({ state: "invalid" });
  });
});

describe("the mask of a number field", () => {
  it("keeps three digits for a height", () => {
    expect(maskNumberEntry("172", "integer")).toBe("172");
    expect(maskNumberEntry("1m72", "integer")).toBe("172");
    expect(maskNumberEntry("172,5", "integer")).toBe("172");
    expect(maskNumberEntry("1725", "integer")).toBe("172");
  });

  it("keeps one decimal for a weight, with the comma or the point typed", () => {
    expect(maskNumberEntry("65", "decimal")).toBe("65");
    expect(maskNumberEntry("65,", "decimal")).toBe("65,");
    expect(maskNumberEntry("65,5", "decimal")).toBe("65,5");
    expect(maskNumberEntry("65.5", "decimal")).toBe("65.5");
    expect(maskNumberEntry("65,55", "decimal")).toBe("65,5");
    expect(maskNumberEntry("65,5,2", "decimal")).toBe("65,5");
  });

  it("drops letters and a sign", () => {
    expect(maskNumberEntry("65 kg", "decimal")).toBe("65");
    expect(maskNumberEntry("-65", "decimal")).toBe("65");
    expect(maskNumberEntry("1234", "decimal")).toBe("123");
  });
});
