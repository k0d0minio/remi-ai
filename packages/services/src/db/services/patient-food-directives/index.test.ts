import { beforeAll, describe, expect, it } from "vitest";
import type { FoodDirectiveDraft } from "../../../shared/food-directives";
import { getDatabase, registerDatabase } from "../../client";
import type { AuditEvent } from "../../models/audit-event";
import type { PatientProfile } from "../../models/patient-profile";
import {
  createMemoryDatabase,
  practitionerActor,
  testPractitionerId,
} from "../../test-helpers";
import { operatorActor, systemActor } from "../access";
import { createPatient } from "../patients";
import { getValidatedProtocol, validateProtocol } from "../protocol-versions";
import {
  listDisabledPatientFoodDirectives,
  listPatientEvictions,
  listPatientFoodDirectives,
  savePatientFoodDirectives,
} from "./index";

const practitioner = {
  id: testPractitionerId,
  email: "morgane@example.test",
  name: "Morgane",
};

const holder = practitionerActor();

const otherPractitioner = operatorActor({
  id: "00000000-0000-4000-8000-000000000002",
  role: "practitioner",
});

const profiles = () =>
  getDatabase().collection<PatientProfile>("patient_profiles");

const newPatient = async (
  pseudonym: string,
  fileStatus: PatientProfile["fileStatus"],
) => {
  const created = await createPatient(systemActor, {
    practitionerId: testPractitionerId,
    pseudonym,
  });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  await profiles().update(created.data.id, { fileStatus });
  return created.data.id;
};

const draft = (
  kind: FoodDirectiveDraft["kind"],
  term: string,
  rest: Partial<FoodDirectiveDraft> = {},
): FoodDirectiveDraft => ({
  kind,
  term,
  limitLevel: null,
  startsOn: null,
  endsOn: null,
  durable: false,
  ...rest,
});

const section: FoodDirectiveDraft[] = [
  draft("favour", "brocoli"),
  draft("favour", "magnésium"),
  draft("favour", "crucifères"),
  draft("limit", "sucre", { limitLevel: "rare" }),
  draft("exclude", "kiwi", { startsOn: "2026-12-01", endsOn: "2027-01-31" }),
  draft("exclude", "composés soufrés", { durable: true }),
];

const termsOf = async (patientId: string) =>
  (await listPatientFoodDirectives(holder, patientId)).map(
    (row) => `${row.kind}:${row.term}`,
  );

let patientId: string;

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  patientId = await newPatient("Claire", "ready");
});

describe("the food directives of a patient", () => {
  it("has none before the first save", async () => {
    expect(await listPatientFoodDirectives(holder, patientId)).toEqual([]);
    expect(await listPatientEvictions(holder, patientId)).toEqual({
      ok: true,
      data: [],
    });
  });

  it("saves one row for each term, in the order of the fields", async () => {
    const saved = await savePatientFoodDirectives(
      holder,
      patientId,
      practitioner,
      section,
    );
    expect(saved.ok && saved.data.added).toBe(6);
    expect(await termsOf(patientId)).toEqual([
      "favour:brocoli",
      "favour:magnésium",
      "favour:crucifères",
      "limit:sucre",
      "exclude:kiwi",
      "exclude:composés soufrés",
    ]);
    const rows = await listPatientFoodDirectives(holder, patientId);
    expect(rows[3]).toMatchObject({ limitLevel: "rare", durable: false });
    expect(rows[4]).toMatchObject({
      startsOn: "2026-12-01",
      endsOn: "2027-01-31",
      durable: false,
      disabledAt: null,
    });
    expect(rows[5]).toMatchObject({ endsOn: null, durable: true });
  });

  it("moves a file at « Prêt pour consultation » to « Recommandations à valider »", async () => {
    expect((await profiles().findById(patientId))?.fileStatus).toBe(
      "to_validate",
    );
  });

  it("writes one audit event with the counts and no term", async () => {
    const events = getDatabase().collection<AuditEvent>("audit_events");
    const all = (
      await events.findMany({ action: "food_directive.batch_saved" })
    ).items;
    expect(all).toHaveLength(1);
    expect(all[0]?.targetId).toBe(patientId);
    expect(all[0]?.actorEmail).toBe(practitioner.email);
    expect(JSON.parse(all[0]?.detail ?? "{}")).toEqual({
      added: 6,
      updated: 0,
      disabled: 0,
      reordered: 0,
      inForce: { favour: 3, limit: 1, exclude: 2 },
    });
    expect(all[0]?.detail).not.toContain("kiwi");
  });

  it("gives the gate each eviction in force, with the term as typed", async () => {
    expect(await listPatientEvictions(holder, patientId)).toEqual({
      ok: true,
      data: [
        { term: "kiwi", startsOn: "2026-12-01", endsOn: "2027-01-31" },
        { term: "composés soufrés", startsOn: null, endsOn: null },
      ],
    });
  });

  it("refuses the same term in « À favoriser » and « Éviction totale », and writes nothing", async () => {
    const before = await listPatientFoodDirectives(holder, patientId);
    const saved = await savePatientFoodDirectives(
      holder,
      patientId,
      practitioner,
      [...section, draft("favour", "Kiwis")],
    );
    expect(saved.ok).toBe(false);
    if (!saved.ok) {
      expect(saved.error).toBe("invalid_input");
      expect(saved.message).toContain("favour_and_exclude");
      expect(saved.message).toContain("Kiwis");
    }
    expect(await listPatientFoodDirectives(holder, patientId)).toEqual(before);
  });

  it("refuses an eviction with no end date and no durable status, and writes nothing", async () => {
    const before = await listPatientFoodDirectives(holder, patientId);
    const saved = await savePatientFoodDirectives(
      holder,
      patientId,
      practitioner,
      [...section, draft("exclude", "porc")],
    );
    expect(!saved.ok && saved.message).toContain("eviction_without_period");
    expect(!saved.ok && saved.message).toContain("porc");
    expect(await listPatientFoodDirectives(holder, patientId)).toEqual(before);
  });

  it("does nothing when the section comes back unchanged", async () => {
    const saved = await savePatientFoodDirectives(
      holder,
      patientId,
      practitioner,
      section,
    );
    expect(saved.ok && saved.data).toEqual({
      added: 0,
      updated: 0,
      archived: 0,
      reordered: 0,
    });
    const events = getDatabase().collection<AuditEvent>("audit_events");
    expect(
      (await events.findMany({ action: "food_directive.batch_saved" })).items,
    ).toHaveLength(1);
  });

  it("applies an edit, an addition and a deactivation in one save", async () => {
    const before = await listPatientFoodDirectives(holder, patientId);
    const kiwi = before.find((row) => row.term === "kiwi");
    const saved = await savePatientFoodDirectives(
      holder,
      patientId,
      practitioner,
      [
        draft("favour", "brocoli"),
        draft("favour", "crucifères"),
        draft("limit", "sucre", { limitLevel: "rare" }),
        // The same term with a new end date: the same row.
        draft("exclude", "Kiwi", { startsOn: "2026-12-01", endsOn: "2027-03-31" }),
        draft("exclude", "porc", { durable: true }),
      ],
    );
    expect(saved.ok && saved.data).toEqual({
      added: 1,
      updated: 1,
      archived: 2,
      reordered: 1,
    });
    const after = await listPatientFoodDirectives(holder, patientId);
    expect(after.map((row) => `${row.kind}:${row.term}`)).toEqual([
      "favour:brocoli",
      "favour:crucifères",
      "limit:sucre",
      "exclude:Kiwi",
      "exclude:porc",
    ]);
    const edited = after.find((row) => row.term === "Kiwi");
    expect(edited?.id).toBe(kiwi?.id);
    expect(edited?.endsOn).toBe("2027-03-31");
  });

  it("keeps a disabled row with its history, out of the evictions", async () => {
    const disabled = await listDisabledPatientFoodDirectives(holder, patientId);
    expect(disabled.map((row) => row.term).sort()).toEqual([
      "composés soufrés",
      "magnésium",
    ]);
    expect(disabled.every((row) => row.disabledAt instanceof Date)).toBe(true);
    const evictions = await listPatientEvictions(holder, patientId);
    expect(evictions.ok && evictions.data.map((row) => row.term)).toEqual([
      "Kiwi",
      "porc",
    ]);
  });

  it("leaves a row that the editor did not show", async () => {
    const shown = (await listPatientFoodDirectives(holder, patientId))
      .filter((row) => row.term !== "porc")
      .map((row) => row.id);
    const saved = await savePatientFoodDirectives(
      holder,
      patientId,
      practitioner,
      [draft("favour", "brocoli")],
      shown,
    );
    expect(saved.ok && saved.data.archived).toBe(3);
    expect(await termsOf(patientId)).toEqual([
      "favour:brocoli",
      "exclude:porc",
    ]);
  });

  it("puts the directives in the validated version", async () => {
    const validated = await validateProtocol(holder, patientId, practitioner);
    expect(validated.ok).toBe(true);
    const read = await getValidatedProtocol(holder, patientId);
    expect(
      read.ok &&
        read.data?.snapshot.foodDirectives.map((row) => ({
          kind: row.kind,
          term: row.term,
          durable: row.durable,
        })),
    ).toEqual([
      { kind: "favour", term: "brocoli", durable: false },
      { kind: "exclude", term: "porc", durable: true },
    ]);
  });
});

describe("the scope of the food directives", () => {
  it("refuses another practitioner as a missing file", async () => {
    expect(await listPatientFoodDirectives(otherPractitioner, patientId)).toEqual(
      [],
    );
    const evictions = await listPatientEvictions(otherPractitioner, patientId);
    expect(evictions.ok).toBe(false);
    const saved = await savePatientFoodDirectives(
      otherPractitioner,
      patientId,
      practitioner,
      [],
    );
    expect(!saved.ok && saved.error).toBe("not_found");
    expect(await termsOf(patientId)).toEqual([
      "favour:brocoli",
      "exclude:porc",
    ]);
  });

  it("treats a malformed patient id as a missing file", async () => {
    expect(await listPatientFoodDirectives(systemActor, "not-a-uuid")).toEqual(
      [],
    );
    expect(
      await listDisabledPatientFoodDirectives(systemActor, "not-a-uuid"),
    ).toEqual([]);
    expect((await listPatientEvictions(systemActor, "not-a-uuid")).ok).toBe(
      false,
    );
    expect(
      (
        await savePatientFoodDirectives(
          systemActor,
          "not-a-uuid",
          practitioner,
          [],
        )
      ).ok,
    ).toBe(false);
  });

  it("does not move a file that is still « à compléter »", async () => {
    const other = await newPatient("Margaux", "to_complete");
    const saved = await savePatientFoodDirectives(holder, other, practitioner, [
      draft("favour", "brocoli"),
    ]);
    expect(saved.ok).toBe(true);
    expect((await profiles().findById(other))?.fileStatus).toBe("to_complete");
  });
});
