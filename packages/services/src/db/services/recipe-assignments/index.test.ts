import { beforeAll, describe, expect, it } from "vitest";
import type { Id } from "../../../types";
import {
  registerDatabase,
  type Collection,
  type DatabaseClient,
} from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import { createPatient } from "../patients";
import { createRecipe, listRecipes } from "../recipes";
import {
  archiveRecipeAssignment,
  assignRecipes,
  createAndAssignRecipe,
  duplicateAndAssignRecipe,
  listArchivedPatientRecipes,
  listPatientRecipes,
  removeRecipeAssignment,
  updateRecipeAssignment,
} from "./index";

let patientId: string;
let otherPatientId: string;
let sardines: string;
let dahl: string;

/**
 * The collection whose next insert throws, or `null` for none.
 *
 * The gestures at the bottom of this file write `recipes` and
 * `patient_recipe_assignments` as one unit, and the only way to observe that
 * the unit holds is to fail it between the two writes. Validation refusals
 * cannot: they land before anything is written, so they would pass just as
 * well against the pass-through `transaction()` this adapter used to have.
 */
let failInsertInto: string | null = null;

/**
 * The memory client with that failure spliced in — including the client handed
 * to a `transaction()` callback, because that is the one these gestures write
 * through. The rollback itself is the harness's, untouched.
 */
const withInjectedFailure = (base: DatabaseClient): DatabaseClient => ({
  driver: base.driver,
  close: base.close,
  transaction: (fn) => base.transaction(() => fn(withInjectedFailure(base))),
  collection: <T extends { id: Id }>(name: string): Collection<T> => {
    const inner = base.collection<T>(name);
    return {
      ...inner,
      insert: async (doc) => {
        if (failInsertInto === name) {
          throw new Error("injected write failure");
        }
        return inner.insert(doc);
      },
    };
  },
});

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
  registerDatabase(withInjectedFailure(createMemoryDatabase()));
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
    const result = await assignRecipes(patientId, [sardines], {
      note: "Pour tes oméga-3, et tu aimes déjà ça",
      assignedOn: "2026-09-01",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].note).toBe("Pour tes oméga-3, et tu aimes déjà ça");
      expect(result.data[0].assignedOn).toBe("2026-09-01");
      expect(result.data[0].archivedAt).toBeNull();
    }
  });

  it("joins the recipe, because nothing renders an assignment alone", async () => {
    const [first] = await listPatientRecipes(patientId);
    expect(first.recipe.title).toBe("Tartine de sardines");
    expect(first.recipe.body).not.toBe("");
  });

  it("defaults the note to empty and caps it at a note's length", async () => {
    const bare = await assignRecipes(otherPatientId, [sardines], {
      assignedOn: "2026-09-01",
    });
    expect(bare.ok).toBe(true);
    if (bare.ok) {
      expect(bare.data[0].note).toBe("");
    }

    const wordy = await assignRecipes(otherPatientId, [dahl], {
      note: "n".repeat(501),
      assignedOn: "2026-09-01",
    });
    expect(wordy.ok).toBe(false);
  });

  it("requires a valid date", async () => {
    expect(
      (await assignRecipes(patientId, [dahl], { assignedOn: "le 1er" })).ok,
    ).toBe(false);
    expect(
      (await assignRecipes(patientId, [dahl], { assignedOn: "2026-13-45" })).ok,
    ).toBe(false);
  });

  it("refuses a second active assignment of the same recipe", async () => {
    const again = await assignRecipes(patientId, [sardines], {
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
    const again = await assignRecipes(patientId, [sardines], {
      note: "On la reprend cette semaine",
      assignedOn: "2026-10-06",
    });
    expect(again.ok).toBe(true);
    expect(await held(patientId)).toEqual(["Tartine de sardines"]);
    // The archived giving is still there: two rows, two dates, one recipe.
    expect(await listArchivedPatientRecipes(patientId)).toHaveLength(1);
  });

  it("orders the current set newest giving first", async () => {
    const older = await assignRecipes(patientId, [dahl], {
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
    const noPatient = await assignRecipes(missing, [sardines], {
      assignedOn: "2026-09-01",
    });
    expect(noPatient.ok).toBe(false);

    const noRecipe = await assignRecipes(patientId, [missing], {
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

describe("giving several recipes at once", () => {
  it("writes one row per recipe from a single note and date", async () => {
    const claire = await createPatient({ pseudonym: "Inès" });
    if (!claire.ok) {
      throw new Error("patient not created");
    }
    const soup = await recipeNamed("Soupe de courge");
    const bowl = await recipeNamed("Bowl de sarrasin");

    const result = await assignRecipes(claire.data.id, [soup, bowl], {
      note: "Pour la semaine",
      assignedOn: "2026-09-15",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(2);
      expect(result.data.every((row) => row.note === "Pour la semaine")).toBe(
        true,
      );
    }
    expect(await held(claire.data.id)).toEqual([
      "Soupe de courge",
      "Bowl de sarrasin",
    ]);
  });

  it("counts a recipe chosen twice in one selection once", async () => {
    const patient = await createPatient({ pseudonym: "Théo" });
    const soup = await recipeNamed("Velouté de panais");
    if (!patient.ok) {
      throw new Error("patient not created");
    }
    const result = await assignRecipes(patient.data.id, [soup, soup], {
      assignedOn: "2026-09-15",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
    }
  });

  it("refuses the whole batch when one is already held, and names it", async () => {
    const patient = await createPatient({ pseudonym: "Nora" });
    const kept = await recipeNamed("Galette de sarrasin");
    const fresh = await recipeNamed("Compote sans sucre");
    if (!patient.ok) {
      throw new Error("patient not created");
    }
    await assignRecipes(patient.data.id, [kept], {
      assignedOn: "2026-09-01",
    });

    const again = await assignRecipes(patient.data.id, [fresh, kept], {
      assignedOn: "2026-09-08",
    });
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe("conflict");
      expect(again.message).toContain("Galette de sarrasin");
    }
    // Nothing of the batch landed — the fresh one included.
    expect(await held(patient.data.id)).toEqual(["Galette de sarrasin"]);
  });

  it("refuses an empty selection and an unknown recipe without writing", async () => {
    const patient = await createPatient({ pseudonym: "Yann" });
    if (!patient.ok) {
      throw new Error("patient not created");
    }
    expect(
      (await assignRecipes(patient.data.id, [], { assignedOn: "2026-09-01" }))
        .ok,
    ).toBe(false);

    const good = await recipeNamed("Pain perdu");
    const missing = "00000000-0000-4000-8000-000000000000";
    const mixed = await assignRecipes(patient.data.id, [good, missing], {
      assignedOn: "2026-09-01",
    });
    expect(mixed.ok).toBe(false);
    expect(await held(patient.data.id)).toEqual([]);
  });
});

describe("writing a recipe and giving it in one save", () => {
  it("creates the library row and the assignment together", async () => {
    const patient = await createPatient({ pseudonym: "Sam" });
    if (!patient.ok) {
      throw new Error("patient not created");
    }
    const result = await createAndAssignRecipe(
      patient.data.id,
      { title: "Tartine d'avocat", body: "Du pain, un avocat, du citron." },
      { note: "Pour les matins pressés", assignedOn: "2026-09-16" },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.recipe.title).toBe("Tartine d'avocat");
      // The library keeps it — this is a faster way in, not a private copy.
      expect(result.data.recipe.variantOfId).toBeNull();
      expect(result.data.assignment.note).toBe("Pour les matins pressés");
      expect(
        (await listRecipes()).some(
          (recipe) => recipe.id === result.data.recipe.id,
        ),
      ).toBe(true);
    }
  });

  it("writes neither half when the recipe is invalid", async () => {
    const patient = await createPatient({ pseudonym: "Ava" });
    if (!patient.ok) {
      throw new Error("patient not created");
    }
    const before = (await listRecipes()).length;
    const result = await createAndAssignRecipe(
      patient.data.id,
      { title: "", body: "Sans titre." },
      { assignedOn: "2026-09-16" },
    );
    expect(result.ok).toBe(false);
    expect((await listRecipes()).length).toBe(before);
    expect(await held(patient.data.id)).toEqual([]);
  });

  it("writes neither half when the date is invalid", async () => {
    const patient = await createPatient({ pseudonym: "Iris" });
    if (!patient.ok) {
      throw new Error("patient not created");
    }
    const before = (await listRecipes()).length;
    const result = await createAndAssignRecipe(
      patient.data.id,
      { title: "Riz au lait", body: "Du riz, du lait." },
      { assignedOn: "le 16" },
    );
    expect(result.ok).toBe(false);
    // The order matters: the recipe must not land before the date is refused.
    expect((await listRecipes()).length).toBe(before);
    expect(await held(patient.data.id)).toEqual([]);
  });

  it("leaves no library row when the assignment fails after it", async () => {
    const patient = await createPatient({ pseudonym: "Théo" });
    if (!patient.ok) {
      throw new Error("patient not created");
    }
    const before = (await listRecipes()).length;

    // Not a refusal: the recipe row is written, and the write after it throws.
    // Under the pass-through `transaction()` this seam used to have, that left
    // an orphaned library row — and the library has no delete to take it back.
    failInsertInto = "patient_recipe_assignments";
    const save = createAndAssignRecipe(
      patient.data.id,
      { title: "Soupe de courge", body: "De la courge, du bouillon." },
      { assignedOn: "2026-09-18" },
    );
    await expect(save).rejects.toThrow("injected write failure");
    failInsertInto = null;

    expect((await listRecipes()).length).toBe(before);
    expect(await held(patient.data.id)).toEqual([]);
  });
});

describe("adapting a recipe for one person", () => {
  it("gives the variant and retires the original's giving, for that person only", async () => {
    const mine = await createPatient({ pseudonym: "Lou" });
    const theirs = await createPatient({ pseudonym: "Max" });
    if (!mine.ok || !theirs.ok) {
      throw new Error("patients not created");
    }
    const shared = await recipeNamed("Curry de pois chiches");
    await assignRecipes(mine.data.id, [shared], { assignedOn: "2026-09-01" });
    await assignRecipes(theirs.data.id, [shared], { assignedOn: "2026-09-01" });

    const result = await duplicateAndAssignRecipe(
      mine.data.id,
      shared,
      { title: "Curry de pois chiches sans piment", body: "Sans piment." },
      { note: "Ton estomac n'aime pas le piment", assignedOn: "2026-09-17" },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.recipe.variantOfId).toBe(shared);
      expect(result.data.recipe.title).toBe(
        "Curry de pois chiches sans piment",
      );
    }

    // Hers is the variant now, and the original is in her history.
    expect(await held(mine.data.id)).toEqual([
      "Curry de pois chiches sans piment",
    ]);
    expect(
      (await listArchivedPatientRecipes(mine.data.id)).map(
        (entry) => entry.recipe.title,
      ),
    ).toContain("Curry de pois chiches");

    // His is untouched — that is the whole difference from an edit.
    expect(await held(theirs.data.id)).toEqual(["Curry de pois chiches"]);
  });

  it("carries the origin's tags and reports the origin on the card", async () => {
    const patient = await createPatient({ pseudonym: "Zoé" });
    const tagged = await createRecipe({
      title: "Gratin d'hiver",
      body: "Des légumes racines.",
      tags: ["hiver", "végétarien"],
    });
    if (!patient.ok || !tagged.ok) {
      throw new Error("fixture not created");
    }
    const result = await duplicateAndAssignRecipe(
      patient.data.id,
      tagged.data.id,
      {},
      { assignedOn: "2026-09-17" },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect([...result.data.recipe.tags]).toEqual(["hiver", "végétarien"]);
      // Untouched title gets the suffix rather than colliding with the origin.
      expect(result.data.recipe.title).toBe("Gratin d'hiver (variante)");
    }

    const [entry] = await listPatientRecipes(patient.data.id);
    expect(entry.origin?.title).toBe("Gratin d'hiver");
  });

  it("works when the patient does not already hold the original", async () => {
    const patient = await createPatient({ pseudonym: "Élie" });
    const never = await recipeNamed("Houmous maison");
    if (!patient.ok) {
      throw new Error("patient not created");
    }
    const result = await duplicateAndAssignRecipe(
      patient.data.id,
      never,
      {},
      { assignedOn: "2026-09-17" },
    );
    expect(result.ok).toBe(true);
    expect(await held(patient.data.id)).toEqual(["Houmous maison (variante)"]);
    expect(await listArchivedPatientRecipes(patient.data.id)).toHaveLength(0);
  });

  it("reports an unknown patient or recipe rather than throwing", async () => {
    const missing = "00000000-0000-4000-8000-000000000000";
    const patient = await createPatient({ pseudonym: "Bo" });
    const recipe = await recipeNamed("Salade de lentilles");
    if (!patient.ok) {
      throw new Error("patient not created");
    }
    expect(
      (
        await duplicateAndAssignRecipe(
          missing,
          recipe,
          {},
          { assignedOn: "2026-09-17" },
        )
      ).ok,
    ).toBe(false);
    expect(
      (
        await duplicateAndAssignRecipe(
          patient.data.id,
          missing,
          {},
          { assignedOn: "2026-09-17" },
        )
      ).ok,
    ).toBe(false);
  });
});
