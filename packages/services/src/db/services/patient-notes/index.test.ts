import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import { createPatient, getPatient } from "../patients";
import {
  addPatientNote,
  deletePatientNote,
  listPatientNotes,
  updatePatientNote,
} from "./index";

let patientId: string;

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  const created = await createPatient({ pseudonym: "Claire" });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  patientId = created.data.id;
});

const unwrapOk = <T>(result: { ok: true; data: T } | { ok: false }): T => {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error("unreachable");
  }
  return result.data;
};

describe("consultation notes", () => {
  it("records the consultation's date and who wrote it", async () => {
    const note = unwrapOk(
      await addPatientNote(patientId, {
        occurredAt: "2026-08-26",
        title: "First consultation",
        body: "Anamnesis taken. Sleep and digestion are the entry points.",
        authorName: "Morgane",
      }),
    );
    expect(note.occurredAt).toBe("2026-08-26");
    expect(note.authorName).toBe("Morgane");
  });

  it("needs a valid date, and something written in it", async () => {
    expect(
      (await addPatientNote(patientId, { occurredAt: "26/08/2026" })).ok,
    ).toBe(false);
    expect(
      (await addPatientNote(patientId, { occurredAt: "2026-13-45" })).ok,
    ).toBe(false);
    expect(
      (await addPatientNote(patientId, { occurredAt: "2026-08-26" })).ok,
    ).toBe(false);
  });

  it("reads newest consultation first, not newest written first", async () => {
    await addPatientNote(patientId, {
      occurredAt: "2026-09-09",
      title: "Third",
    });
    await addPatientNote(patientId, {
      occurredAt: "2026-09-02",
      title: "Second",
    });
    expect(
      (await listPatientNotes(patientId)).map((note) => note.title),
    ).toEqual(["Third", "Second", "First consultation"]);
  });

  it("marks the profile as worked on", async () => {
    const before = unwrapOk(await getPatient(patientId));
    await new Promise((resolve) => setTimeout(resolve, 5));
    await addPatientNote(patientId, {
      occurredAt: "2026-09-16",
      title: "Fourth",
    });
    const after = unwrapOk(await getPatient(patientId));
    expect(after.lastEditedAt.getTime()).toBeGreaterThan(
      before.lastEditedAt.getTime(),
    );
  });

  it("updates and deletes", async () => {
    const listed = await listPatientNotes(patientId);
    const first = listed[0];
    expect(
      unwrapOk(await updatePatientNote(first.id, { body: "Amended." })).body,
    ).toBe("Amended.");
    expect(unwrapOk(await deletePatientNote(first.id))).toBe(true);
    expect(
      (await listPatientNotes(patientId)).some((note) => note.id === first.id),
    ).toBe(false);
  });

  it("treats malformed ids as empty or not found", async () => {
    expect(await listPatientNotes("not-a-uuid")).toEqual([]);
    expect(
      (await addPatientNote("not-a-uuid", { occurredAt: "2026-08-26" })).ok,
    ).toBe(false);
    expect((await updatePatientNote("not-a-uuid", {})).ok).toBe(false);
    expect((await deletePatientNote("not-a-uuid")).ok).toBe(false);
  });
});
