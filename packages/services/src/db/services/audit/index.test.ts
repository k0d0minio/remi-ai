import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import { listAuditEvents, recordAuditEvent, type AuditActor } from "./index";

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

const morgane: AuditActor = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "morgane@example.com",
  name: "Morgane",
};

const arnaud: AuditActor = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "arnaud@example.com",
  name: "Arnaud",
};

/** Recorded events share a millisecond otherwise, and the sort is by time. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

describe("the audit trail", () => {
  it("records who did what to which target", async () => {
    await recordAuditEvent({
      actor: morgane,
      action: "patient.created",
      targetType: "patient",
      targetId: "aaaa",
      targetLabel: "Claire",
    });
    const [event] = await listAuditEvents();
    expect(event.actorEmail).toBe("morgane@example.com");
    expect(event.actorName).toBe("Morgane");
    expect(event.action).toBe("patient.created");
    expect(event.targetLabel).toBe("Claire");
  });

  it("reads newest first", async () => {
    await tick();
    await recordAuditEvent({ actor: arnaud, action: "operator.signed_in" });
    const listed = await listAuditEvents();
    expect(listed[0].action).toBe("operator.signed_in");
  });

  it("filters by action, actor and target", async () => {
    await tick();
    await recordAuditEvent({
      actor: arnaud,
      action: "patient.deleted",
      targetType: "patient",
      targetId: "bbbb",
      targetLabel: "Marc",
    });

    expect(
      (await listAuditEvents({ action: "patient.deleted" })).every(
        (event) => event.action === "patient.deleted",
      ),
    ).toBe(true);
    expect(
      (await listAuditEvents({ actorId: arnaud.id })).every(
        (event) => event.actorId === arnaud.id,
      ),
    ).toBe(true);
    expect(await listAuditEvents({ targetId: "aaaa" })).toHaveLength(1);
    expect(await listAuditEvents({ action: "all" })).toHaveLength(3);
  });

  it("accepts a null actor — a trail with no name is better than no row", async () => {
    await recordAuditEvent({ actor: null, action: "operator.joined" });
    const [event] = await listAuditEvents({ action: "operator.joined" });
    expect(event.actorId).toBeNull();
    expect(event.actorEmail).toBe("");
  });

  it("drops an action outside the vocabulary rather than writing it", async () => {
    const before = (await listAuditEvents({ limit: 500 })).length;
    await recordAuditEvent({
      actor: morgane,
      // Deliberately not an `AuditAction` — the runtime guard is what is
      // under test, so the cast is the test, not a workaround.
      action: "patient.exfiltrated" as never,
    });
    expect((await listAuditEvents({ limit: 500 })).length).toBe(before);
  });

  it("caps and floors the requested limit", async () => {
    expect((await listAuditEvents({ limit: 1 })).length).toBe(1);
    expect((await listAuditEvents({ limit: -5 })).length).toBe(1);
  });
});
