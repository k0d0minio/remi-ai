import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import { createOperator } from "../operators";
import {
  deleteProtocolTemplate,
  getProtocolTemplate,
  listProtocolTemplates,
  renameProtocolTemplate,
  saveProtocolTemplate,
  setProtocolTemplateShared,
} from "./index";

/**
 * Written from the spec's acceptance criteria: a set is saved under a name and
 * inserted elsewhere; a re-save under an existing name overwrites; a set is
 * private to whoever saved it until she shares it, and only its owner renames,
 * overwrites, deletes or un-shares it.
 */

let morgane: string;
let arnaud: string;

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  const first = await createOperator({
    email: "morgane@example.test",
    name: "Morgane",
    password: "a-long-enough-password",
  });
  const second = await createOperator({
    email: "arnaud@example.test",
    name: "Arnaud",
    password: "a-long-enough-password",
  });
  if (!first.ok || !second.ok) {
    throw new Error("test operators not created");
  }
  morgane = first.data.id;
  arnaud = second.data.id;
});

const save = async (
  operatorId: string,
  name: string,
  rows: readonly Record<string, string>[] = [{ item: "Sardines", why: "" }],
) => {
  const result = await saveProtocolTemplate(operatorId, "pantry", name, rows);
  if (!result.ok) {
    throw new Error(`template "${name}" not saved: ${result.message}`);
  }
  return result.data;
};

const names = async (operatorId: string) =>
  (await listProtocolTemplates(operatorId, "pantry")).map(
    (template) => template.name,
  );

describe("saving a named set", () => {
  it("stores the rows and reports it added rather than replaced", async () => {
    const saved = await save(morgane, "Base anti-inflammatoire", [
      { item: "Sardines", why: "oméga-3" },
      { item: "Curcuma", why: "" },
    ]);
    expect(saved.overwritten).toBe(false);
    expect(saved.template.rows).toEqual([
      { item: "Sardines", why: "oméga-3" },
      { item: "Curcuma", why: "" },
    ]);
    expect(saved.template.owned).toBe(true);
  });

  it("refuses a set with no rows and a set with no name", async () => {
    const empty = await saveProtocolTemplate(morgane, "pantry", "Vide", []);
    expect(empty.ok).toBe(false);
    const unnamed = await saveProtocolTemplate(morgane, "pantry", "  ", [
      { item: "Sardines" },
    ]);
    expect(unnamed.ok).toBe(false);
  });

  it("overwrites her own set of the same name instead of adding a second", async () => {
    await save(morgane, "Compléments fatigue", [{ item: "Fer", why: "" }]);

    const again = await save(morgane, "Compléments fatigue", [
      { item: "Fer", why: "" },
      { item: "Magnésium", why: "" },
    ]);
    expect(again.overwritten).toBe(true);
    expect(again.template.rows).toHaveLength(2);
    expect(
      (await names(morgane)).filter((name) => name === "Compléments fatigue"),
    ).toHaveLength(1);
  });

  it("does not treat another operator's shared set as a name to overwrite", async () => {
    const hers = await save(arnaud, "Protocole commun");
    await setProtocolTemplateShared(hers.template.id, arnaud, true);

    const mine = await save(morgane, "Protocole commun");
    expect(mine.overwritten).toBe(false);
    expect(mine.template.id).not.toBe(hers.template.id);
  });
});

describe("who sees a set", () => {
  it("keeps a new set private to the operator who saved it", async () => {
    const saved = await save(morgane, "Privée");
    expect(saved.template.shared).toBe(false);
    expect(await names(arnaud)).not.toContain("Privée");
    expect(await getProtocolTemplate(saved.template.id, arnaud)).toMatchObject({
      ok: false,
      error: "not_found",
    });
  });

  it("lists a shared set for every operator, marked as not theirs", async () => {
    const saved = await save(morgane, "Partagée");
    await setProtocolTemplateShared(saved.template.id, morgane, true);

    expect(await names(arnaud)).toContain("Partagée");
    const seen = await getProtocolTemplate(saved.template.id, arnaud);
    expect(seen.ok && seen.data.owned).toBe(false);
    const own = await getProtocolTemplate(saved.template.id, morgane);
    expect(own.ok && own.data.owned).toBe(true);
  });

  it("hides it again when the owner un-shares it", async () => {
    const saved = await save(morgane, "Retirée");
    await setProtocolTemplateShared(saved.template.id, morgane, true);
    expect(await names(arnaud)).toContain("Retirée");

    await setProtocolTemplateShared(saved.template.id, morgane, false);
    expect(await names(arnaud)).not.toContain("Retirée");
  });

  it("never lists a set of another kind", async () => {
    await saveProtocolTemplate(morgane, "supplement", "Fatigue", [
      { name: "Fer", dose: "", timing: "", reason: "" },
    ]);
    expect(await names(morgane)).not.toContain("Fatigue");
  });
});

describe("what only an owner may do", () => {
  it("refuses a rename, a share change and a delete from another operator", async () => {
    const saved = await save(morgane, "La sienne");
    await setProtocolTemplateShared(saved.template.id, morgane, true);
    const id = saved.template.id;

    expect(await renameProtocolTemplate(id, arnaud, "La mienne")).toMatchObject(
      {
        ok: false,
        error: "not_permitted",
      },
    );
    expect(await setProtocolTemplateShared(id, arnaud, false)).toMatchObject({
      ok: false,
      error: "not_permitted",
    });
    expect(await deleteProtocolTemplate(id, arnaud)).toMatchObject({
      ok: false,
      error: "not_permitted",
    });

    // And none of the three took effect.
    const after = await getProtocolTemplate(id, morgane);
    expect(after.ok && after.data.name).toBe("La sienne");
    expect(after.ok && after.data.shared).toBe(true);
  });

  it("renames her own set, and refuses a name another of her sets already uses", async () => {
    const saved = await save(morgane, "À renommer");
    await save(morgane, "Déjà prise");

    expect(
      await renameProtocolTemplate(saved.template.id, morgane, "Déjà prise"),
    ).toMatchObject({ ok: false, error: "invalid_input" });

    const renamed = await renameProtocolTemplate(
      saved.template.id,
      morgane,
      "Renommée",
    );
    expect(renamed.ok && renamed.data.name).toBe("Renommée");
  });

  it("deletes her own set outright", async () => {
    const saved = await save(morgane, "À supprimer");
    expect((await deleteProtocolTemplate(saved.template.id, morgane)).ok).toBe(
      true,
    );
    expect(await names(morgane)).not.toContain("À supprimer");
    expect(await getProtocolTemplate(saved.template.id, morgane)).toMatchObject(
      {
        ok: false,
        error: "not_found",
      },
    );
  });
});

describe("rows stored under an older shape", () => {
  it("inserts them with the missing field at its default rather than failing", async () => {
    const saved = await saveProtocolTemplate(
      morgane,
      "supplement",
      "Ancienne",
      [
        // No `timing`: the shape this set was saved under did not have one.
        { name: "Oméga-3", dose: "1 g", reason: "" },
      ],
    );
    expect(saved.ok).toBe(true);

    const read = await listProtocolTemplates(morgane, "supplement");
    const ancienne = read.find((template) => template.name === "Ancienne");
    expect(ancienne?.rows).toEqual([
      { name: "Oméga-3", dose: "1 g", timing: "", reason: "" },
    ]);
  });
});
