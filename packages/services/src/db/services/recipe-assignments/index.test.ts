import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import { createPatient } from "../patients";
import { createRecipe } from "../recipes";
import {
  archiveRecipeAssignment,
  assignRecipe,
  listArchivedPatientRecipes,
  listPatientRecipes,
  removeRecipeAssignment,
  updateRecipeAssignment,
} from "./index";

let patientId: string;
let otherPatientId: string;
let sardines: string;
let dahl: string;

const recipeNamed = async (title: string) => {
  const result = await createRecipe({
    title,
    body: "Des ingrédients, des étapes, en prose.",
  });
  if (!result.ok) {
    throw new Error(`recipe "${title}" not created`);
  }
  return result.data.id;
};

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  const claire = await createPatient({ pseudonym: "Claire" });
  const luc = await createPatient({ pseudonym: "Luc" });
  if (!claire.ok || !luc.ok) {
    throw new Error("test patients not created");
  }
  patientId = claire.data.id;
  otherPatientId = luc.data.id;
  sardines = await recipeNamed("Tartine de sardines");
  dahl = await recipeNamed("Dahl de lentilles");
});

const held = async (id: string) =>
  (await listPatientRecipes(id)).map((entry) => entry.recipe.title);

describe("recipes assigned to a patient", () => {
  it("gives a recipe with a personal note and a date", async () => {
    const result = await assignRecipe(patientId, sardines, {
      note: "Pour tes oméga-3, et tu aimes déjà ça",
      assignedOn: "2026-09-01",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.note).toBe("Pour tes oméga-3, et tu aimes déjà ça");
      expect(result.data.assignedOn).toBe("2026-09-01");
      expect(result.data.archivedAt).toBeNull();
    }
  });

  it("joins the recipe, because nothing renders an assignment alone", async () => {
    const [first] = await listPatientRecipes(patientId);
    expect(first.recipe.title).toBe("Tartine de sardines");
    expect(first.recipe.body).not.toBe("");
  });

  it("defaults the note to empty and caps it at a note's length", async () => {
    const bare = await assignRecipe(otherPatientId, sardines, {
      assignedOn: "2026-09-01",
    });
    expect(bare.ok).toBe(true);
    if (bare.ok) {
      expect(bare.data.note).toBe("");
    }

    const wordy = await assignRecipe(otherPatientId, dahl, {
      note: "n".repeat(501),
      assignedOn: "2026-09-01",
    });
    expect(wordy.ok).toBe(false);
  });

  it("requires a valid date", async () => {
    expect(
      (await assignRecipe(patientId, dahl, { assignedOn: "le 1er" })).ok,
    ).toBe(false);
    expect(
      (await assignRecipe(patientId, dahl, { assignedOn: "2026-13-45" })).ok,
    ).toBe(false);
  });

  it("refuses a second active assignment of the same recipe", async () => {
    const again = await assignRecipe(patientId, sardines, {
      assignedOn: "2026-09-08",
    });
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe("conflict");
    }
  });

  it("archives what rotates out and keeps the dated row", async () => {
    const [current] = await listPatientRecipes(patientId);
    const archived = await archiveRecipeAssignment(current.assignment.id, true);
    expect(archived.ok).toBe(true);
    expect(await held(patientId)).toEqual([]);
    expect(
      (await listArchivedPatientRecipes(patientId)).map(
        (entry) => entry.recipe.title,
      ),
    ).toEqual(["Tartine de sardines"]);
  });

  it("allows the same recipe again later — that repetition is the trail", async () => {
    const again = await assignRecipe(patientId, sardines, {
      note: "On la reprend cette semaine",
      assignedOn: "2026-10-06",
    });
    expect(again.ok).toBe(true);
    expect(await held(patientId)).toEqual(["Tartine de sardines"]);
    // The archived giving is still there: two rows, two dates, one recipe.
    expect(await listArchivedPatientRecipes(patientId)).toHaveLength(1);
  });

  it("orders the current set newest giving first", async () => {
    const older = await assignRecipe(patientId, dahl, {
      assignedOn: "2026-09-29",
    });
    expect(older.ok).toBe(true);
    expect(await held(patientId)).toEqual([
      "Tartine de sardines",
      "Dahl de lentilles",
    ]);
  });

  it("restores an archived giving to the current set", async () => {
    const [archived] = await listArchivedPatientRecipes(patientId);
    // Restoring a recipe the patient holds again would be two active rows for
    // one recipe, so this run archives the newer one first.
    const current = (await listPatientRecipes(patientId)).find(
      (entry) => entry.recipe.title === "Tartine de sardines",
    );
    if (!current) {
      throw new Error("expected the sardines to be held");
    }
    await archiveRecipeAssignment(current.assignment.id, true);

    const restored = await archiveRecipeAssignment(
      archived.assignment.id,
      false,
    );
    expect(restored.ok).toBe(true);
    expect(await held(patientId)).toContain("Tartine de sardines");
  });

  it("edits the note and the date without touching the recipe", async () => {
    const [entry] = await listPatientRecipes(patientId);
    const updated = await updateRecipeAssignment(entry.assignment.id, {
      note: "Version revue",
      assignedOn: "2026-10-13",
    });
    expect(updated.ok).toBe(true);
    if (updated.ok) {
      expect(updated.data.note).toBe("Version revue");
      expect(updated.data.assignedOn).toBe("2026-10-13");
      expect(updated.data.recipeId).toBe(entry.assignment.recipeId);
    }
  });

  it("removes only its own row", async () => {
    const before = await listPatientRecipes(patientId);
    const removed = await removeRecipeAssignment(before[0].assignment.id);
    expect(removed.ok).toBe(true);

    const after = await listPatientRecipes(patientId);
    expect(after).toHaveLength(before.length - 1);
    // The other patient's giving of the same recipe is untouched.
    expect(await held(otherPatientId)).toContain("Tartine de sardines");
  });

  it("reports an unknown patient, recipe or assignment rather than throwing", async () => {
    const missing = "00000000-0000-4000-8000-000000000000";
    const noPatient = await assignRecipe(missing, sardines, {
      assignedOn: "2026-09-01",
    });
    expect(noPatient.ok).toBe(false);

    const noRecipe = await assignRecipe(patientId, missing, {
      assignedOn: "2026-09-01",
    });
    expect(noRecipe.ok).toBe(false);
    if (!noRecipe.ok) {
      expect(noRecipe.error).toBe("not_found");
    }

    expect((await archiveRecipeAssignment(missing, true)).ok).toBe(false);
    expect((await removeRecipeAssignment(missing)).ok).toBe(false);
  });
});
