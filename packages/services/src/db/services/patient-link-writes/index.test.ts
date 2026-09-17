import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { err, ok, type Result } from "../../../shared/result";
import { registerDatabase } from "../../client";
import type { PatientProfile } from "../../models/patient-profile";
import { createMemoryDatabase } from "../../test-helpers";
import { listAuditEvents } from "../audit";
import { addMealEntry } from "../meal-entries";
import { createPatient, getPatient, regenerateShareToken } from "../patients";
import {
  PATIENT_LINK_BODY_MAX,
  PATIENT_LINK_SHORT_MAX,
  PATIENT_LINK_WRITES_PER_DAY,
  PATIENT_LINK_WRITES_PER_MINUTE,
  writeThroughPatientLink,
} from "./index";

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

afterEach(() => {
  vi.useRealTimers();
});

/** A fresh patient per test, so one test's ledger never counts in another's. */
const newPatient = async (pseudonym: string): Promise<PatientProfile> => {
  const created = await createPatient({ pseudonym });
  if (!created.ok) {
    throw new Error(created.message);
  }
  return created.data;
};

/** A write that touches nothing — the helper under test, not the write. */
const noop = async (): Promise<Result<string>> => ok("written");

/** A write the service itself rejects — validation below the helper. */
const rejected = async (): Promise<Result<string>> =>
  err("invalid_input", "a description is required");

describe("writing through a patient link", () => {
  it("runs the write, attributes it to the patient, and stamps the profile", async () => {
    const patient = await newPatient("Claire");
    const editedBefore = patient.lastEditedAt.getTime();

    const result = await writeThroughPatientLink({
      token: patient.shareToken,
      action: "meal.logged",
      text: { bodies: ["Spaghetti sauce tomate"] },
      write: (resolved) =>
        addMealEntry(
          resolved.id,
          { eatenOn: "2026-09-17", description: "Spaghetti sauce tomate" },
          "patient",
        ),
    });

    expect(result.ok).toBe(true);
    // The row itself says whose it is, not only the trail beside it.
    expect(result.ok && result.data.writtenBy).toBe("patient");

    const after = await getPatient(patient.id);
    expect(after.ok).toBe(true);
    if (!after.ok) {
      return;
    }
    expect(after.data.linkLastWroteAt).not.toBeNull();
    // A patient logging a meal is not Morgane working on the record, and the
    // roster sorts on the latter.
    expect(after.data.lastEditedAt.getTime()).toBe(editedBefore);

    const [event] = await listAuditEvents({ actorKind: "patient" });
    expect(event.actorKind).toBe("patient");
    expect(event.actorName).toBe("Claire");
    expect(event.actorEmail).toBe("");
    expect(event.action).toBe("meal.logged");
  });

  it("hands the write the patient the token resolved, never one a caller named", async () => {
    const patient = await newPatient("Inès");
    let seen: string | null = null;

    await writeThroughPatientLink({
      token: patient.shareToken,
      action: "meal.logged",
      text: {},
      write: async (resolved) => {
        seen = resolved.id;
        return ok("written");
      },
    });

    expect(seen).toBe(patient.id);
  });

  it("refuses an unknown, malformed or regenerated token without a trace", async () => {
    const patient = await newPatient("Sofia");
    const dead = patient.shareToken;
    await regenerateShareToken(patient.id);

    for (const token of [dead, "not a token", "", "x".repeat(64)]) {
      const result = await writeThroughPatientLink({
        token,
        action: "meal.logged",
        text: {},
        write: noop,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("not_found");
      }
    }

    // Nothing ran, nothing was recorded, and the refusal says the same thing
    // whether the token never existed or was revoked a second ago.
    const after = await getPatient(patient.id);
    expect(after.ok && after.data.linkLastWroteAt).toBeNull();
    expect(
      (await listAuditEvents({ actorKind: "patient" })).some(
        (event) => event.actorId === patient.id,
      ),
    ).toBe(false);
  });

  it("refuses a body or a short field over its cap before touching the seam", async () => {
    const patient = await newPatient("Lena");
    let ran = false;
    const write = async () => {
      ran = true;
      return ok("written");
    };

    const body = await writeThroughPatientLink({
      token: patient.shareToken,
      action: "meal.logged",
      text: { bodies: ["a".repeat(PATIENT_LINK_BODY_MAX + 1)] },
      write,
    });
    const short = await writeThroughPatientLink({
      token: patient.shareToken,
      action: "meal.logged",
      text: { shorts: ["b".repeat(PATIENT_LINK_SHORT_MAX + 1)] },
      write,
    });

    for (const result of [body, short]) {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("invalid_input");
      }
    }
    expect(ran).toBe(false);

    const atTheCap = await writeThroughPatientLink({
      token: patient.shareToken,
      action: "meal.logged",
      text: {
        bodies: ["a".repeat(PATIENT_LINK_BODY_MAX)],
        shorts: ["b".repeat(PATIENT_LINK_SHORT_MAX)],
      },
      write,
    });
    expect(atTheCap.ok).toBe(true);
  });

  it("stops the eleventh write inside a minute", async () => {
    const patient = await newPatient("Amel");

    for (let n = 0; n < PATIENT_LINK_WRITES_PER_MINUTE; n += 1) {
      const allowed = await writeThroughPatientLink({
        token: patient.shareToken,
        action: "meal.logged",
        text: {},
        write: noop,
      });
      expect(allowed.ok).toBe(true);
    }

    const refused = await writeThroughPatientLink({
      token: patient.shareToken,
      action: "meal.logged",
      text: {},
      write: noop,
    });
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe("rate_limited");
    }
  });

  it("stops the hundred-and-first inside a day, and lets the window roll", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-17T08:00:00Z"));
    const patient = await newPatient("Nadia");

    // Two minutes apart, so the burst ceiling is never what refuses one.
    for (let n = 0; n < PATIENT_LINK_WRITES_PER_DAY; n += 1) {
      const allowed = await writeThroughPatientLink({
        token: patient.shareToken,
        action: "meal.logged",
        text: {},
        write: noop,
      });
      expect(allowed.ok).toBe(true);
      vi.advanceTimersByTime(2 * 60 * 1000);
    }

    const refused = await writeThroughPatientLink({
      token: patient.shareToken,
      action: "meal.logged",
      text: {},
      write: noop,
    });
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe("rate_limited");
    }

    // Rolling, not a bucket that resets on a boundary: once the oldest writes
    // are a day old they stop counting — and are pruned rather than kept.
    vi.advanceTimersByTime(24 * 60 * 60 * 1000);
    const later = await writeThroughPatientLink({
      token: patient.shareToken,
      action: "meal.logged",
      text: {},
      write: noop,
    });
    expect(later.ok).toBe(true);
  });

  it("holds the ceiling when the writes arrive at once, not one by one", async () => {
    const patient = await newPatient("Farah");

    // The seam has no interactive transaction, so a count-then-insert limit
    // would let every one of these through: they all read the same zero.
    const results = await Promise.all(
      Array.from({ length: PATIENT_LINK_WRITES_PER_MINUTE + 5 }, () =>
        writeThroughPatientLink({
          token: patient.shareToken,
          action: "meal.logged",
          text: {},
          write: noop,
        }),
      ),
    );

    // The invariant, and the only one worth asserting: never MORE than the
    // ceiling. Fewer is allowed and expected — when every claim lands before
    // any of them counts, they all see the same over-limit total and all stand
    // down. That is the safe direction, and it is not a bug to be tidied away.
    const allowed = results.filter((result) => result.ok).length;
    expect(allowed).toBeLessThanOrEqual(PATIENT_LINK_WRITES_PER_MINUTE);
    for (const refused of results.filter((result) => !result.ok)) {
      expect(refused.ok).toBe(false);
      if (!refused.ok) {
        expect(refused.error).toBe("rate_limited");
      }
    }

    // And the window is not left poisoned: a refusal hands its slot back, so
    // the patient whose burst was refused can still write the next moment.
    const afterwards = await writeThroughPatientLink({
      token: patient.shareToken,
      action: "meal.logged",
      text: {},
      write: noop,
    });
    expect(afterwards.ok).toBe(true);
  });

  it("counts an attempt whose write failed", async () => {
    const patient = await newPatient("Dounia");
    for (let n = 0; n < PATIENT_LINK_WRITES_PER_MINUTE; n += 1) {
      const attempt = await writeThroughPatientLink({
        token: patient.shareToken,
        action: "meal.logged",
        text: {},
        write: rejected,
      });
      expect(attempt.ok).toBe(false);
    }

    const refused = await writeThroughPatientLink({
      token: patient.shareToken,
      action: "meal.logged",
      text: {},
      write: noop,
    });
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe("rate_limited");
    }
  });

  it("records nothing and stamps nothing when the write itself fails", async () => {
    const patient = await newPatient("Yasmine");

    const result = await writeThroughPatientLink({
      token: patient.shareToken,
      action: "meal.logged",
      text: {},
      write: rejected,
    });

    expect(result.ok).toBe(false);
    const after = await getPatient(patient.id);
    expect(after.ok && after.data.linkLastWroteAt).toBeNull();
    expect(
      (await listAuditEvents({ actorKind: "patient" })).some(
        (event) => event.actorId === patient.id,
      ),
    ).toBe(false);
  });
});
