import { beforeAll, describe, expect, it } from "vitest";
import type { LifestyleAdviceKey } from "../../../shared/lifestyle-advice";
import { validatedRecommendationsView } from "../../../shared/validated-recommendations";
import { getDatabase, registerDatabase } from "../../client";
import type { AuditEvent } from "../../models/audit-event";
import type { PatientProfile } from "../../models/patient-profile";
import {
  createMemoryDatabase,
  practitionerActor,
  testPractitionerId,
} from "../../test-helpers";
import { operatorActor, systemActor } from "../access";
import {
  addPatientRecommendation,
  listArchivedPatientRecommendations,
  listPatientRecommendations,
  savePatientRecommendations,
} from "../patient-recommendations";
import { createPatient } from "../patients";
import { getValidatedProtocol, validateProtocol } from "../protocol-versions";
import {
  deleteLifestyleAdvice,
  listDisabledPatientLifestyleAdvices,
  listPatientLifestyleAdvices,
  savePatientLifestyleAdvices,
  setLifestyleAdviceDisabled,
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

const eventsOf = async (action: AuditEvent["action"]) =>
  (
    await getDatabase()
      .collection<AuditEvent>("audit_events")
      .findMany({ action })
  ).items;

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

const draft = (category: LifestyleAdviceKey, text: string, details = "") => ({
  category,
  text,
  details,
});

const active = async (id: string) =>
  (await listPatientLifestyleAdvices(holder, id)).map(
    (advice) => `${advice.category}:${advice.text}`,
  );

const adviceWith = async (id: string, text: string) => {
  const found = [
    ...(await listPatientLifestyleAdvices(holder, id)),
    ...(await listDisabledPatientLifestyleAdvices(holder, id)),
  ].find((advice) => advice.text === text);
  if (!found) {
    throw new Error(`no advice "${text}"`);
  }
  return found;
};

let patientId: string;

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  patientId = await newPatient("Claire", "ready");
});

describe("patient lifestyle advices", () => {
  it("has no advice on a new file", async () => {
    expect(await listPatientLifestyleAdvices(holder, patientId)).toEqual([]);
    expect(await listDisabledPatientLifestyleAdvices(holder, patientId)).toEqual(
      [],
    );
  });

  it("refuses a save with an advice that has no text, and writes nothing", async () => {
    const result = await savePatientLifestyleAdvices(
      holder,
      patientId,
      practitioner,
      {
        added: [draft("sleep", "Coucher avant 23 h"), draft("sleep", "  ")],
        edited: [],
      },
    );
    expect(result).toMatchObject({ ok: false, error: "invalid_input" });
    expect(!result.ok && result.message).toContain("text_missing");
    expect(await active(patientId)).toEqual([]);
    expect(await eventsOf("lifestyle_advice.batch_saved")).toHaveLength(0);
    expect((await profiles().findById(patientId))?.fileStatus).toBe("ready");
  });

  it("saves several advices at once, in Morgane's order of the categories", async () => {
    const result = await savePatientLifestyleAdvices(
      holder,
      patientId,
      practitioner,
      {
        added: [
          draft("sleep", " Coucher avant 23 h ", " chaque soir "),
          draft("physical_activity", "Marcher 30 minutes"),
          draft("sleep", "Pas d'écran au lit"),
        ],
        edited: [],
      },
    );
    expect(result).toEqual({ ok: true, data: { added: 3, updated: 0 } });
    expect(await active(patientId)).toEqual([
      "physical_activity:Marcher 30 minutes",
      "sleep:Coucher avant 23 h",
      "sleep:Pas d'écran au lit",
    ]);
    expect(await adviceWith(patientId, "Coucher avant 23 h")).toMatchObject({
      details: "chaque soir",
      position: 0,
      disabledAt: null,
    });
  });

  it("moves a file at « Prêt pour consultation » to « Recommandations à valider »", async () => {
    expect((await profiles().findById(patientId))?.fileStatus).toBe(
      "to_validate",
    );
  });

  it("writes one audit event with the counts and no text", async () => {
    const all = await eventsOf("lifestyle_advice.batch_saved");
    expect(all).toHaveLength(1);
    expect(all[0]?.targetId).toBe(patientId);
    expect(all[0]?.actorEmail).toBe(practitioner.email);
    expect(all[0]?.detail).not.toContain("Coucher");
    expect(JSON.parse(all[0]?.detail ?? "{}")).toMatchObject({
      added: 3,
      updated: 0,
      addedByCategory: { sleep: 2, physical_activity: 1, hydration: 0 },
    });
  });

  it("is not a recommendation of the recommendations section", async () => {
    expect(await listPatientRecommendations(holder, patientId)).toEqual([]);
    // A whole-section save of the recommendations does not archive an advice.
    const saved = await savePatientRecommendations(holder, patientId, []);
    expect(saved.ok).toBe(true);
    expect(await active(patientId)).toHaveLength(3);
    expect(await listArchivedPatientRecommendations(holder, patientId)).toEqual(
      [],
    );
  });

  it("edits an advice, and writes nothing for an unchanged line", async () => {
    const sleep = await adviceWith(patientId, "Coucher avant 23 h");
    const walk = await adviceWith(patientId, "Marcher 30 minutes");
    const result = await savePatientLifestyleAdvices(
      holder,
      patientId,
      practitioner,
      {
        added: [],
        edited: [
          { id: sleep.id, text: "Coucher avant 22 h 30", details: "" },
          { id: walk.id, text: walk.text, details: walk.details },
        ],
      },
    );
    expect(result).toEqual({ ok: true, data: { added: 0, updated: 1 } });
    expect(await active(patientId)).toEqual([
      "physical_activity:Marcher 30 minutes",
      "sleep:Coucher avant 22 h 30",
      "sleep:Pas d'écran au lit",
    ]);
    const unchanged = await savePatientLifestyleAdvices(
      holder,
      patientId,
      practitioner,
      { added: [], edited: [{ id: walk.id, text: walk.text, details: "" }] },
    );
    expect(unchanged).toEqual({ ok: true, data: { added: 0, updated: 0 } });
    expect(await eventsOf("lifestyle_advice.batch_saved")).toHaveLength(2);
  });

  it("refuses an edit of a row that is not an advice of this file", async () => {
    const recommendation = await addPatientRecommendation(holder, patientId, {
      category: "nutrition",
      title: "Légumes à chaque repas",
    });
    if (!recommendation.ok) {
      throw new Error("test recommendation not created");
    }
    const result = await savePatientLifestyleAdvices(
      holder,
      patientId,
      practitioner,
      {
        added: [draft("hydration", "Boire 1,5 l")],
        edited: [{ id: recommendation.data.id, text: "x", details: "" }],
      },
    );
    expect(result).toMatchObject({ ok: false, error: "conflict" });
    expect(await active(patientId)).toHaveLength(3);
    expect(
      (await setLifestyleAdviceDisabled(
        holder,
        recommendation.data.id,
        practitioner,
        true,
      )).ok,
    ).toBe(false);
    expect(
      (await deleteLifestyleAdvice(holder, recommendation.data.id, practitioner))
        .ok,
    ).toBe(false);
    expect(await listPatientRecommendations(holder, patientId)).toHaveLength(1);
  });

  it("reads an old `habit` or `activity` row in its category, and keeps its stored category", async () => {
    const old = await addPatientRecommendation(holder, patientId, {
      category: "activity",
      title: "Prendre l'escalier",
    });
    if (!old.ok) {
      throw new Error("test recommendation not created");
    }
    expect(await active(patientId)).toEqual([
      "physical_activity:Prendre l'escalier",
      "physical_activity:Marcher 30 minutes",
      "sleep:Coucher avant 22 h 30",
      "sleep:Pas d'écran au lit",
    ]);
    const result = await savePatientLifestyleAdvices(
      holder,
      patientId,
      practitioner,
      {
        added: [draft("physical_activity", "Étirements")],
        edited: [{ id: old.data.id, text: "Prendre les escaliers", details: "" }],
      },
    );
    expect(result).toEqual({ ok: true, data: { added: 1, updated: 1 } });
    const recommendations = await listPatientRecommendations(holder, patientId);
    expect(
      recommendations.find((row) => row.id === old.data.id),
    ).toMatchObject({ category: "activity", title: "Prendre les escaliers" });
    // The new advice goes after the two rows of the category.
    expect((await active(patientId)).slice(0, 3)).toEqual([
      "physical_activity:Prendre les escaliers",
      "physical_activity:Marcher 30 minutes",
      "physical_activity:Étirements",
    ]);
  });

  it("disables an advice: it leaves the active list and stays in the fold", async () => {
    const screen = await adviceWith(patientId, "Pas d'écran au lit");
    const result = await setLifestyleAdviceDisabled(
      holder,
      screen.id,
      practitioner,
      true,
    );
    expect(result.ok).toBe(true);
    expect(await active(patientId)).not.toContain("sleep:Pas d'écran au lit");
    const disabled = await listDisabledPatientLifestyleAdvices(
      holder,
      patientId,
    );
    expect(disabled.map((advice) => advice.text)).toEqual([
      "Pas d'écran au lit",
    ]);
    expect(disabled[0]?.disabledAt).toBeInstanceOf(Date);
    // A second call changes nothing and writes no event.
    await setLifestyleAdviceDisabled(holder, screen.id, practitioner, true);
    const events = await eventsOf("lifestyle_advice.disabled");
    expect(events).toHaveLength(1);
    expect(events[0]?.targetId).toBe(patientId);
    expect(events[0]?.detail).not.toContain("écran");
  });

  it("refuses an edit of a disabled advice", async () => {
    const screen = await adviceWith(patientId, "Pas d'écran au lit");
    const result = await savePatientLifestyleAdvices(
      holder,
      patientId,
      practitioner,
      { added: [], edited: [{ id: screen.id, text: "x", details: "" }] },
    );
    expect(result).toMatchObject({ ok: false, error: "conflict" });
  });

  it("puts the validated advice in the version, and not the disabled one", async () => {
    const validated = await validateProtocol(holder, patientId, practitioner);
    expect(validated.ok).toBe(true);
    const read = await getValidatedProtocol(holder, patientId);
    if (!read.ok || !read.data) {
      throw new Error("no validated protocol");
    }
    const view = validatedRecommendationsView(read.data, "2026-11-20");
    expect(
      view.lifestyle.map((group) => [
        group.category,
        group.items.map((item) => item.title),
      ]),
    ).toEqual([
      [
        "physical_activity",
        ["Prendre les escaliers", "Marcher 30 minutes", "Étirements"],
      ],
      ["sleep", ["Coucher avant 22 h 30"]],
    ]);
    // Each row is in the version one time.
    const ids = read.data.snapshot.recommendations.map((row) => row.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("puts a disabled advice back in force", async () => {
    const screen = await adviceWith(patientId, "Pas d'écran au lit");
    const result = await setLifestyleAdviceDisabled(
      holder,
      screen.id,
      practitioner,
      false,
    );
    expect(result.ok).toBe(true);
    expect(await active(patientId)).toContain("sleep:Pas d'écran au lit");
    expect(await eventsOf("lifestyle_advice.restored")).toHaveLength(1);
  });

  it("deletes an advice, and the validated version keeps its copy", async () => {
    const stretch = await adviceWith(patientId, "Étirements");
    const result = await deleteLifestyleAdvice(
      holder,
      stretch.id,
      practitioner,
    );
    expect(result.ok).toBe(true);
    expect(await active(patientId)).not.toContain(
      "physical_activity:Étirements",
    );
    expect(await listDisabledPatientLifestyleAdvices(holder, patientId)).toEqual(
      [],
    );
    expect(await eventsOf("lifestyle_advice.deleted")).toHaveLength(1);
    const read = await getValidatedProtocol(holder, patientId);
    expect(
      read.ok &&
        read.data?.snapshot.recommendations.some(
          (row) => row.id === stretch.id,
        ),
    ).toBe(true);
    expect(
      (await deleteLifestyleAdvice(holder, stretch.id, practitioner)).ok,
    ).toBe(false);
  });

  it("refuses a practitioner who does not hold the file", async () => {
    const walk = await adviceWith(patientId, "Marcher 30 minutes");
    expect(
      await listPatientLifestyleAdvices(otherPractitioner, patientId),
    ).toEqual([]);
    expect(
      (
        await savePatientLifestyleAdvices(
          otherPractitioner,
          patientId,
          practitioner,
          { added: [draft("hydration", "Boire 1,5 l")], edited: [] },
        )
      ).ok,
    ).toBe(false);
    expect(
      (
        await setLifestyleAdviceDisabled(
          otherPractitioner,
          walk.id,
          practitioner,
          true,
        )
      ).ok,
    ).toBe(false);
    expect(
      (await deleteLifestyleAdvice(otherPractitioner, walk.id, practitioner)).ok,
    ).toBe(false);
    expect(await active(patientId)).toContain(
      "physical_activity:Marcher 30 minutes",
    );
  });

  it("does not move a file that is still « à compléter »", async () => {
    const other = await newPatient("Dana", "to_complete");
    const result = await savePatientLifestyleAdvices(
      holder,
      other,
      practitioner,
      { added: [draft("hydration", "Boire 1,5 l")], edited: [] },
    );
    expect(result.ok).toBe(true);
    expect((await profiles().findById(other))?.fileStatus).toBe("to_complete");
  });
});
