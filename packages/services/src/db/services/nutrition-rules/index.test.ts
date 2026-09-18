import { beforeAll, describe, expect, it } from "vitest";
import type { Id } from "../../../types";
import { getDatabase, registerDatabase } from "../../client";
import type { NutritionRule } from "../../models/nutrition-rule";
import { createMemoryDatabase } from "../../test-helpers";
import {
  archiveNutritionRule,
  createNutritionRule,
  getNutritionRule,
  listNutritionRuleTags,
  listNutritionRules,
  retrieveNutritionRules,
  updateNutritionRule,
  validateNutritionRule,
  NUTRITION_RULE_RETRIEVAL_LIMIT,
  type NutritionRuleInput,
} from "./index";

/**
 * One in-memory corpus for the file, and every test works inside its own tag
 * namespace — `t3-x` and so on. Retrieval and the console's list are both
 * tag-scoped, so a namespace per test isolates the assertions without a reset
 * hook the seam does not offer.
 */
beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
});

const OPERATOR = "4f1d1d6e-5c5e-4a1e-9a2b-0f6e2a1c7d90";

const body = "Privilégier les fruits et légumes de saison.";

/** Throws rather than asserting — a refused write is a broken test, not a case. */
const created = async (input: NutritionRuleInput): Promise<NutritionRule> => {
  const result = await createNutritionRule({ body, ...input });
  if (!result.ok) {
    throw new Error(`rule "${input.title}" not created: ${result.message}`);
  }
  return result.data;
};

const validated = async (id: Id): Promise<NutritionRule> => {
  const result = await validateNutritionRule(id, OPERATOR);
  if (!result.ok) {
    throw new Error(`rule ${id} not validated: ${result.message}`);
  }
  return result.data;
};

/**
 * Stamp a chosen `validatedAt` through the same seam the service writes
 * through. Two rules validated in the same millisecond would otherwise fall to
 * the id tie-break, which is exactly the thing the ordering test is trying to
 * tell apart.
 */
const validatedAt = async (id: Id, when: Date) => {
  await getDatabase()
    .collection<NutritionRule>("nutrition_rules")
    .update(id, { validatedAt: when });
};

const titles = (rules: readonly NutritionRule[]) =>
  rules.map((rule) => rule.title);

describe("authoring a nutrition rule", () => {
  it("is born a draft, at version 1, agreed to by nobody", async () => {
    const rule = await created({ title: "Saisonnalité", tags: ["t1-x"] });
    expect(rule.status).toBe("draft");
    expect(rule.version).toBe(1);
    expect(rule.validatedAt).toBeNull();
    expect(rule.validatedBy).toBeNull();
    expect(rule.supersededBy).toBeNull();
    expect(rule.archivedAt).toBeNull();
    expect(rule.kind).toBe("principle");
  });

  it("treats « Saison » and « saison » as one tag", async () => {
    const rule = await created({
      title: "Normalisation",
      tags: ["Saison", " saison ", "", "t1-norm"],
    });
    expect(rule.tags).toEqual(["saison", "t1-norm"]);
  });

  it("refuses a ninth tag, counted after the dedupe", async () => {
    const nine = Array.from({ length: 9 }, (_, index) => `t1-tag${index}`);
    const result = await createNutritionRule({
      title: "Trop",
      body,
      tags: nine,
    });
    expect(result.ok).toBe(false);
  });

  it("refuses a rule with no body — there would be nothing to quote", async () => {
    const result = await createNutritionRule({ title: "Vide", body: "   " });
    expect(result.ok).toBe(false);
  });
});

describe("editing", () => {
  it("changes a draft in place — nothing has trusted it yet", async () => {
    const rule = await created({ title: "Brouillon", tags: ["t2-x"] });
    const edit = await updateNutritionRule(rule.id, {
      title: "Brouillon revu",
    });
    expect(edit.ok).toBe(true);
    if (!edit.ok) {
      return;
    }
    expect(edit.data.revised).toBe(false);
    expect(edit.data.rule.id).toBe(rule.id);
    expect(edit.data.rule.version).toBe(1);
    expect(edit.data.rule.title).toBe("Brouillon revu");
  });

  it("opens a new draft version rather than overwriting a validated rule", async () => {
    const rule = await created({ title: "Oméga-3", tags: ["t2-omega"] });
    await validated(rule.id);

    const edit = await updateNutritionRule(rule.id, { title: "Oméga-3 (v2)" });
    expect(edit.ok).toBe(true);
    if (!edit.ok) {
      return;
    }
    expect(edit.data.revised).toBe(true);
    expect(edit.data.rule.id).not.toBe(rule.id);
    expect(edit.data.rule.version).toBe(2);
    expect(edit.data.rule.status).toBe("draft");

    const previous = await getNutritionRule(rule.id);
    expect(previous.ok).toBe(true);
    if (!previous.ok) {
      return;
    }
    // The superseded row keeps the stamp: what was in force, and until when.
    expect(previous.data.status).toBe("validated");
    expect(previous.data.validatedBy).toBe(OPERATOR);
    expect(previous.data.supersededBy).toBe(edit.data.rule.id);
  });

  it("refuses to edit a version that was already replaced", async () => {
    const rule = await created({ title: "Remplacée", tags: ["t2-old"] });
    await validated(rule.id);
    await updateNutritionRule(rule.id, { title: "Remplacée v2" });

    const again = await updateNutritionRule(rule.id, { title: "Remplacée v3" });
    expect(again.ok).toBe(false);
  });
});

describe("validating", () => {
  it("records who agreed to the wording, and when", async () => {
    const rule = await created({ title: "À valider", tags: ["t3-x"] });
    const live = await validated(rule.id);
    expect(live.status).toBe("validated");
    expect(live.validatedBy).toBe(OPERATOR);
    expect(live.validatedAt).toBeInstanceOf(Date);
  });

  it("refuses a second validation — there is no un-validate either", async () => {
    const rule = await created({ title: "Deux fois", tags: ["t3-twice"] });
    await validated(rule.id);
    const again = await validateNutritionRule(rule.id, OPERATOR);
    expect(again.ok).toBe(false);
  });

  it("refuses to validate an archived rule", async () => {
    const rule = await created({ title: "Archivée", tags: ["t3-arch"] });
    await archiveNutritionRule(rule.id, true);
    const result = await validateNutritionRule(rule.id, OPERATOR);
    expect(result.ok).toBe(false);
  });
});

describe("retrieval — what a prompt is allowed to see", () => {
  it("never returns a draft", async () => {
    await created({ title: "Jamais lue", tags: ["t4-draft"] });
    const found = await retrieveNutritionRules({ tags: ["t4-draft"] });
    expect(found).toEqual([]);
  });

  it("never returns a superseded version", async () => {
    const rule = await created({ title: "V1", tags: ["t4-sup"] });
    await validated(rule.id);
    await updateNutritionRule(rule.id, { title: "V2" });

    // The old row is superseded and the new one is a draft: between a revision
    // and its validation, the rule reaches no prompt at all.
    const found = await retrieveNutritionRules({ tags: ["t4-sup"] });
    expect(found).toEqual([]);
  });

  it("never returns an archived rule", async () => {
    const rule = await created({ title: "Retirée", tags: ["t4-arch"] });
    await validated(rule.id);
    await archiveNutritionRule(rule.id, true);
    expect(await retrieveNutritionRules({ tags: ["t4-arch"] })).toEqual([]);

    await archiveNutritionRule(rule.id, false);
    expect(titles(await retrieveNutritionRules({ tags: ["t4-arch"] }))).toEqual(
      ["Retirée"],
    );
  });

  it("never returns a rule that shares no tag with the query", async () => {
    const rule = await created({ title: "Hors sujet", tags: ["t4-other"] });
    await validated(rule.id);
    const found = await retrieveNutritionRules({ tags: ["t4-unrelated"] });
    expect(found).toEqual([]);
  });

  it("returns nothing for an empty query rather than everything", async () => {
    expect(await retrieveNutritionRules({ tags: [] })).toEqual([]);
    expect(await retrieveNutritionRules({ tags: ["  "] })).toEqual([]);
  });

  it("matches the query's tags case-insensitively", async () => {
    const rule = await created({ title: "Casse", tags: ["t4-Case"] });
    await validated(rule.id);
    expect(titles(await retrieveNutritionRules({ tags: ["T4-CASE"] }))).toEqual(
      ["Casse"],
    );
  });

  it("narrows to the kinds asked for", async () => {
    const safety = await created({
      title: "Précaution",
      tags: ["t4-kind"],
      kind: "safety",
    });
    const principle = await created({
      title: "Principe",
      tags: ["t4-kind"],
      kind: "principle",
    });
    await validated(safety.id);
    await validated(principle.id);

    const found = await retrieveNutritionRules({
      tags: ["t4-kind"],
      kinds: ["safety"],
    });
    expect(titles(found)).toEqual(["Précaution"]);
  });

  /**
   * The sort is total, and this is the fixture that proves each key in turn:
   * overlap separates `Deux` from the singles, the validation date separates
   * the two singles, and a shared date leaves the id to decide.
   */
  it("orders by overlap, then by how recently the wording was agreed, then by id", async () => {
    const both = await created({ title: "Deux", tags: ["t5-a", "t5-b"] });
    const older = await created({ title: "Ancienne", tags: ["t5-a"] });
    const newer = await created({ title: "Récente", tags: ["t5-a"] });
    for (const rule of [both, older, newer]) {
      await validated(rule.id);
    }
    await validatedAt(both.id, new Date("2026-01-01T00:00:00Z"));
    await validatedAt(older.id, new Date("2026-01-02T00:00:00Z"));
    await validatedAt(newer.id, new Date("2026-01-03T00:00:00Z"));

    expect(
      titles(await retrieveNutritionRules({ tags: ["t5-a", "t5-b"] })),
    ).toEqual(["Deux", "Récente", "Ancienne"]);

    const tied = [
      await created({ title: "Égalité 1", tags: ["t5-tie"] }),
      await created({ title: "Égalité 2", tags: ["t5-tie"] }),
    ];
    const when = new Date("2026-02-01T00:00:00Z");
    for (const rule of tied) {
      await validated(rule.id);
      await validatedAt(rule.id, when);
    }
    const expected = [...tied]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((rule) => rule.title);
    expect(titles(await retrieveNutritionRules({ tags: ["t5-tie"] }))).toEqual(
      expected,
    );
  });

  it("caps the block at the retrieval limit", async () => {
    for (
      let index = 0;
      index < NUTRITION_RULE_RETRIEVAL_LIMIT + 3;
      index += 1
    ) {
      const rule = await created({ title: `Règle ${index}`, tags: ["t6-cap"] });
      await validated(rule.id);
    }
    const found = await retrieveNutritionRules({ tags: ["t6-cap"] });
    expect(found).toHaveLength(NUTRITION_RULE_RETRIEVAL_LIMIT);
  });

  it("lets `limit` lower the cap and never raise it", async () => {
    const lowered = await retrieveNutritionRules({
      tags: ["t6-cap"],
      limit: 2,
    });
    expect(lowered).toHaveLength(2);

    const raised = await retrieveNutritionRules({
      tags: ["t6-cap"],
      limit: 50,
    });
    expect(raised).toHaveLength(NUTRITION_RULE_RETRIEVAL_LIMIT);
  });
});

describe("the console's list", () => {
  it("hides superseded and archived rows unless they are asked for", async () => {
    await created({ title: "En vigueur", tags: ["t7-x"] });
    const replaced = await created({ title: "Remplacée v1", tags: ["t7-x"] });
    const gone = await created({ title: "Retirée", tags: ["t7-x"] });

    await validated(replaced.id);
    await updateNutritionRule(replaced.id, { title: "Remplacée v2" });
    await archiveNutritionRule(gone.id, true);

    const current = await listNutritionRules({ tag: "t7-x" });
    expect(titles(current).sort()).toEqual(
      ["En vigueur", "Remplacée v2"].sort(),
    );
    expect(titles(current)).not.toContain("Retirée");

    expect(
      titles(await listNutritionRules({ tag: "t7-x", shelf: "superseded" })),
    ).toEqual(["Remplacée v1"]);
    expect(
      titles(await listNutritionRules({ tag: "t7-x", shelf: "archived" })),
    ).toEqual(["Retirée"]);
  });

  it("filters by kind, by status and by title", async () => {
    await created({
      title: "Polyphénols",
      tags: ["t8-x"],
      kind: "food-list",
    });
    const live = await created({
      title: "Interactions",
      tags: ["t8-x"],
      kind: "safety",
    });
    await validated(live.id);

    expect(
      titles(await listNutritionRules({ tag: "t8-x", kind: "food-list" })),
    ).toEqual(["Polyphénols"]);
    expect(
      titles(await listNutritionRules({ tag: "t8-x", status: "validated" })),
    ).toEqual(["Interactions"]);
    expect(
      titles(await listNutritionRules({ tag: "t8-x", search: "poly" })),
    ).toEqual(["Polyphénols"]);
  });

  it("reports the tags the corpus actually carries, and drops a rule's tags with it", async () => {
    const rule = await created({ title: "Étiquetée", tags: ["t9-visible"] });
    expect(await listNutritionRuleTags()).toContain("t9-visible");

    await archiveNutritionRule(rule.id, true);
    expect(await listNutritionRuleTags()).not.toContain("t9-visible");
  });
});
