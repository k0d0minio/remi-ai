import { beforeAll, describe, expect, it } from "vitest";

import type { GateFood, PatientSafetyData } from "../../ai/compatibility";
import { registerDatabase } from "../../db/client";
import { patientActor, systemActor } from "../../db/services/access";
import { createPatient } from "../../db/services/patients";
import { assignRecipes } from "../../db/services/recipe-assignments";
import { createRecipe } from "../../db/services/recipes";
import {
  createMemoryDatabase,
  testPractitionerId,
} from "../../db/test-helpers";
import type { StructuredRecipe } from "../../shared/structured-recipe";
import {
  assignedCandidate,
  gatedRecipeCard,
  gatedRecipeList,
  generatedCandidate,
  getPatientRecipeCard,
  listPatientRecipeCards,
  type PatientRecipeCandidate,
} from "./patient-recipes";

const TODAY = "2026-11-20";
const ID = "11111111-1111-4111-8111-111111111111";

/** A patient who answered each question and declared no exclusion. */
const noExclusion: PatientSafetyData = {
  allergens: [],
  noKnownAllergies: true,
  noKnownIntolerances: true,
  celiacDisease: false,
  diet: "none",
  evictions: [],
};

const mustardAllergy: PatientSafetyData = {
  ...noExclusion,
  noKnownAllergies: false,
  allergens: [
    { kind: "allergy", key: "mustard", subKey: null, otherText: null },
  ],
};

const contentWith = (...names: string[]): StructuredRecipe => ({
  description: "Une salade croquante.",
  prepMinutes: 10,
  cookMinutes: null,
  portions: 2,
  meals: ["lunch"],
  seasons: [],
  ingredients: names.map((name) => ({
    quantity: 1,
    unit: null,
    name,
    note: "",
    foodCode: null,
  })),
  steps: [
    { text: "Râpe la carotte.", temperatureC: null, durationMinutes: null },
  ],
});

const candidate = (
  overrides: Partial<PatientRecipeCandidate> = {},
): PatientRecipeCandidate => ({
  id: ID,
  source: "practitioner",
  title: "Salade de carottes",
  content: contentWith("carotte"),
  body: "",
  justification: "Pour tes fibres",
  ...overrides,
});

describe("gatedRecipeCard", () => {
  it("gives the card of a recipe that the gate confirms", () => {
    expect(gatedRecipeCard(candidate(), noExclusion, TODAY)).toEqual({
      id: ID,
      source: "practitioner",
      title: "Salade de carottes",
      content: contentWith("carotte"),
      amounts: ["1"],
      justification: "Pour tes fibres",
    });
  });

  it("gives null for a recipe with an excluded food", () => {
    const recipe = candidate({
      content: contentWith("carotte", "moutarde de Dijon"),
    });
    expect(gatedRecipeCard(recipe, mustardAllergy, TODAY)).toBeNull();
    // The same recipe is shown to a patient with no exclusion.
    expect(gatedRecipeCard(recipe, noExclusion, TODAY)).not.toBeNull();
  });

  it("gives null for an ingredient that the lexicon does not know", () => {
    expect(
      gatedRecipeCard(
        candidate({ content: contentWith("carotte", "zzqxv") }),
        noExclusion,
        TODAY,
      ),
    ).toBeNull();
  });

  it("gives null when the patient gave no answer on allergies", () => {
    expect(
      gatedRecipeCard(
        candidate(),
        { ...noExclusion, noKnownAllergies: null },
        TODAY,
      ),
    ).toBeNull();
  });

  it("gives null for a recipe with no structured content", () => {
    expect(
      gatedRecipeCard(
        candidate({ content: null, body: "Râper une carotte." }),
        noExclusion,
        TODAY,
      ),
    ).toBeNull();
  });
});

describe("gatedRecipeCard with CIQUAL foods (REM-192)", () => {
  const CODE = "22000";

  const withFood = (name: string, grams: number): StructuredRecipe => ({
    ...contentWith(name),
    ingredients: [
      { quantity: 2, unit: null, name, note: "", foodCode: CODE, grams },
    ],
  });

  const gateFood = (overrides: Partial<GateFood> = {}): GateFood => ({
    code: CODE,
    name: "Oeuf, cru",
    status: "confirmed",
    cookable: true,
    contains: ["eggs"],
    mayContain: [],
    lexiconId: null,
    ...overrides,
  });

  const eggUnits = {
    densityGPerMl: null,
    units: [{ one: "œuf", many: "œufs", grams: 55 }],
  };

  const eggAllergy: PatientSafetyData = {
    ...noExclusion,
    noKnownAllergies: false,
    allergens: [
      { kind: "allergy", key: "eggs", subKey: null, otherText: null },
    ],
  };

  it("writes the quantity in the confirmed kitchen unit of the food", () => {
    const card = gatedRecipeCard(
      candidate({ content: withFood("carotte", 110) }),
      noExclusion,
      TODAY,
      { gate: new Map(), units: new Map([[CODE, eggUnits]]) },
    );
    expect(card?.amounts).toEqual(["2 œufs"]);
  });

  it("writes grams when the food has no confirmed unit", () => {
    const card = gatedRecipeCard(
      candidate({ content: withFood("carotte", 110) }),
      noExclusion,
      TODAY,
    );
    expect(card?.amounts).toEqual(["110 g"]);
  });

  it("hides a recipe whose code has no confirmed record and whose name is unknown", () => {
    for (const status of ["proposed", "none"] as const) {
      expect(
        gatedRecipeCard(
          candidate({ content: withFood("zzqxv", 110) }),
          noExclusion,
          TODAY,
          { gate: new Map([[CODE, gateFood({ status })]]), units: new Map() },
        ),
      ).toBeNull();
    }
  });

  it("hides an unknown name with a confirmed record too", () => {
    expect(
      gatedRecipeCard(
        candidate({ content: withFood("zzqxv", 110) }),
        noExclusion,
        TODAY,
        { gate: new Map([[CODE, gateFood()]]), units: new Map() },
      ),
    ).toBeNull();
  });

  it("hides a recipe whose confirmed record has a tag that the patient excludes", () => {
    const foods = { gate: new Map([[CODE, gateFood()]]), units: new Map() };
    const recipe = candidate({ content: withFood("carotte", 110) });
    expect(gatedRecipeCard(recipe, eggAllergy, TODAY, foods)).toBeNull();
    expect(gatedRecipeCard(recipe, noExclusion, TODAY, foods)).not.toBeNull();
  });
});

describe("gatedRecipeList", () => {
  it("keeps the order, and counts the recipes that the gate refuses", () => {
    const list = gatedRecipeList(
      [
        candidate({ id: "a", title: "Première" }),
        candidate({ id: "b", content: contentWith("moutarde de Dijon") }),
        candidate({ id: "c", title: "Troisième" }),
        candidate({ id: "d", content: null }),
      ],
      mustardAllergy,
      TODAY,
    );
    expect(list.cards.map((card) => card.id)).toEqual(["a", "c"]);
    expect(list.withheld).toBe(2);
  });

  it("gives an empty list for no recipe", () => {
    expect(gatedRecipeList([], noExclusion, TODAY)).toEqual({
      cards: [],
      withheld: 0,
    });
  });
});

describe("the candidates", () => {
  const at = new Date("2026-11-20T10:00:00Z");
  const entity = { id: ID, createdAt: at, updatedAt: at };

  it("reads a generated recipe as a recipe of REMI with no justification", () => {
    expect(
      generatedCandidate({
        ...entity,
        patientId: "p",
        templateId: "t",
        title: "Bol pour toi",
        content: contentWith("carotte"),
        plannedOn: TODAY,
        meal: "lunch",
        generatedAt: at,
      }),
    ).toEqual({
      id: ID,
      source: "remi",
      title: "Bol pour toi",
      content: contentWith("carotte"),
      body: "",
      justification: "",
    });
  });

  const assigned = (content: unknown) =>
    assignedCandidate({
      assignment: {
        ...entity,
        patientId: "p",
        recipeId: "r",
        note: "  Pour tes fibres ",
        assignedOn: TODAY,
        archivedAt: null,
      },
      recipe: {
        id: "r",
        createdAt: at,
        updatedAt: at,
        title: "Salade",
        body: "Râper une carotte.",
        content: content as StructuredRecipe | null,
        verifiedAt: null,
        verifiedById: null,
        verifiedByName: "",
        tags: [],
        archivedAt: null,
        variantOfId: null,
      },
      origin: null,
    });

  it("reads an assignment with the assignment's id and the note", () => {
    expect(assigned(contentWith("carotte"))).toEqual({
      id: ID,
      source: "practitioner",
      title: "Salade",
      content: contentWith("carotte"),
      body: "Râper une carotte.",
      justification: "Pour tes fibres",
    });
  });

  it("reads a stored content that is not a structured recipe as none", () => {
    expect(assigned({ ingredients: "carotte" }).content).toBeNull();
    expect(assigned(null).content).toBeNull();
  });
});

describe("the reads of a patient", () => {
  let patientId = "";
  let otherPatientId = "";
  let assignmentId = "";

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

  beforeAll(async () => {
    registerDatabase(createMemoryDatabase());
    patientId = await newPatient("Claire");
    otherPatientId = await newPatient("Luc");
    const recipe = await createRecipe({
      title: "Salade de carottes",
      content: contentWith("carotte"),
    });
    if (!recipe.ok) {
      throw new Error("test recipe not created");
    }
    const given = await assignRecipes(
      systemActor,
      patientId,
      [recipe.data.id],
      {
        assignedOn: TODAY,
      },
    );
    if (!given.ok || !given.data[0]) {
      throw new Error("test assignment not created");
    }
    assignmentId = given.data[0].id;
  });

  it("answers `not_found` for the recipe of another patient", async () => {
    const read = await getPatientRecipeCard(
      patientActor(otherPatientId),
      otherPatientId,
      assignmentId,
    );
    expect(read.ok).toBe(false);
    if (!read.ok) {
      expect(read.error).toBe("not_found");
    }
  });

  it("answers `not_found` for an id that is not a recipe", async () => {
    const actor = patientActor(patientId);
    expect((await getPatientRecipeCard(actor, patientId, "nope")).ok).toBe(
      false,
    );
    expect((await getPatientRecipeCard(actor, patientId, ID)).ok).toBe(false);
  });

  it("refuses a patient actor that reads the file of another patient", async () => {
    const read = await getPatientRecipeCard(
      patientActor(otherPatientId),
      patientId,
      assignmentId,
    );
    expect(read.ok).toBe(false);
    const list = await listPatientRecipeCards(
      patientActor(otherPatientId),
      patientId,
    );
    expect(list.ok).toBe(false);
  });

  it("withholds the patient's own recipe while the safety answers are missing", async () => {
    // A new file has no answer on allergies: the gate confirms nothing.
    const actor = patientActor(patientId);
    const read = await getPatientRecipeCard(actor, patientId, assignmentId);
    expect(read).toEqual({ ok: true, data: { status: "withheld" } });
    const list = await listPatientRecipeCards(actor, patientId);
    expect(list).toEqual({ ok: true, data: { cards: [], withheld: 1 } });
  });
});
