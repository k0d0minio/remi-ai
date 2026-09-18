import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import type { MealEntry } from "../../models/meal-entry";
import { createPatient } from "../patients";
import {
  addMealEntry,
  archiveMealEntry,
  countMealEntriesAwaitingFeedback,
  deleteMealEntry,
  getMealEntry,
  listArchivedMealEntries,
  listMealEntries,
  markMealEntryEaten,
  mealEntryOwner,
  updateMealEntry,
} from "./index";

let patientId: string;

// The seam registers once per process and refuses a second adapter, which is
// the rule these tests exist to honour rather than work around.
beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

/**
 * A fresh patient per test, not a fresh database: the journal's assertions are
 * about ordering and counts across a whole list, so one test's entries would
 * otherwise be the next one's noise. Scoping by patient isolates them the same
 * way the service does.
 */
beforeEach(async () => {
  const created = await createPatient({ pseudonym: "Claire" });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  patientId = created.data.id;
});

/** Throws rather than asserting non-null — a missing row is a broken test. */
const unwrapEntry = (
  result: Awaited<ReturnType<typeof addMealEntry>>,
): MealEntry => {
  if (!result.ok) {
    throw new Error(`expected a meal entry, got ${result.message}`);
  }
  return result.data;
};

const log = async (fields: Parameters<typeof addMealEntry>[1]) =>
  unwrapEntry(await addMealEntry(patientId, fields));

describe("meal entries", () => {
  it("records a meal with its slot, comment and learning", async () => {
    const entry = await log({
      eatenOn: "2026-09-01",
      slot: "dejeuner",
      description: "Saumon, riz complet, courgettes",
      patientComment: "J'avais très faim",
      learning: "Aime le saumon",
    });

    expect(entry.slot).toBe("dejeuner");
    expect(entry.description).toBe("Saumon, riz complet, courgettes");
    expect(entry.patientComment).toBe("J'avais très faim");
    expect(entry.learning).toBe("Aime le saumon");
    // The console's form is Morgane transcribing. A patient's own entry comes
    // through the link and says so — `patient-loop/meal-entry`.
    expect(entry.writtenBy).toBe("practitioner");
  });

  it("treats a missing slot as a first-class entry, not an incomplete one", async () => {
    const entry = await log({
      eatenOn: "2026-09-01",
      description: "Une pomme et des amandes",
    });

    expect(entry.slot).toBeNull();
    expect(await listMealEntries(patientId)).toHaveLength(1);
  });

  it("refuses a slot outside the vocabulary", async () => {
    const result = await addMealEntry(patientId, {
      eatenOn: "2026-09-01",
      description: "Un plat",
      // Cast because the point of the test is the runtime guard, not the type.
      slot: "brunch" as never,
    });

    expect(result.ok).toBe(false);
  });

  it("requires a description and a valid date", async () => {
    expect(
      (
        await addMealEntry(patientId, {
          eatenOn: "2026-09-01",
          description: "",
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await addMealEntry(patientId, {
          eatenOn: "hier",
          description: "Un plat",
        })
      ).ok,
    ).toBe(false);
  });

  it("refuses an entry for a patient that does not exist", async () => {
    const result = await addMealEntry("not-a-uuid", {
      eatenOn: "2026-09-01",
      description: "Un plat",
    });

    expect(result.ok).toBe(false);
  });

  it("lists the newest meal first, whatever order it was typed in", async () => {
    await log({ eatenOn: "2026-08-30", description: "Vendredi" });
    await log({ eatenOn: "2026-09-02", description: "Mercredi" });
    await log({ eatenOn: "2026-09-01", description: "Mardi" });

    expect(
      (await listMealEntries(patientId)).map((entry) => entry.description),
    ).toEqual(["Mercredi", "Mardi", "Vendredi"]);
  });

  it("keeps an entry with no feedback listable, and counts it as waiting", async () => {
    const entry = await log({
      eatenOn: "2026-09-01",
      description: "Un plat",
    });

    expect(entry.feedback).toBe("");
    expect(entry.feedbackWrittenAt).toBeNull();
    expect(await listMealEntries(patientId)).toHaveLength(1);
    expect(await countMealEntriesAwaitingFeedback(patientId)).toBe(1);
  });

  it("stamps feedback when it is first written and clears it when emptied", async () => {
    const entry = await log({ eatenOn: "2026-09-01", description: "Un plat" });

    const answered = await updateMealEntry(entry.id, {
      feedback: "Bien pour les légumes. Décale le dessert.",
    });
    expect(answered.ok).toBe(true);
    if (!answered.ok) {
      return;
    }
    expect(answered.data.feedbackWrittenAt).not.toBeNull();
    expect(await countMealEntriesAwaitingFeedback(patientId)).toBe(0);

    const cleared = await updateMealEntry(entry.id, { feedback: "" });
    expect(cleared.ok).toBe(true);
    if (!cleared.ok) {
      return;
    }
    expect(cleared.data.feedback).toBe("");
    expect(cleared.data.feedbackWrittenAt).toBeNull();
    expect(await countMealEntriesAwaitingFeedback(patientId)).toBe(1);
  });

  it("keeps the first-answered moment when feedback is edited", async () => {
    const entry = await log({ eatenOn: "2026-09-01", description: "Un plat" });
    const first = await updateMealEntry(entry.id, { feedback: "Bien." });
    if (!first.ok) {
      throw new Error("feedback not written");
    }

    const edited = await updateMealEntry(entry.id, {
      feedback: "Bien, et pense à l'eau.",
    });
    expect(edited.ok).toBe(true);
    if (!edited.ok) {
      return;
    }
    expect(edited.data.feedbackWrittenAt?.getTime()).toBe(
      first.data.feedbackWrittenAt?.getTime(),
    );
  });

  it("accepts feedback written at the same time as the entry", async () => {
    const entry = await log({
      eatenOn: "2026-09-01",
      description: "Un plat",
      feedback: "Parfait comme ça.",
    });

    expect(entry.feedbackWrittenAt).not.toBeNull();
    expect(await countMealEntriesAwaitingFeedback(patientId)).toBe(0);
  });

  it("archives out of the journal and restores back into it", async () => {
    const entry = await log({ eatenOn: "2026-09-01", description: "Un plat" });

    await archiveMealEntry(entry.id, true);
    expect(await listMealEntries(patientId)).toHaveLength(0);
    expect(await listArchivedMealEntries(patientId)).toHaveLength(1);
    expect(await countMealEntriesAwaitingFeedback(patientId)).toBe(0);

    await archiveMealEntry(entry.id, false);
    expect(await listMealEntries(patientId)).toHaveLength(1);
    expect(await listArchivedMealEntries(patientId)).toHaveLength(0);
  });

  it("reads one entry back by id, and refuses an unknown one", async () => {
    const entry = await log({ eatenOn: "2026-09-01", description: "Un plat" });

    expect((await getMealEntry(entry.id)).ok).toBe(true);
    expect((await getMealEntry("not-a-uuid")).ok).toBe(false);
  });

  it("deletes permanently, and refuses an unknown id", async () => {
    const entry = await log({ eatenOn: "2026-09-01", description: "Un plat" });

    expect((await deleteMealEntry(entry.id)).ok).toBe(true);
    expect(await listMealEntries(patientId)).toHaveLength(0);
    expect((await deleteMealEntry(entry.id)).ok).toBe(false);
  });

  it("refuses text beyond the field limits", async () => {
    const entry = await log({ eatenOn: "2026-09-01", description: "Un plat" });

    expect(
      (await updateMealEntry(entry.id, { description: "x".repeat(2001) })).ok,
    ).toBe(false);
    expect(
      (await updateMealEntry(entry.id, { patientComment: "x".repeat(1001) }))
        .ok,
    ).toBe(false);
    expect(
      (await updateMealEntry(entry.id, { feedback: "x".repeat(2001) })).ok,
    ).toBe(false);
    expect(
      (await updateMealEntry(entry.id, { learning: "x".repeat(501) })).ok,
    ).toBe(false);
  });
  it("treats an entry with no stated intent as one already eaten", async () => {
    const entry = await log({
      eatenOn: "2026-09-01",
      description: "Un plat",
    });

    expect(entry.intent).toBe("eaten");
  });

  it("records a meal the patient has not eaten yet", async () => {
    const entry = await log({
      eatenOn: "2026-09-01",
      description: "Spaghetti sauce tomate",
      intent: "planned",
    });

    expect(entry.intent).toBe("planned");
  });

  it("refuses an intent outside the vocabulary", async () => {
    const result = await addMealEntry(patientId, {
      eatenOn: "2026-09-01",
      description: "Un plat",
      // Cast because the point of the test is the runtime guard, not the type.
      intent: "maybe" as never,
    });

    expect(result.ok).toBe(false);
  });

  it("turns a planned meal into an eaten one without touching the rest", async () => {
    const planned = await log({
      eatenOn: "2026-09-01",
      slot: "dejeuner",
      description: "Spaghetti sauce tomate",
      feedback: "Ajoutez des légumes",
      intent: "planned",
    });

    const flipped = await markMealEntryEaten(planned.id);

    expect(flipped.ok).toBe(true);
    if (flipped.ok) {
      expect(flipped.data.intent).toBe("eaten");
      expect(flipped.data.description).toBe("Spaghetti sauce tomate");
      expect(flipped.data.slot).toBe("dejeuner");
      expect(flipped.data.feedback).toBe("Ajoutez des légumes");
      expect(flipped.data.feedbackWrittenAt).toEqual(planned.feedbackWrittenAt);
    }
  });

  it("only moves an intent one way — a meal eaten twice is refused", async () => {
    const planned = await log({
      eatenOn: "2026-09-01",
      description: "Spaghetti sauce tomate",
      intent: "planned",
    });
    expect((await markMealEntryEaten(planned.id)).ok).toBe(true);

    expect((await markMealEntryEaten(planned.id)).ok).toBe(false);
  });

  it("refuses to flip an entry that was never planned, or that does not exist", async () => {
    const eaten = await log({
      eatenOn: "2026-09-01",
      description: "Un plat",
    });

    expect((await markMealEntryEaten(eaten.id)).ok).toBe(false);
    expect((await markMealEntryEaten("not-a-uuid")).ok).toBe(false);
  });

  it("does not let an ordinary edit move the intent", async () => {
    const planned = await log({
      eatenOn: "2026-09-01",
      description: "Spaghetti sauce tomate",
      intent: "planned",
    });

    // No cast: `intent` is a legitimate `MealEntryInput` key — the point is
    // that this path strips it rather than refusing it.
    const updated = await updateMealEntry(planned.id, {
      description: "Spaghetti bolognaise",
      intent: "eaten",
    });

    expect(updated.ok).toBe(true);
    if (updated.ok) {
      expect(updated.data.description).toBe("Spaghetti bolognaise");
      expect(updated.data.intent).toBe("planned");
    }
  });

  it("names the patient an entry belongs to, and nobody for one that does not exist", async () => {
    const entry = await log({
      eatenOn: "2026-09-01",
      description: "Un plat",
    });

    expect(await mealEntryOwner(entry.id)).toBe(patientId);
    expect(await mealEntryOwner("not-a-uuid")).toBeNull();
  });
});
