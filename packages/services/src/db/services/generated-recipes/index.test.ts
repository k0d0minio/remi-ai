import { beforeAll, describe, expect, it } from "vitest";
import type { StructuredRecipe } from "../../../shared/structured-recipe";
import { getDatabase, registerDatabase } from "../../client";
import {
  createMemoryDatabase,
  practitionerActor,
  testPractitionerId,
} from "../../test-helpers";
import { operatorActor, patientActor, systemActor } from "../access";
import { createPatient } from "../patients";
import {
  archiveRecipe,
  createRecipe,
  setRecipeVerified,
  updateRecipe,
} from "../recipes";
import {
  getGeneratedRecipe,
  listGeneratedRecipes,
  writeGeneratedRecipes,
  type GeneratedRecipeInput,
} from "./index";

const morgane = {
  id: testPractitionerId,
  email: "morgane@example.test",
  name: "Morgane",
};

const holder = practitionerActor();

const otherPractitioner = operatorActor({
  id: "00000000-0000-4000-8000-000000000002",
  role: "practitioner",
});

const content: StructuredRecipe = {
  description: "Un bol complet.",
  prepMinutes: 10,
  cookMinutes: null,
  portions: 1,
  meals: ["lunch", "dinner"],
  seasons: [],
  ingredients: [
    { quantity: 80, unit: "g", name: "quinoa", note: "", foodCode: null },
  ],
  steps: [
    { text: "Cuire le quinoa.", temperatureC: null, durationMinutes: null },
  ],
};

let templateId = "";
let unverifiedId = "";
let patientId = "";
let otherPatientId = "";

const newPatient = async (pseudonym: string) => {
  const created = await createPatient(systemActor, {
    practitionerId: testPractitionerId,
    pseudonym,
  });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  return created.data.id;
};

const newTemplate = async (title: string, verified: boolean) => {
  const created = await createRecipe({ title, content });
  if (!created.ok) {
    throw new Error("test template not created");
  }
  if (verified) {
    await setRecipeVerified(created.data.id, morgane, true);
  }
  return created.data.id;
};

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  templateId = await newTemplate("Bol de quinoa", true);
  unverifiedId = await newTemplate("Bol non vérifié", false);
  patientId = await newPatient("Claire");
  otherPatientId = await newPatient("Luc");
});

const input = (
  overrides: Partial<GeneratedRecipeInput> = {},
): GeneratedRecipeInput => ({
  templateId,
  title: "Bol de quinoa pour toi",
  content,
  plannedOn: "2026-12-01",
  meal: "lunch",
  gateStatus: "compatible",
  ...overrides,
});

const week = { from: "2026-12-01", to: "2026-12-07" };

describe("writeGeneratedRecipes", () => {
  it("stores a recipe with its template, its day and its meal", async () => {
    const result = await writeGeneratedRecipes(systemActor, patientId, [input()]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const [recipe] = result.data;
      expect(recipe?.patientId).toBe(patientId);
      expect(recipe?.templateId).toBe(templateId);
      expect(recipe?.content).toEqual(content);
      expect(recipe?.plannedOn).toBe("2026-12-01");
      expect(recipe?.meal).toBe("lunch");
      expect(recipe?.generatedAt).toBeInstanceOf(Date);
    }
  });

  it("replaces the recipe of the same day and meal, and keeps the row", async () => {
    const before = await listGeneratedRecipes(holder, patientId, week);
    const result = await writeGeneratedRecipes(systemActor, patientId, [
      input({ title: "Autre bol" }),
    ]);
    const after = await listGeneratedRecipes(holder, patientId, week);
    expect(after).toHaveLength(before.length);
    expect(result.ok && result.data[0]?.id).toBe(before[0]?.id);
    expect(after[0]?.title).toBe("Autre bol");
  });

  it("refuses a recipe that the gate did not confirm, and stores none", async () => {
    for (const gateStatus of ["uncertain", "incompatible"] as const) {
      const result = await writeGeneratedRecipes(systemActor, patientId, [
        input({ plannedOn: "2026-12-02" }),
        input({ plannedOn: "2026-12-03", gateStatus }),
      ]);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe(
          "only a recipe that the gate confirmed is stored",
        );
      }
    }
    const stored = await listGeneratedRecipes(holder, patientId, week);
    expect(stored.map((recipe) => recipe.plannedOn)).toEqual(["2026-12-01"]);
  });

  it("refuses a template that is not verified", async () => {
    const result = await writeGeneratedRecipes(systemActor, patientId, [
      input({ templateId: unverifiedId, plannedOn: "2026-12-04" }),
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe(
        "a generated recipe starts from a verified template",
      );
    }
  });

  it("refuses a template that lost its mark or left the library", async () => {
    const edited = await newTemplate("Modèle bientôt modifié", true);
    await updateRecipe(edited, { title: "Modèle modifié" }, morgane);
    const archived = await newTemplate("Modèle bientôt archivé", true);
    await archiveRecipe(archived, true);
    for (const id of [edited, archived]) {
      const result = await writeGeneratedRecipes(systemActor, patientId, [
        input({ templateId: id, plannedOn: "2026-12-04" }),
      ]);
      expect(result.ok).toBe(false);
    }
  });

  it("refuses a content that the schema refuses", async () => {
    const result = await writeGeneratedRecipes(systemActor, patientId, [
      input({ plannedOn: "2026-12-04", content: { ...content, steps: [] } }),
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("a recipe needs at least one step");
    }
  });

  it("refuses two recipes for one day and meal in one call", async () => {
    const result = await writeGeneratedRecipes(systemActor, patientId, [
      input({ plannedOn: "2026-12-05" }),
      input({ plannedOn: "2026-12-05", title: "Le même créneau" }),
    ]);
    expect(result.ok).toBe(false);
  });

  it("refuses a day that is not a day", async () => {
    const result = await writeGeneratedRecipes(systemActor, patientId, [
      input({ plannedOn: "demain" }),
    ]);
    expect(result.ok).toBe(false);
  });

  it("answers as a missing file to a practitioner who does not hold the file", async () => {
    const result = await writeGeneratedRecipes(otherPractitioner, patientId, [
      input({ plannedOn: "2026-12-06" }),
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_found");
    }
  });

  it("answers as a missing file for a patient that does not exist", async () => {
    const result = await writeGeneratedRecipes(
      systemActor,
      "00000000-0000-4000-8000-00000000dead",
      [input()],
    );
    expect(result.ok).toBe(false);
  });
});

describe("listGeneratedRecipes and getGeneratedRecipe", () => {
  it("lists the days of the range by day, then by meal", async () => {
    await writeGeneratedRecipes(systemActor, patientId, [
      input({ plannedOn: "2026-12-02", meal: "dinner", title: "Soir du 2" }),
      input({ plannedOn: "2026-12-02", meal: "breakfast", title: "Matin du 2" }),
      input({ plannedOn: "2026-12-09", meal: "lunch", title: "Hors semaine" }),
    ]);
    const titles = (await listGeneratedRecipes(holder, patientId, week)).map(
      (recipe) => recipe.title,
    );
    expect(titles).toEqual(["Autre bol", "Matin du 2", "Soir du 2"]);
    const today = await listGeneratedRecipes(holder, patientId, {
      from: "2026-12-02",
      to: "2026-12-02",
    });
    expect(today.map((recipe) => recipe.meal)).toEqual(["breakfast", "dinner"]);
  });

  it("gives the patient its own recipes, and no recipe of another patient", async () => {
    const own = await listGeneratedRecipes(
      patientActor(patientId),
      patientId,
      week,
    );
    expect(own.length).toBeGreaterThan(0);
    expect(
      await listGeneratedRecipes(patientActor(otherPatientId), patientId, week),
    ).toEqual([]);

    const [recipe] = own;
    const id = recipe?.id ?? "";
    const mine = await getGeneratedRecipe(patientActor(patientId), patientId, id);
    expect(mine.ok && mine.data.id).toBe(id);
    // The other patient asks with its own file id: the row is not in that file.
    const theirs = await getGeneratedRecipe(
      patientActor(otherPatientId),
      otherPatientId,
      id,
    );
    expect(theirs.ok).toBe(false);
    // The other patient asks with the file id of the owner: the scope refuses.
    const forged = await getGeneratedRecipe(
      patientActor(otherPatientId),
      patientId,
      id,
    );
    expect(forged.ok).toBe(false);
  });

  it("gives nothing to a practitioner who does not hold the file", async () => {
    expect(
      await listGeneratedRecipes(otherPractitioner, patientId, week),
    ).toEqual([]);
  });

  it("never gives a row whose stored content is not a recipe", async () => {
    const [recipe] = await listGeneratedRecipes(holder, patientId, {
      from: "2026-12-09",
      to: "2026-12-09",
    });
    const id = recipe?.id ?? "";
    await getDatabase()
      .collection<{ id: string; content: unknown }>("patient_recipes")
      .update(id, { content: { steps: "cuire" } });
    expect(
      await listGeneratedRecipes(holder, patientId, {
        from: "2026-12-09",
        to: "2026-12-09",
      }),
    ).toEqual([]);
    expect((await getGeneratedRecipe(holder, patientId, id)).ok).toBe(false);
  });

  it("gives an empty list for a range that is not valid", async () => {
    expect(
      await listGeneratedRecipes(holder, patientId, { from: "hier", to: "demain" }),
    ).toEqual([]);
  });
});
