import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase, type DatabaseClient } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import type { PatientRecommendation } from "../../models/patient-recommendation";
import { createPatient } from "../patients";
import {
  addPatientRecommendation,
  archivePatientRecommendation,
  deletePatientRecommendation,
  listArchivedPatientRecommendations,
  listPatientRecommendations,
  movePatientRecommendation,
  savePatientRecommendations,
  updatePatientRecommendation,
} from "./index";

let patientId: string;

/**
 * Updates left before the next one throws, or `null` for none.
 *
 * The only way to observe atomicity is to fail a save part-way, and the only
 * way to fail one deliberately is from underneath. This counts down through
 * the writes a save makes and throws where it lands.
 */
let updatesBeforeFailure: number | null = null;

/**
 * The memory client with that failure spliced in — including the client handed
 * to a `transaction()` callback, because that is the one a batch save writes
 * through. The rollback itself is the harness's, untouched.
 */
const withInjectedFailure = (base: DatabaseClient): DatabaseClient => ({
  driver: base.driver,
  close: base.close,
  transaction: (fn) => base.transaction(() => fn(withInjectedFailure(base))),
  collection: (name) => {
    const inner = base.collection(name);
    return {
      ...inner,
      update: async (id, patch) => {
        if (updatesBeforeFailure !== null) {
          if (updatesBeforeFailure === 0) {
            throw new Error("injected write failure");
          }
          updatesBeforeFailure -= 1;
        }
        return inner.update(id, patch);
      },
    };
  },
});

beforeAll(async () => {
  registerDatabase(withInjectedFailure(createMemoryDatabase()));
  const created = await createPatient({ pseudonym: "Claire" });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  patientId = created.data.id;
});

const titles = async (id: string) =>
  (await listPatientRecommendations(id)).map((entry) => entry.title);

/** Throws rather than asserting non-null — a missing row is a broken test. */
const entryTitled = (
  entries: readonly PatientRecommendation[],
  title: string,
): PatientRecommendation => {
  const found = entries.find((entry) => entry.title === title);
  if (!found) {
    throw new Error(`no recommendation titled "${title}"`);
  }
  return found;
};

describe("patient recommendations", () => {
  it("encodes an entry with its category", async () => {
    const result = await addPatientRecommendation(patientId, {
      category: "supplement",
      title: "Omega-3 — 2 g daily",
      detail: "With a meal, for 12 weeks.",
    });
    expect(result.ok).toBe(true);
  });

  it("requires a title", async () => {
    const result = await addPatientRecommendation(patientId, {
      category: "nutrition",
      title: "  ",
    });
    expect(result.ok).toBe(false);
  });

  it("groups by category in the protocol's reading order", async () => {
    await addPatientRecommendation(patientId, {
      category: "nutrition",
      title: "No gluten for 8 weeks",
    });
    // Nutrition precedes supplement in `recommendationCategories`, so the
    // later entry reads first — the list is a protocol, not a log.
    expect(await titles(patientId)).toEqual([
      "No gluten for 8 weeks",
      "Omega-3 — 2 g daily",
    ]);
  });

  it("appends within a category and reorders on request", async () => {
    await addPatientRecommendation(patientId, {
      category: "nutrition",
      title: "Two litres of water",
    });
    await addPatientRecommendation(patientId, {
      category: "nutrition",
      title: "Protein at breakfast",
    });
    expect(await titles(patientId)).toEqual([
      "No gluten for 8 weeks",
      "Two litres of water",
      "Protein at breakfast",
      "Omega-3 — 2 g daily",
    ]);

    const last = entryTitled(
      await listPatientRecommendations(patientId),
      "Protein at breakfast",
    );
    const moved = await movePatientRecommendation(last.id, "up");
    expect(moved.ok).toBe(true);
    expect(await titles(patientId)).toEqual([
      "No gluten for 8 weeks",
      "Protein at breakfast",
      "Two litres of water",
      "Omega-3 — 2 g daily",
    ]);
  });

  it("moving past the end of a category does nothing and is not an error", async () => {
    const listed = await listPatientRecommendations(patientId);
    const first = listed[0];
    const before = await titles(patientId);
    const result = await movePatientRecommendation(first.id, "up");
    expect(result.ok).toBe(true);
    expect(await titles(patientId)).toEqual(before);
  });

  it("appends to the destination when an entry changes category", async () => {
    const entry = entryTitled(
      await listPatientRecommendations(patientId),
      "Protein at breakfast",
    );
    const updated = await updatePatientRecommendation(entry.id, {
      category: "habit",
    });
    expect(updated.ok).toBe(true);
    // Habit sits after nutrition and before supplement in the vocabulary.
    expect(await titles(patientId)).toEqual([
      "No gluten for 8 weeks",
      "Two litres of water",
      "Protein at breakfast",
      "Omega-3 — 2 g daily",
    ]);
  });

  it("archives out of the protocol without losing the row", async () => {
    const entry = entryTitled(
      await listPatientRecommendations(patientId),
      "Two litres of water",
    );
    const archived = await archivePatientRecommendation(entry.id, true);
    expect(archived.ok).toBe(true);
    expect(await titles(patientId)).not.toContain("Two litres of water");

    const history = await listArchivedPatientRecommendations(patientId);
    expect(history.map((item) => item.title)).toContain("Two litres of water");

    const restored = await archivePatientRecommendation(entry.id, false);
    expect(restored.ok).toBe(true);
    expect(await titles(patientId)).toContain("Two litres of water");
  });

  it("updates and deletes an entry", async () => {
    const listed = await listPatientRecommendations(patientId);
    const first = listed[0];
    const updated = await updatePatientRecommendation(first.id, {
      title: "No gluten for 12 weeks",
    });
    expect(updated.ok).toBe(true);

    const deleted = await deletePatientRecommendation(first.id);
    expect(deleted.ok).toBe(true);
    const remaining = await listPatientRecommendations(patientId);
    expect(remaining.some((entry) => entry.id === first.id)).toBe(false);
  });

  it("answers an empty list for a malformed patient id", async () => {
    expect(await listPatientRecommendations("not-a-uuid")).toEqual([]);
    expect(await listArchivedPatientRecommendations("not-a-uuid")).toEqual([]);
  });

  it("treats a malformed entry id as not found", async () => {
    expect((await movePatientRecommendation("not-a-uuid", "up")).ok).toBe(
      false,
    );
    expect((await archivePatientRecommendation("not-a-uuid", true)).ok).toBe(
      false,
    );
    expect((await updatePatientRecommendation("not-a-uuid", {})).ok).toBe(
      false,
    );
    expect((await deletePatientRecommendation("not-a-uuid")).ok).toBe(false);
  });
});

describe("saving the whole protocol at once", () => {
  // Its own patient: this suite asserts on the entire section, so it cannot
  // share the rows the single-row tests above leave behind.
  let sectionPatientId: string;

  beforeAll(async () => {
    const created = await createPatient({ pseudonym: "Margaux" });
    if (!created.ok) {
      throw new Error("test patient not created");
    }
    sectionPatientId = created.data.id;
  });

  it("writes several rows across categories in one call", async () => {
    const saved = await savePatientRecommendations(sectionPatientId, [
      { category: "nutrition", title: "Oméga-3", detail: "2 g au repas" },
      { category: "nutrition", title: "Moins de sucre le matin", detail: "" },
      { category: "habit", title: "Coucher avant 23h", detail: "" },
    ]);

    expect(saved.ok && saved.data).toEqual({
      added: 3,
      updated: 0,
      archived: 0,
      reordered: 0,
    });
    expect(
      (await listPatientRecommendations(sectionPatientId)).map(
        (entry) => entry.title,
      ),
    ).toEqual(["Oméga-3", "Moins de sucre le matin", "Coucher avant 23h"]);
  });

  it("applies an edit, an addition, a removal and a reorder in one save", async () => {
    const before = await listPatientRecommendations(sectionPatientId);
    const omega = entryTitled(before, "Oméga-3");
    const sugar = entryTitled(before, "Moins de sucre le matin");

    const saved = await savePatientRecommendations(sectionPatientId, [
      { id: sugar.id, category: "nutrition", title: sugar.title, detail: "" },
      {
        id: omega.id,
        category: "nutrition",
        title: "Oméga-3",
        detail: "2 g par jour, au repas",
      },
      { category: "nutrition", title: "Magnésium le soir", detail: "" },
    ]);

    // The habit row was not submitted, so it left the protocol.
    expect(saved.ok && saved.data).toEqual({
      added: 1,
      updated: 1,
      archived: 1,
      reordered: 2,
    });

    const after = await listPatientRecommendations(sectionPatientId);
    expect(after.map((entry) => entry.title)).toEqual([
      "Moins de sucre le matin",
      "Oméga-3",
      "Magnésium le soir",
    ]);
    expect(entryTitled(after, "Oméga-3").detail).toBe("2 g par jour, au repas");
  });

  it("archives what it drops rather than deleting it", async () => {
    const archivedTitles = (
      await listArchivedPatientRecommendations(sectionPatientId)
    ).map((entry) => entry.title);

    expect(archivedTitles).toContain("Coucher avant 23h");
  });

  it("refuses the whole save on a bad row, naming which one", async () => {
    const before = await listPatientRecommendations(sectionPatientId);

    const saved = await savePatientRecommendations(sectionPatientId, [
      { category: "nutrition", title: "Bien encodée", detail: "" },
      { category: "nutrition", title: "   ", detail: "" },
    ]);

    expect(saved.ok).toBe(false);
    expect(!saved.ok && saved.error).toBe("invalid_input");
    expect(!saved.ok && saved.message).toContain("row 2");
    // Nothing was written: the good row above it did not land either.
    expect(await listPatientRecommendations(sectionPatientId)).toEqual(before);
  });

  it("does nothing when the section comes back unchanged", async () => {
    const before = await listPatientRecommendations(sectionPatientId);

    const saved = await savePatientRecommendations(
      sectionPatientId,
      before.map((entry) => ({
        id: entry.id,
        category: entry.category,
        title: entry.title,
        detail: entry.detail,
      })),
    );

    expect(saved.ok && saved.data).toEqual({
      added: 0,
      updated: 0,
      archived: 0,
      reordered: 0,
    });
    expect(await listPatientRecommendations(sectionPatientId)).toEqual(before);
  });

  it("keeps a row stored under the retired supplement category submittable", async () => {
    const created = await createPatient({ pseudonym: "Inès" });
    if (!created.ok) {
      throw new Error("test patient not created");
    }
    const legacy = await addPatientRecommendation(created.data.id, {
      category: "supplement",
      title: "Vitamine D",
      detail: "",
    });
    if (!legacy.ok) {
      throw new Error("legacy recommendation not created");
    }

    const saved = await savePatientRecommendations(created.data.id, [
      {
        id: legacy.data.id,
        category: "supplement",
        title: "Vitamine D",
        detail: "2 000 UI",
      },
    ]);

    expect(saved.ok && saved.data.updated).toBe(1);
    const after = await listPatientRecommendations(created.data.id);
    expect(after[0].category).toBe("supplement");
    expect(after[0].detail).toBe("2 000 UI");
  });

  it("empties the protocol when nothing is submitted", async () => {
    const created = await createPatient({ pseudonym: "Yaelle" });
    if (!created.ok) {
      throw new Error("test patient not created");
    }
    await savePatientRecommendations(created.data.id, [
      { category: "nutrition", title: "À retirer", detail: "" },
    ]);

    const saved = await savePatientRecommendations(created.data.id, []);

    expect(saved.ok && saved.data.archived).toBe(1);
    expect(await listPatientRecommendations(created.data.id)).toEqual([]);
    expect(
      await listArchivedPatientRecommendations(created.data.id),
    ).toHaveLength(1);
  });

  it("treats a malformed patient id as not found", async () => {
    expect((await savePatientRecommendations("not-a-uuid", [])).ok).toBe(false);
  });

  it("leaves the section untouched when a write fails part-way", async () => {
    const created = await createPatient({ pseudonym: "Solène" });
    if (!created.ok) {
      throw new Error("test patient not created");
    }
    await savePatientRecommendations(created.data.id, [
      { category: "nutrition", title: "Première", detail: "" },
      { category: "nutrition", title: "Deuxième", detail: "" },
    ]);
    const before = await listPatientRecommendations(created.data.id);

    // Two rows renamed and one added: the failure lands on the second update,
    // after the first has already been written.
    updatesBeforeFailure = 1;
    const save = savePatientRecommendations(
      created.data.id,
      before
        .map((entry) => ({
          id: entry.id,
          category: entry.category,
          title: `${entry.title} modifiée`,
          detail: entry.detail,
        }))
        .concat([
          { id: "", category: "nutrition", title: "Ajoutée", detail: "" },
        ]),
    );

    await expect(save).rejects.toThrow("injected write failure");
    updatesBeforeFailure = null;

    // The first rename did happen before the throw; the transaction undid it.
    expect(await listPatientRecommendations(created.data.id)).toEqual(before);
  });
});
