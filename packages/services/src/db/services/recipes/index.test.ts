import { beforeAll, describe, expect, it } from "vitest";
import {
  structuredRecipeText,
  type StructuredRecipe,
} from "../../../shared/structured-recipe";
import { getDatabase, registerDatabase } from "../../client";
import type { AuditEvent } from "../../models/audit-event";
import { createMemoryDatabase, testPractitionerId } from "../../test-helpers";
import { createPatient } from "../patients";
import { assignRecipes } from "../recipe-assignments";
import {
  archiveRecipe,
  countRecipeAssignments,
  createRecipe,
  duplicateRecipe,
  getRecipe,
  listArchivedRecipes,
  listRecipeTags,
  listRecipes,
  listVerifiedTemplates,
  setRecipeVerified,
  updateRecipe,
} from "./index";
import { systemActor } from "../../services/access";

const body =
  "Une boîte de sardines, du citron, du pain complet. Écraser, tartiner.";

/** Throws rather than asserting — a refused write is a broken test, not a case. */
const created = async (title: string, tags?: readonly string[]) => {
  const result = await createRecipe({ title, body, tags });
  if (!result.ok) {
    throw new Error(`recipe "${title}" not created: ${result.message}`);
  }
  return result.data;
};

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
});

const titles = async (filter?: { tag?: string; search?: string }) =>
  (await listRecipes(filter)).map((recipe) => recipe.title);

describe("the recipe library", () => {
  it("keeps a recipe to a title and prose, with no structure imposed", async () => {
    const recipe = await created("Tartine de sardines");
    expect(recipe.body).toBe(body);
    expect(recipe.tags).toEqual([]);
    expect(recipe.archivedAt).toBeNull();
  });

  it("requires a title and a body", async () => {
    expect((await createRecipe({ title: "  ", body })).ok).toBe(false);
    expect((await createRecipe({ title: "Sans corps", body: "  " })).ok).toBe(
      false,
    );
  });

  it("caps the title and the body", async () => {
    expect((await createRecipe({ title: "a".repeat(141), body })).ok).toBe(
      false,
    );
    expect(
      (await createRecipe({ title: "Trop long", body: "b".repeat(4001) })).ok,
    ).toBe(false);
  });

  it("normalises tags — trimmed, lowercased, de-duplicated", async () => {
    const recipe = await created("Soupe de courge", [
      " Hiver ",
      "hiver",
      "VÉGÉTARIEN",
      "  ",
    ]);
    expect(recipe.tags).toEqual(["hiver", "végétarien"]);
  });

  it("refuses more than six tags, and a tag longer than a tag", async () => {
    const many = await createRecipe({
      title: "Trop étiquetée",
      body,
      tags: ["a", "b", "c", "d", "e", "f", "g"],
    });
    expect(many.ok).toBe(false);

    const long = await createRecipe({
      title: "Étiquette bavarde",
      body,
      tags: ["c".repeat(33)],
    });
    expect(long.ok).toBe(false);
  });

  it("filters on a tag, and reports only the tags in use", async () => {
    expect(await titles({ tag: "hiver" })).toEqual(["Soupe de courge"]);
    expect(await titles({ tag: "été" })).toEqual([]);
    expect(await listRecipeTags()).toEqual(["hiver", "végétarien"]);
  });

  it("searches on the title, case-insensitively", async () => {
    expect(await titles({ search: "courge" })).toEqual(["Soupe de courge"]);
    expect(await titles({ search: "gratin" })).toEqual([]);
  });

  it("archives out of the library and restores back into it", async () => {
    const soup = await created("Velouté de panais", ["hiver"]);

    const archived = await archiveRecipe(soup.id, true);
    expect(archived.ok).toBe(true);
    expect(await titles()).not.toContain("Velouté de panais");
    expect((await listArchivedRecipes()).map((recipe) => recipe.title)).toEqual(
      ["Velouté de panais"],
    );

    const restored = await archiveRecipe(soup.id, false);
    expect(restored.ok).toBe(true);
    expect(await titles()).toContain("Velouté de panais");
    expect(await listArchivedRecipes()).toEqual([]);
  });

  it("edits in place — one recipe, every patient holding it", async () => {
    const recipe = await created("Gratin de courgettes");
    const updated = await updateRecipe(recipe.id, {
      title: "Gratin de courgettes au chèvre",
    });
    expect(updated.ok).toBe(true);

    const fetched = await getRecipe(recipe.id);
    expect(fetched.ok).toBe(true);
    if (fetched.ok) {
      expect(fetched.data.title).toBe("Gratin de courgettes au chèvre");
      // The body is untouched by a title-only edit.
      expect(fetched.data.body).toBe(body);
    }
  });

  it("counts the patients currently holding a recipe", async () => {
    const recipe = await created("Dahl de lentilles");
    const claire = await createPatient(systemActor, {
      practitionerId: testPractitionerId,
      pseudonym: "Claire",
    });
    const luc = await createPatient(systemActor, {
      practitionerId: testPractitionerId,
      pseudonym: "Luc",
    });
    if (!claire.ok || !luc.ok) {
      throw new Error("test patients not created");
    }

    expect(await countRecipeAssignments(recipe.id)).toBe(0);
    await assignRecipes(systemActor, claire.data.id, [recipe.id], {
      assignedOn: "2026-09-01",
    });
    await assignRecipes(systemActor, luc.data.id, [recipe.id], {
      assignedOn: "2026-09-01",
    });
    expect(await countRecipeAssignments(recipe.id)).toBe(2);
  });

  it("reports a missing recipe rather than throwing", async () => {
    const missing = "00000000-0000-4000-8000-000000000000";
    expect((await getRecipe(missing)).ok).toBe(false);
    const updated = await updateRecipe(missing, { title: "Fantôme" });
    expect(updated.ok).toBe(false);
    if (!updated.ok) {
      expect(updated.error).toBe("not_found");
    }
  });
});

describe("duplicating a recipe as a variant", () => {
  it("copies the body and tags, suffixes the title and records the origin", async () => {
    const origin = await created("Gratin de courge", ["Hiver", "végétarien"]);
    const variant = await duplicateRecipe(origin.id);
    expect(variant.ok).toBe(true);
    if (variant.ok) {
      expect(variant.data.title).toBe("Gratin de courge (variante)");
      expect(variant.data.body).toBe(origin.body);
      expect([...variant.data.tags]).toEqual([...origin.tags]);
      expect(variant.data.variantOfId).toBe(origin.id);
      expect(variant.data.archivedAt).toBeNull();
      // A new library row, not a fork — it stands on its own id.
      expect(variant.data.id).not.toBe(origin.id);
    }
  });

  it("takes the adapted title and body when she has already edited them", async () => {
    const origin = await created("Dahl classique");
    const variant = await duplicateRecipe(origin.id, {
      title: "Dahl sans piment",
      body: "Comme le classique, sans piment.",
    });
    expect(variant.ok).toBe(true);
    if (variant.ok) {
      expect(variant.data.title).toBe("Dahl sans piment");
      expect(variant.data.body).toBe("Comme le classique, sans piment.");
      expect(variant.data.variantOfId).toBe(origin.id);
    }
  });

  it("does not stack the suffix when duplicating a variant", async () => {
    const origin = await created("Soupe de poireaux");
    const first = await duplicateRecipe(origin.id);
    if (!first.ok) {
      throw new Error("first variant not created");
    }
    const second = await duplicateRecipe(first.data.id);
    expect(second.ok).toBe(true);
    if (second.ok) {
      expect(second.data.title).toBe("Soupe de poireaux (variante)");
      // The link is to what it was copied from, not to the root.
      expect(second.data.variantOfId).toBe(first.data.id);
    }
  });

  it("leaves the origin's holder count alone", async () => {
    const claire = await createPatient(systemActor, {
      practitionerId: testPractitionerId,
      pseudonym: "Manon",
    });
    if (!claire.ok) {
      throw new Error("patient not created");
    }
    const origin = await created("Quiche aux poireaux");
    await assignRecipes(systemActor, claire.data.id, [origin.id], {
      assignedOn: "2026-09-01",
    });
    expect(await countRecipeAssignments(origin.id)).toBe(1);

    const variant = await duplicateRecipe(origin.id);
    expect(variant.ok).toBe(true);
    // A variant is held by nobody until it is given, and never by proxy.
    expect(await countRecipeAssignments(origin.id)).toBe(1);
    if (variant.ok) {
      expect(await countRecipeAssignments(variant.data.id)).toBe(0);
    }
  });

  it("gives a recipe written from scratch no origin at all", async () => {
    const plain = await created("Compote de rhubarbe");
    expect(plain.variantOfId).toBeNull();
  });

  it("reports a missing recipe rather than throwing", async () => {
    const missing = "00000000-0000-4000-8000-000000000000";
    const result = await duplicateRecipe(missing);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_found");
    }
  });
});

const morgane = {
  id: testPractitionerId,
  email: "morgane@example.test",
  name: "Morgane",
};

const content: StructuredRecipe = {
  description: "Un bol complet.",
  prepMinutes: 10,
  cookMinutes: 15,
  portions: 2,
  meals: ["lunch"],
  seasons: [],
  ingredients: [
    { quantity: 200, unit: "g", name: "quinoa", note: "", foodCode: null },
    { quantity: 2, unit: null, name: "œufs", note: "", foodCode: null },
  ],
  steps: [
    { text: "Cuire le quinoa 15 min.", temperatureC: null, durationMinutes: 15 },
  ],
};

const structured = async (title: string, overrides?: Partial<StructuredRecipe>) => {
  const result = await createRecipe({
    title,
    content: { ...content, ...overrides },
  });
  if (!result.ok) {
    throw new Error(`recipe "${title}" not created: ${result.message}`);
  }
  return result.data;
};

const markEvents = async (recipeId: string) =>
  (
    await getDatabase()
      .collection<AuditEvent>("audit_events")
      .findMany({ targetId: recipeId }, { limit: 100 })
  ).items
    .filter((event) => event.action.startsWith("recipe.verif"))
    .map((event) => [event.action, event.detail, event.actorId]);

const reread = async (id: string) => {
  const result = await getRecipe(id);
  if (!result.ok) {
    throw new Error("recipe not found");
  }
  return result.data;
};

describe("the structured recipe of the library", () => {
  it("stores the structured form, and writes the body from it", async () => {
    const recipe = await structured("Bol de quinoa");
    expect(recipe.content).toEqual(content);
    expect(recipe.body).toBe(structuredRecipeText(content));
    expect(recipe.verifiedAt).toBeNull();
  });

  it("refuses a structured form that the schema refuses", async () => {
    const result = await createRecipe({
      title: "Sans ingrédient",
      content: { ...content, ingredients: [] },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("a recipe needs at least one ingredient");
    }
  });

  it("keeps a recipe of the old prose form as it is", async () => {
    const prose = await created("Tartine à l'ancienne");
    expect(prose.content).toBeNull();
    expect(prose.verifiedAt).toBeNull();
    const renamed = await updateRecipe(prose.id, { title: "Tartine d'avant" });
    expect(renamed.ok && renamed.data.body).toBe(body);
    expect(renamed.ok && renamed.data.content).toBeNull();
  });

  it("keeps the typed prose when a prose recipe gets its structured form", async () => {
    const prose = await created("Salade à structurer");
    const result = await updateRecipe(prose.id, { body, content });
    expect(result.ok && result.data.content).toEqual(content);
    expect(result.ok && result.data.body).toBe(body);
  });

  it("makes the body follow the content when the service wrote the body", async () => {
    const recipe = await structured("Bol qui change");
    const next = { ...content, portions: 4 };
    const result = await updateRecipe(recipe.id, {
      body: recipe.body,
      content: next,
    });
    expect(result.ok && result.data.body).toBe(structuredRecipeText(next));
  });

  it("does not remove the structured form with an edit of the title", async () => {
    const recipe = await structured("Bol à renommer");
    const result = await updateRecipe(recipe.id, { title: "Bol renommé" });
    expect(result.ok && result.data.content).toEqual(content);
  });

  it("copies the structured form to a variant, and never the mark", async () => {
    const origin = await structured("Bol d'origine");
    await setRecipeVerified(origin.id, morgane, true);
    const variant = await duplicateRecipe(origin.id);
    expect(variant.ok && variant.data.content).toEqual(content);
    expect(variant.ok && variant.data.verifiedAt).toBeNull();
  });

  it("makes a variant adapted as prose a prose recipe", async () => {
    const origin = await structured("Bol à adapter");
    const variant = await duplicateRecipe(origin.id, {
      body: "La même chose, sans œufs.",
    });
    expect(variant.ok && variant.data.content).toBeNull();
  });
});

describe("the mark « vérifiée »", () => {
  it("is set only by the explicit act, with who and when", async () => {
    const recipe = await structured("Bol à vérifier");
    const result = await setRecipeVerified(recipe.id, morgane, true);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.verifiedAt).toBeInstanceOf(Date);
      expect(result.data.verifiedById).toBe(morgane.id);
      expect(result.data.verifiedByName).toBe("Morgane");
    }
    expect(await markEvents(recipe.id)).toEqual([
      ["recipe.verified", "", morgane.id],
    ]);
  });

  it("writes no second event when the mark does not change", async () => {
    const recipe = await structured("Bol vérifié deux fois");
    await setRecipeVerified(recipe.id, morgane, true);
    await setRecipeVerified(recipe.id, morgane, true);
    expect(await markEvents(recipe.id)).toHaveLength(1);
  });

  it("refuses a recipe of the old prose form", async () => {
    const prose = await created("Soupe en prose");
    const result = await setRecipeVerified(prose.id, morgane, true);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("only a structured recipe can be verified");
    }
    expect((await reread(prose.id)).verifiedAt).toBeNull();
    expect(await markEvents(prose.id)).toEqual([]);
  });

  it("refuses an archived recipe", async () => {
    const recipe = await structured("Bol archivé");
    await archiveRecipe(recipe.id, true);
    const result = await setRecipeVerified(recipe.id, morgane, true);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("conflict");
    }
  });

  it("leaves with the explicit act, and writes the event", async () => {
    const recipe = await structured("Bol dont la marque part");
    await setRecipeVerified(recipe.id, morgane, true);
    const result = await setRecipeVerified(recipe.id, morgane, false);
    expect(result.ok && result.data.verifiedAt).toBeNull();
    expect(result.ok && result.data.verifiedById).toBeNull();
    expect((await markEvents(recipe.id)).at(-1)).toEqual([
      "recipe.verification_removed",
      "explicit",
      morgane.id,
    ]);
  });

  it("leaves when an edit changes the recipe, and writes the event", async () => {
    const recipe = await structured("Bol vérifié puis modifié");
    await setRecipeVerified(recipe.id, morgane, true);
    const result = await updateRecipe(
      recipe.id,
      { content: { ...content, portions: 3 } },
      morgane,
    );
    expect(result.ok && result.data.verifiedAt).toBeNull();
    expect((await markEvents(recipe.id)).at(-1)).toEqual([
      "recipe.verification_removed",
      "edit",
      morgane.id,
    ]);
  });

  it("leaves when an edit changes the title or the tags", async () => {
    const first = await structured("Bol au titre vérifié");
    await setRecipeVerified(first.id, morgane, true);
    const renamed = await updateRecipe(first.id, { title: "Autre titre" }, morgane);
    expect(renamed.ok && renamed.data.verifiedAt).toBeNull();

    const second = await structured("Bol aux étiquettes vérifiées");
    await setRecipeVerified(second.id, morgane, true);
    const tagged = await updateRecipe(second.id, { tags: ["hiver"] }, morgane);
    expect(tagged.ok && tagged.data.verifiedAt).toBeNull();
  });

  it("stays when a save changes nothing", async () => {
    const recipe = await structured("Bol enregistré sans changement");
    await setRecipeVerified(recipe.id, morgane, true);
    const result = await updateRecipe(
      recipe.id,
      { title: recipe.title, tags: [], content: { ...content } },
      morgane,
    );
    expect(result.ok && result.data.verifiedAt).toBeInstanceOf(Date);
    expect(await markEvents(recipe.id)).toHaveLength(1);
  });

  it("is never set by an edit", async () => {
    const recipe = await structured("Bol jamais vérifié");
    await updateRecipe(recipe.id, { content: { ...content, portions: 6 } }, morgane);
    expect((await reread(recipe.id)).verifiedAt).toBeNull();
  });
});

describe("listVerifiedTemplates", () => {
  it("gives only the verified, active, structured recipes", async () => {
    const verified = await structured("Modèle vérifié", { meals: ["dinner"] });
    await setRecipeVerified(verified.id, morgane, true);
    const notVerified = await structured("Modèle non vérifié");
    const archived = await structured("Modèle archivé");
    await setRecipeVerified(archived.id, morgane, true);
    await archiveRecipe(archived.id, true);
    const edited = await structured("Modèle modifié");
    await setRecipeVerified(edited.id, morgane, true);
    await updateRecipe(edited.id, { title: "Modèle modifié depuis" }, morgane);

    const ids = (await listVerifiedTemplates()).map((template) => template.id);
    expect(ids).toContain(verified.id);
    expect(ids).not.toContain(notVerified.id);
    expect(ids).not.toContain(archived.id);
    expect(ids).not.toContain(edited.id);
  });

  it("leaves out a verified row whose stored content is not a recipe", async () => {
    const recipe = await structured("Modèle au contenu cassé");
    await setRecipeVerified(recipe.id, morgane, true);
    await getDatabase()
      .collection<{ id: string; content: unknown }>("recipes")
      .update(recipe.id, { content: { ingredients: "du quinoa" } });
    const ids = (await listVerifiedTemplates()).map((template) => template.id);
    expect(ids).not.toContain(recipe.id);
  });

  it("keeps the templates that suit a meal", async () => {
    const breakfast = await structured("Modèle du matin", {
      meals: ["breakfast"],
    });
    await setRecipeVerified(breakfast.id, morgane, true);
    const forBreakfast = await listVerifiedTemplates({ meal: "breakfast" });
    expect(forBreakfast.map((template) => template.id)).toContain(breakfast.id);
    expect(
      forBreakfast.every((template) =>
        template.content.meals.includes("breakfast"),
      ),
    ).toBe(true);
    const forSnack = await listVerifiedTemplates({ meal: "snack" });
    expect(forSnack.map((template) => template.id)).not.toContain(breakfast.id);
  });
});
