import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import { createPatient } from "../patients";
import { assignRecipe } from "../recipe-assignments";
import {
  archiveRecipe,
  countRecipeAssignments,
  createRecipe,
  getRecipe,
  listArchivedRecipes,
  listRecipeTags,
  listRecipes,
  updateRecipe,
} from "./index";

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
    const claire = await createPatient({ pseudonym: "Claire" });
    const luc = await createPatient({ pseudonym: "Luc" });
    if (!claire.ok || !luc.ok) {
      throw new Error("test patients not created");
    }

    expect(await countRecipeAssignments(recipe.id)).toBe(0);
    await assignRecipe(claire.data.id, recipe.id, { assignedOn: "2026-09-01" });
    await assignRecipe(luc.data.id, recipe.id, { assignedOn: "2026-09-01" });
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
