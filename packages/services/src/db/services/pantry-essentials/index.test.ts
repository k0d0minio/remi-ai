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
