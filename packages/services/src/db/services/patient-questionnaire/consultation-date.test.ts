import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase, testPractitionerId } from "../../test-helpers";
import { listAuditEvents, type OperatorActor } from "../audit";
import { createPatient } from "../patients";
import { getPatientQuestionnaire, savePatientQuestionnaire } from "./index";
import { systemActor } from "../../services/access";

// `appointment-date`: the file's one consultation date, and its audit trail.

const morgane: OperatorActor = {
  id: testPractitionerId,
  email: "morgane@example.test",
  name: "Morgane",
};

let patientId: string;

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  const created = await createPatient(systemActor, {
    practitionerId: testPractitionerId,
    pseudonym: "Inès",
    sex: "other",
  });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  patientId = created.data.id;
});

/** Two events share a millisecond otherwise, and the journal reads by time. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

const dateEvents = async () =>
  listAuditEvents(systemActor, {
    action: "patient.consultation_date_changed",
    targetId: patientId,
  });

const dateOf = async () => {
  const view = await getPatientQuestionnaire(systemActor, patientId);
  if (!view.ok) {
    throw new Error(view.message);
  }
  return view.data.answers.consultationDate;
};

describe("the consultation date", () => {
  it("starts « Non renseigné », with no event", async () => {
    expect(await dateOf()).toBe(null);
    expect(await dateEvents()).toEqual([]);
  });

  it("sets the date and records the empty old value and the new one", async () => {
    const saved = await savePatientQuestionnaire(
      systemActor,
      patientId,
      { consultationDate: "2026-11-12" },
      morgane,
    );
    expect(saved.ok).toBe(true);
    expect(await dateOf()).toBe("2026-11-12");

    const events = await dateEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      actorKind: "operator",
      actorId: morgane.id,
      actorName: "Morgane",
      targetType: "patient",
      targetId: patientId,
      targetLabel: "Inès",
      detail: "∅ → 2026-11-12",
    });
  });

  it("changes the date and records both values", async () => {
    await tick();
    await savePatientQuestionnaire(
      systemActor,
      patientId,
      { consultationDate: "2026-11-19" },
      morgane,
    );
    expect(await dateOf()).toBe("2026-11-19");

    const events = await dateEvents();
    expect(events).toHaveLength(2);
    expect(events[0].detail).toBe("2026-11-12 → 2026-11-19");
  });

  it("writes no event when the date does not change", async () => {
    await savePatientQuestionnaire(
      systemActor,
      patientId,
      { consultationDate: "2026-11-19" },
      morgane,
    );
    expect(await dateEvents()).toHaveLength(2);
  });

  it("writes no event when a save does not name the date", async () => {
    await savePatientQuestionnaire(
      systemActor,
      patientId,
      { consultationReason: "Fatigue." },
      morgane,
    );
    expect(await dateOf()).toBe("2026-11-19");
    expect(await dateEvents()).toHaveLength(2);
  });

  it("clears the date from an empty string and records the cleared value", async () => {
    await tick();
    await savePatientQuestionnaire(
      systemActor,
      patientId,
      { consultationDate: "" },
      morgane,
    );
    expect(await dateOf()).toBe(null);

    const events = await dateEvents();
    expect(events).toHaveLength(3);
    expect(events[0].detail).toBe("2026-11-19 → ∅");
  });

  it("refuses a date that is not a calendar day, and writes nothing", async () => {
    const saved = await savePatientQuestionnaire(
      systemActor,
      patientId,
      { consultationDate: "12/11/2026" },
      morgane,
    );
    expect(saved.ok).toBe(false);
    expect(await dateOf()).toBe(null);
    expect(await dateEvents()).toHaveLength(3);
  });

  it("records an event with no actor when the caller names none", async () => {
    await tick();
    await savePatientQuestionnaire(systemActor, patientId, {
      consultationDate: "2026-12-03",
    });
    const events = await dateEvents();
    expect(events).toHaveLength(4);
    expect(events[0]).toMatchObject({
      actorId: null,
      detail: "∅ → 2026-12-03",
    });
  });
});
