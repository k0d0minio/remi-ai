import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  consoleMailer,
  registerMailer,
  type EmailMessage,
} from "../../../email";
import { getDatabase, registerDatabase } from "../../client";
import type { AuditEvent } from "../../models/audit-event";
import type { Operator } from "../../models/operator";
import type { PatientAccount } from "../../models/patient-account";
import { createMemoryDatabase } from "../../test-helpers";
import { listAuditEvents, recordAuditEvent } from "../audit";
import {
  createPatientAccount,
  recordPatientAccountSeen,
} from "../patient-accounts";
import { createPatient, getPatient } from "../patients";
import {
  addMonthsUtc,
  deletionDateFor,
  runInactivitySweep,
  setRetentionHold,
} from "./index";
import { systemActor } from "../../services/access";

const DAY_MS = 24 * 60 * 60 * 1000;

let sent: EmailMessage[] = [];

const signInUrl = (locale: string) => `https://app.test/${locale}/connexion`;

const unwrapOk = <T>(result: { ok: true; data: T } | { ok: false }): T => {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error("unreachable");
  }
  return result.data;
};

/** A practitioner, a file and its account, created now. */
const seed = async (email = "claire@example.be") => {
  const practitioner = await getDatabase()
    .collection<Operator>("operators")
    .insert({
      email: "morgane@example.be",
      name: "Morgane",
      passwordHash: "x",
      role: "admin",
      signupLinkToken: "t".repeat(32),
      patientListSort: "appointment",
    });
  const patient = unwrapOk(
    await createPatient(systemActor, {
      practitionerId: practitioner.id,
      pseudonym: "Claire P.",
      firstName: "Claire",
      locale: "fr",
    }),
  );
  const account = unwrapOk(
    await createPatientAccount({
      patientProfileId: patient.id,
      email,
      authSubject: `subject-${email}`,
    }),
  );
  return { practitioner, patient, account };
};

const sweepAt = async (now: Date) =>
  unwrapOk(await runInactivitySweep({ now, signInUrl }));

const accountOf = async (id: string) =>
  getDatabase().collection<PatientAccount>("patient_accounts").findById(id);

const hourAfter = (date: Date) => new Date(date.getTime() + 60 * 60 * 1000);

/** The tables the sweep reads. Each test starts with them empty. */
const sweptTables = [
  "patient_accounts",
  "patient_profiles",
  "patient_documents",
  "audit_events",
  "operators",
];

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

beforeEach(async () => {
  for (const name of sweptTables) {
    const rows = getDatabase().collection<{ id: string }>(name);
    const page = await rows.findMany({}, { limit: 10_000 });
    for (const row of page.items) {
      await rows.remove(row.id);
    }
  }
  sent = [];
  registerMailer({
    provider: "test",
    send: async (message) => {
      sent.push(message);
      return { id: `test-${sent.length}`, provider: "test" };
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the calendar arithmetic", () => {
  it("moves by calendar months and keeps the last day of a short month", () => {
    expect(
      addMonthsUtc(new Date("2026-03-31T10:00:00Z"), 11).toISOString(),
    ).toBe("2027-02-28T10:00:00.000Z");
    expect(
      addMonthsUtc(new Date("2026-01-15T00:00:00Z"), 12).toISOString(),
    ).toBe("2027-01-15T00:00:00.000Z");
  });

  it("keeps thirty days after the notice when eleven to twelve months is shorter", () => {
    // 1 February to 1 March 2027 is 28 days.
    const lastActive = new Date("2026-03-01T00:00:00Z");
    const notice = addMonthsUtc(lastActive, 11);
    expect(deletionDateFor(lastActive, notice).toISOString()).toBe(
      "2027-03-03T00:00:00.000Z",
    );
  });
});

describe("the notice at eleven months", () => {
  it("sends nothing before eleven months", async () => {
    const { account } = await seed();
    const counts = await sweepAt(
      new Date(addMonthsUtc(account.createdAt, 11).getTime() - DAY_MS),
    );
    expect(counts.noticed).toBe(0);
    expect(sent).toEqual([]);
  });

  it("sends one notice that names the date, and a copy to the practitioner", async () => {
    const { account, patient } = await seed();
    const now = hourAfter(addMonthsUtc(account.createdAt, 11));
    const counts = await sweepAt(now);
    expect(counts.noticed).toBe(1);
    expect(sent.map((message) => message.to)).toEqual([
      "claire@example.be",
      "morgane@example.be",
    ]);
    expect(sent[0]?.subject).toMatch(/^Ton compte REMI sera supprimé le /);
    expect(sent[0]?.text).toContain("https://app.test/fr/connexion");
    expect(sent[1]?.text).toContain("Claire P.");
    expect(sent[1]?.text).not.toContain("claire@example.be");
    expect((await accountOf(account.id))?.inactivityNoticeSentAt).toEqual(now);
    const notices = await listAuditEvents(systemActor, {
      action: "patient.inactivity_notice_sent",
    });
    expect(notices).toContainEqual(
      expect.objectContaining({ actorKind: "system", targetId: patient.id }),
    );
  });

  it("is idempotent: a second run on the same day sends nothing", async () => {
    const { account } = await seed();
    const now = hourAfter(addMonthsUtc(account.createdAt, 11));
    await sweepAt(now);
    const again = await sweepAt(hourAfter(now));
    expect(again.noticed).toBe(0);
    expect(sent).toHaveLength(2);
  });

  it("counts the patient's latest write as activity", async () => {
    const { account, patient } = await seed();
    const wroteAt = addMonthsUtc(account.createdAt, 3);
    await recordAuditEvent({
      actor: { kind: "patient", id: patient.id, name: patient.pseudonym },
      action: "meal.logged",
      targetType: "patient",
      targetId: patient.id,
    });
    const events = getDatabase().collection<AuditEvent>("audit_events");
    const [written] = (await events.findMany({ action: "meal.logged" })).items;
    if (!written) {
      throw new Error("the write was not recorded");
    }
    await events.update(written.id, { createdAt: wroteAt });

    const counts = await sweepAt(
      hourAfter(addMonthsUtc(account.createdAt, 11)),
    );
    expect(counts.noticed).toBe(0);
    const later = await sweepAt(hourAfter(addMonthsUtc(wroteAt, 11)));
    expect(later.noticed).toBe(1);
  });

  it("sends nothing and deletes nothing with no mailer registered", async () => {
    const { account, patient } = await seed();
    registerMailer(consoleMailer);
    const result = await runInactivitySweep({
      now: addMonthsUtc(account.createdAt, 24),
      signInUrl,
    });
    expect(result.ok ? null : result.error).toBe("upstream_failed");
    expect((await getPatient(systemActor, patient.id)).ok).toBe(true);
    expect((await accountOf(account.id))?.inactivityNoticeSentAt).toBeNull();
  });
});

describe("a sign-in after the notice", () => {
  it("cancels the deletion, and the next notice comes eleven months after it", async () => {
    const { account, patient } = await seed();
    const noticeAt = hourAfter(addMonthsUtc(account.createdAt, 11));
    await sweepAt(noticeAt);

    const signedInAt = new Date(noticeAt.getTime() + 5 * DAY_MS);
    const current = await accountOf(account.id);
    if (!current) {
      throw new Error("the account is gone");
    }
    await recordPatientAccountSeen(current, {
      everyTime: true,
      now: signedInAt,
    });

    const atTwelve = await sweepAt(
      new Date(addMonthsUtc(account.createdAt, 12).getTime() + 31 * DAY_MS),
    );
    expect(atTwelve).toMatchObject({ voided: 1, deleted: 0, noticed: 0 });
    expect((await getPatient(systemActor, patient.id)).ok).toBe(true);

    sent = [];
    const before = await sweepAt(
      new Date(addMonthsUtc(signedInAt, 11).getTime() - DAY_MS),
    );
    expect(before.noticed).toBe(0);
    const after = await sweepAt(hourAfter(addMonthsUtc(signedInAt, 11)));
    expect(after.noticed).toBe(1);
    expect(sent[0]?.to).toBe("claire@example.be");
  });
});

describe("the deletion at twelve months", () => {
  it("deletes the file through the console's cascade, with a system audit event", async () => {
    const { account, patient } = await seed();
    const noticeAt = hourAfter(addMonthsUtc(account.createdAt, 11));
    await sweepAt(noticeAt);
    const due = deletionDateFor(account.createdAt, noticeAt);

    const early = await sweepAt(new Date(due.getTime() - DAY_MS));
    expect(early.deleted).toBe(0);

    const counts = await sweepAt(hourAfter(due));
    expect(counts.deleted).toBe(1);
    expect((await getPatient(systemActor, patient.id)).ok).toBe(false);
    const deletions = await listAuditEvents(systemActor, {
      action: "patient.deleted",
    });
    expect(deletions).toContainEqual(
      expect.objectContaining({
        actorKind: "system",
        targetId: patient.id,
        detail: "inactivity",
      }),
    );

    const again = await sweepAt(hourAfter(hourAfter(due)));
    expect(again.deleted).toBe(0);
  });

  it("waits thirty days after a late notice", async () => {
    const { account, patient } = await seed();
    // The sweep did not run for two years: the notice goes out late.
    const noticeAt = addMonthsUtc(account.createdAt, 24);
    expect((await sweepAt(noticeAt)).noticed).toBe(1);
    const tooSoon = await sweepAt(new Date(noticeAt.getTime() + 29 * DAY_MS));
    expect(tooSoon.deleted).toBe(0);
    expect((await getPatient(systemActor, patient.id)).ok).toBe(true);
    const due = await sweepAt(new Date(noticeAt.getTime() + 30 * DAY_MS));
    expect(due.deleted).toBe(1);
  });
});

describe("the retention hold", () => {
  it("blocks the notice and the deletion, with one log line per skip", async () => {
    const { account, patient, practitioner } = await seed();
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    unwrapOk(
      await setRetentionHold(systemActor, patient.id, true, {
        id: practitioner.id,
        email: practitioner.email,
        name: practitioner.name,
      }),
    );

    const counts = await sweepAt(addMonthsUtc(account.createdAt, 24));
    expect(counts).toMatchObject({ held: 1, noticed: 0, deleted: 0 });
    expect(sent).toEqual([]);
    expect((await getPatient(systemActor, patient.id)).ok).toBe(true);
    expect(info).toHaveBeenCalledTimes(1);
    expect(info.mock.calls[0]?.[0]).toContain(patient.id);

    const set = await listAuditEvents(systemActor, {
      action: "patient.retention_hold_set",
    });
    expect(set).toContainEqual(
      expect.objectContaining({ actorId: practitioner.id }),
    );
  });

  it("blocks a deletion already due after the notice", async () => {
    const { account, patient, practitioner } = await seed();
    const noticeAt = hourAfter(addMonthsUtc(account.createdAt, 11));
    await sweepAt(noticeAt);
    vi.spyOn(console, "info").mockImplementation(() => {});
    await setRetentionHold(systemActor, patient.id, true, {
      id: practitioner.id,
      email: practitioner.email,
      name: practitioner.name,
    });
    const counts = await sweepAt(
      hourAfter(deletionDateFor(account.createdAt, noticeAt)),
    );
    expect(counts).toMatchObject({ held: 1, deleted: 0 });
    expect((await getPatient(systemActor, patient.id)).ok).toBe(true);
  });

  it("clears the hold and writes one event per change", async () => {
    const { patient, practitioner } = await seed();
    const actor = {
      id: practitioner.id,
      email: practitioner.email,
      name: practitioner.name,
    };
    await setRetentionHold(systemActor, patient.id, true, actor);
    await setRetentionHold(systemActor, patient.id, true, actor);
    const cleared = unwrapOk(
      await setRetentionHold(systemActor, patient.id, false, actor),
    );
    expect(cleared.retentionHoldAt).toBeNull();
    expect(
      await listAuditEvents(systemActor, {
        action: "patient.retention_hold_set",
      }),
    ).toHaveLength(1);
    expect(
      await listAuditEvents(systemActor, {
        action: "patient.retention_hold_cleared",
      }),
    ).toHaveLength(1);
  });
});
