import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import type { PantryEssential } from "../../models/pantry-essential";
import { createPatient } from "../patients";
import {
  addPantryEssential,
  archivePantryEssential,
  deletePantryEssential,
  listArchivedPantryEssentials,
  listPantryEssentials,
  movePantryEssential,
  savePantryEssentials,
  updatePantryEssential,
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

const items = async (id: string) =>
  (await listPantryEssentials(id)).map((entry) => entry.item);

/** Throws rather than asserting non-null — a missing row is a broken test. */
const entryNamed = (
  entries: readonly PantryEssential[],
  item: string,
): PantryEssential => {
  const found = entries.find((entry) => entry.item === item);
  if (!found) {
    throw new Error(`no pantry essential named "${item}"`);
  }
  return found;
};

describe("pantry essentials", () => {
  it("records an item with its why", async () => {
    const result = await addPantryEssential(patientId, {
      item: "Sardines",
      why: "Oméga-3, et tu aimes ça",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.why).toBe("Oméga-3, et tu aimes ça");
      expect(result.data.archivedAt).toBeNull();
    }
  });

  it("requires an item", async () => {
    const result = await addPantryEssential(patientId, { item: "  " });
    expect(result.ok).toBe(false);
  });

  it("caps the item and the why, so neither becomes a paragraph", async () => {
    const long = await addPantryEssential(patientId, {
      item: "a".repeat(121),
    });
    expect(long.ok).toBe(false);

    const wordy = await addPantryEssential(patientId, {
      item: "Lentilles",
      why: "b".repeat(281),
    });
    expect(wordy.ok).toBe(false);
  });

  it("defaults the why to empty — an item may stand on its own", async () => {
    const result = await addPantryEssential(patientId, { item: "Citrons" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.why).toBe("");
    }
  });

  it("appends past the highest position, in the order she wrote them", async () => {
    expect(await items(patientId)).toEqual(["Sardines", "Citrons"]);
  });

  it("rejects an unknown patient", async () => {
    const result = await addPantryEssential("not-a-uuid", { item: "Avoine" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_found");
    }
  });

  it("edits an item in place without moving it", async () => {
    const sardines = entryNamed(
      await listPantryEssentials(patientId),
      "Sardines",
    );
    const result = await updatePantryEssential(sardines.id, {
      why: "Oméga-3 — une boîte par semaine",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.why).toBe("Oméga-3 — une boîte par semaine");
      expect(result.data.position).toBe(sardines.position);
    }
    expect(await items(patientId)).toEqual(["Sardines", "Citrons"]);
  });

  it("moves an item down and renumbers the run", async () => {
    const sardines = entryNamed(
      await listPantryEssentials(patientId),
      "Sardines",
    );
    const moved = await movePantryEssential(sardines.id, "down");
    expect(moved.ok).toBe(true);
    expect(await items(patientId)).toEqual(["Citrons", "Sardines"]);
    expect(
      (await listPantryEssentials(patientId)).map((entry) => entry.position),
    ).toEqual([0, 1]);
  });

  it("leaves an item at the end of the list where it is", async () => {
    const citrons = entryNamed(
      await listPantryEssentials(patientId),
      "Citrons",
    );
    const moved = await movePantryEssential(citrons.id, "up");
    expect(moved.ok).toBe(true);
    expect(await items(patientId)).toEqual(["Citrons", "Sardines"]);
  });

  it("archives an item off the list without losing the row", async () => {
    const citrons = entryNamed(
      await listPantryEssentials(patientId),
      "Citrons",
    );
    const archived = await archivePantryEssential(citrons.id, true);
    expect(archived.ok).toBe(true);

    expect(await items(patientId)).toEqual(["Sardines"]);
    expect(
      (await listArchivedPantryEssentials(patientId)).map(
        (entry) => entry.item,
      ),
    ).toEqual(["Citrons"]);
  });

  it("restores an archived item to the list", async () => {
    const citrons = entryNamed(
      await listArchivedPantryEssentials(patientId),
      "Citrons",
    );
    const restored = await archivePantryEssential(citrons.id, false);
    expect(restored.ok).toBe(true);
    expect(await listArchivedPantryEssentials(patientId)).toEqual([]);
    expect(await items(patientId)).toEqual(["Citrons", "Sardines"]);
  });

  it("deletes only its own row", async () => {
    const citrons = entryNamed(
      await listPantryEssentials(patientId),
      "Citrons",
    );
    const removed = await deletePantryEssential(citrons.id);
    expect(removed.ok).toBe(true);
    expect(await items(patientId)).toEqual(["Sardines"]);
  });

  it("reports a missing row rather than throwing", async () => {
    const result = await updatePantryEssential(
      "00000000-0000-4000-8000-000000000000",
      { item: "Avoine" },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_found");
    }
  });
});

describe("saving the whole list at once", () => {
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

  it("writes a pasted list of items in one call, in the order given", async () => {
    const saved = await savePantryEssentials(sectionPatientId, [
      { item: "Sardines", why: "oméga-3" },
      { item: "Œufs", why: "" },
      { item: "Épinards", why: "" },
    ]);

    expect(saved.ok && saved.data.added).toBe(3);
    expect(
      (await listPantryEssentials(sectionPatientId)).map((row) => row.item),
    ).toEqual(["Sardines", "Œufs", "Épinards"]);
  });

  it("applies an edit, an addition, a removal and a reorder in one save", async () => {
    const before = await listPantryEssentials(sectionPatientId);

    const saved = await savePantryEssentials(sectionPatientId, [
      { id: before[2].id, item: before[2].item, why: "fer" },
      { id: before[0].id, item: before[0].item, why: before[0].why },
      { item: "Lentilles", why: "" },
    ]);

    expect(saved.ok && saved.data).toEqual({
      added: 1,
      updated: 1,
      archived: 1,
      reordered: 2,
    });
    expect(
      (await listPantryEssentials(sectionPatientId)).map((row) => row.item),
    ).toEqual(["Épinards", "Sardines", "Lentilles"]);
    expect(
      (await listArchivedPantryEssentials(sectionPatientId)).map(
        (row) => row.item,
      ),
    ).toContain("Œufs");
  });

  it("refuses the whole save on a bad row, naming which one", async () => {
    const before = await listPantryEssentials(sectionPatientId);

    const saved = await savePantryEssentials(sectionPatientId, [
      { item: "Amandes", why: "" },
      { item: "  ", why: "" },
    ]);

    expect(!saved.ok && saved.message).toContain("row 2");
    expect(await listPantryEssentials(sectionPatientId)).toEqual(before);
  });

  it("does nothing when the section comes back unchanged", async () => {
    const before = await listPantryEssentials(sectionPatientId);

    const saved = await savePantryEssentials(
      sectionPatientId,
      before.map((row) => ({ id: row.id, item: row.item, why: row.why })),
    );

    expect(saved.ok && saved.data.added).toBe(0);
    expect(await listPantryEssentials(sectionPatientId)).toEqual(before);
  });

  it("treats a malformed patient id as not found", async () => {
    expect((await savePantryEssentials("not-a-uuid", [])).ok).toBe(false);
  });
});
