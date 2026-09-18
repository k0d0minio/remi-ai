import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import { addPatientGoal, listGoalCheckIns } from "../patient-goals";
import { getPatientInstruction } from "../patient-instructions";
import { listPatientNotes } from "../patient-notes";
import { getPatientSummary } from "../patient-summaries";
import { createPatient, getPatient } from "../patients";
import { describeConsultation, recordConsultation } from "./index";

/**
 * A fresh patient and goal per test: these assert on what a save left behind,
 * so rows carried over from the previous one would make a passing rollback
 * test indistinguishable from a passing write. The adapter is registered once
 * — registering a second one is a bug the seam refuses, not a reset.
 */
let patientId: string;
let goalId: string;

const unwrapOk = <T>(result: { ok: true; data: T } | { ok: false }): T => {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error("unreachable");
  }
  return result.data;
};

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

beforeEach(async () => {
  patientId = unwrapOk(await createPatient({ pseudonym: "Claire" })).id;
  goalId = unwrapOk(
    await addPatientGoal(patientId, { title: "Dormir sans réveil" }),
  ).id;
});

describe("recording a consultation", () => {
  it("writes the note, the check-ins and the three revised fields at once", async () => {
    const record = unwrapOk(
      await recordConsultation(patientId, {
        note: {
          occurredAt: "2026-09-17",
          title: "Deuxième consultation",
          body: "Le sommeil s'améliore, la digestion reste difficile.",
          authorName: "Morgane",
        },
        checkIns: [{ goalId, direction: "better", measure: "7/10" }],
        instruction: "Une marche de vingt minutes après le dîner.",
        summary: "Contexte : fatigue chronique depuis le printemps.",
        nextConsultationPrep: "Revoir le petit-déjeuner.",
      }),
    );

    expect(record.checkIns).toHaveLength(1);
    expect(record.instructionChanged).toBe(true);
    expect(record.summaryChanged).toBe(true);
    expect(record.prepChanged).toBe(true);

    expect(await listPatientNotes(patientId)).toHaveLength(1);
    expect(await listGoalCheckIns(goalId)).toHaveLength(1);
    expect((await getPatientInstruction(patientId))?.body).toBe(
      "Une marche de vingt minutes après le dîner.",
    );
    expect((await getPatientSummary(patientId))?.body).toBe(
      "Contexte : fatigue chronique depuis le printemps.",
    );
    expect(unwrapOk(await getPatient(patientId)).nextConsultationPrep).toBe(
      "Revoir le petit-déjeuner.",
    );
  });

  it("dates each check-in with the consultation, not with today", async () => {
    await recordConsultation(patientId, {
      note: { occurredAt: "2026-09-10", body: "Séance de rattrapage." },
      checkIns: [{ goalId, measure: "6/10" }],
    });

    const checkIns = await listGoalCheckIns(goalId);
    expect(checkIns[0].checkedOn).toBe("2026-09-10");
  });

  it("skips a goal she left blank and reports only what changed", async () => {
    const record = unwrapOk(
      await recordConsultation(patientId, {
        note: { occurredAt: "2026-09-17", body: "Rien de neuf." },
        checkIns: [{ goalId, direction: "", measure: "", note: "" }],
        instruction: "",
        summary: "",
        nextConsultationPrep: "",
      }),
    );

    expect(record.checkIns).toHaveLength(0);
    expect(record.instructionChanged).toBe(false);
    expect(record.summaryChanged).toBe(false);
    expect(record.prepChanged).toBe(false);
    expect(await listGoalCheckIns(goalId)).toHaveLength(0);
    expect(describeConsultation(record)).toBe("note");
  });

  it("re-saving the same consigne and the same résumé changes nothing", async () => {
    await recordConsultation(patientId, {
      note: { occurredAt: "2026-09-01", body: "Première." },
      instruction: "Une marche après le dîner.",
      summary: "Fatigue chronique.",
    });

    const second = unwrapOk(
      await recordConsultation(patientId, {
        note: { occurredAt: "2026-09-17", body: "Deuxième." },
        instruction: "Une marche après le dîner.",
        summary: "Fatigue chronique.",
      }),
    );

    expect(second.instructionChanged).toBe(false);
    expect(second.summaryChanged).toBe(false);
  });

  it("refuses a note with neither a title nor a body, and writes nothing", async () => {
    const result = await recordConsultation(patientId, {
      note: { occurredAt: "2026-09-17" },
      checkIns: [{ goalId, measure: "7/10" }],
      instruction: "Une marche après le dîner.",
    });

    expect(result.ok).toBe(false);
    expect(await listPatientNotes(patientId)).toHaveLength(0);
    expect(await listGoalCheckIns(goalId)).toHaveLength(0);
    expect(await getPatientInstruction(patientId)).toBeNull();
  });

  /**
   * The atomicity claim itself: the note is written first and the check-in
   * fails, so a save that did not roll back would leave the note behind.
   */
  it("rolls the note back when a later write fails", async () => {
    const result = await recordConsultation(patientId, {
      note: { occurredAt: "2026-09-17", body: "Le sommeil s'améliore." },
      checkIns: [
        { goalId, measure: "7/10" },
        { goalId: "00000000-0000-4000-8000-000000000000", measure: "3/10" },
      ],
      instruction: "Une marche après le dîner.",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_found");
    }
    expect(await listPatientNotes(patientId)).toHaveLength(0);
    expect(await listGoalCheckIns(goalId)).toHaveLength(0);
    expect(await getPatientInstruction(patientId)).toBeNull();
  });

  it("refuses a check-in on a goal that is not this patient's, and writes nothing", async () => {
    const otherPatient = unwrapOk(await createPatient({ pseudonym: "Alix" }));
    const otherGoal = unwrapOk(
      await addPatientGoal(otherPatient.id, { title: "Bouger plus" }),
    );

    const result = await recordConsultation(patientId, {
      note: { occurredAt: "2026-09-17", body: "Le sommeil s'améliore." },
      checkIns: [{ goalId: otherGoal.id, measure: "9/10" }],
    });

    expect(result.ok).toBe(false);
    expect(await listPatientNotes(patientId)).toHaveLength(0);
    expect(await listGoalCheckIns(otherGoal.id)).toHaveLength(0);
  });

  it("does not touch a field the form did not send", async () => {
    await recordConsultation(patientId, {
      note: { occurredAt: "2026-09-01", body: "Première." },
      instruction: "Une marche après le dîner.",
      summary: "Fatigue chronique.",
      nextConsultationPrep: "Revoir le petit-déjeuner.",
    });

    await recordConsultation(patientId, {
      note: { occurredAt: "2026-09-17", body: "Deuxième." },
    });

    expect((await getPatientInstruction(patientId))?.body).toBe(
      "Une marche après le dîner.",
    );
    expect((await getPatientSummary(patientId))?.body).toBe(
      "Fatigue chronique.",
    );
    expect(unwrapOk(await getPatient(patientId)).nextConsultationPrep).toBe(
      "Revoir le petit-déjeuner.",
    );
  });

  it("names every changed field in the audit detail", async () => {
    const record = unwrapOk(
      await recordConsultation(patientId, {
        note: { occurredAt: "2026-09-17", body: "Deuxième." },
        checkIns: [{ goalId, direction: "better" }],
        instruction: "Une marche après le dîner.",
        summary: "Fatigue chronique.",
        nextConsultationPrep: "Revoir le petit-déjeuner.",
      }),
    );

    expect(describeConsultation(record)).toBe(
      "note, 1 check-in(s), instruction, summary, next consultation prep",
    );
  });
});
