import { describe, expect, it } from "vitest";
import {
  careConsentGiven,
  consentKeys,
  consentSummaries,
  type LatestConsent,
} from "./consent";

const row = (
  decision: LatestConsent["decision"],
  textVersion = "3",
): LatestConsent => ({
  decision,
  decidedAt: new Date("2026-11-20T10:00:00Z"),
  textVersion,
  textLocale: textVersion === "legacy" ? null : "fr-BE",
});

describe("consentSummaries", () => {
  it("lists every key in the order of the vocabulary", () => {
    expect(
      consentSummaries({ cgv: row("given", "1") }).map(
        (summary) => summary.key,
      ),
    ).toEqual([...consentKeys]);
  });

  it("shows no CGV line for a patient with no CGV row (REM-207)", () => {
    expect(consentSummaries({}).map((summary) => summary.key)).toEqual([
      "care",
      "genetic",
    ]);
  });

  it("shows accepted CGV read-only: no withdrawal, no new consent (REM-207)", () => {
    const cgv = consentSummaries({ cgv: row("given", "1") }).find(
      (summary) => summary.key === "cgv",
    );
    expect(cgv).toEqual({
      key: "cgv",
      state: "given",
      decidedAt: new Date("2026-11-20T10:00:00Z"),
      textVersion: "1",
      textLocale: "fr-BE",
      withdrawable: false,
      canGive: false,
    });
  });

  it("names a key with no row as not asked", () => {
    const [care, genetic] = consentSummaries({});
    expect(genetic).toEqual({
      key: "genetic",
      state: "none",
      decidedAt: null,
      textVersion: null,
      textLocale: null,
      withdrawable: false,
      canGive: false,
    });
    expect(care?.state).toBe("none");
    expect(care?.withdrawable).toBe(false);
  });

  it("lets the patient withdraw a consent in force, and only that", () => {
    const [care, genetic] = consentSummaries({
      care: row("given"),
      genetic: row("refused", "2"),
    });
    expect(care?.withdrawable).toBe(true);
    expect(care?.canGive).toBe(false);
    expect(genetic?.withdrawable).toBe(false);
    expect(genetic?.canGive).toBe(false);
  });

  it("offers a new consent after a withdrawal", () => {
    const [care, genetic] = consentSummaries({
      care: row("withdrawn"),
      genetic: row("withdrawn", "2"),
    });
    expect(care?.state).toBe("withdrawn");
    expect(care?.withdrawable).toBe(false);
    expect(care?.canGive).toBe(true);
    expect(genetic?.canGive).toBe(true);
  });

  it("offers a mandatory consent that is not in force, and no optional one", () => {
    const [care, genetic] = consentSummaries({});
    expect(care?.canGive).toBe(true);
    expect(genetic?.canGive).toBe(false);
    const [refusedCare] = consentSummaries({ care: row("refused") });
    expect(refusedCare?.canGive).toBe(true);
  });

  it("keeps the date and the version of the decision, also for a legacy row", () => {
    const [care] = consentSummaries({ care: row("given", "legacy") });
    expect(care?.decidedAt).toEqual(new Date("2026-11-20T10:00:00Z"));
    expect(care?.textVersion).toBe("legacy");
    expect(care?.textLocale).toBeNull();
    expect(care?.withdrawable).toBe(true);
  });
});

describe("careConsentGiven", () => {
  it("is true only when the latest care decision is given", () => {
    expect(careConsentGiven({ care: { decision: "given" } })).toBe(true);
    expect(careConsentGiven({ care: { decision: "withdrawn" } })).toBe(false);
    expect(careConsentGiven({ care: { decision: "refused" } })).toBe(false);
    expect(careConsentGiven({})).toBe(false);
  });

  it("does not read the genetic consent", () => {
    expect(careConsentGiven({ genetic: { decision: "given" } })).toBe(false);
  });
});
