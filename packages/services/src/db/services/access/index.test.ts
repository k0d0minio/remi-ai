import { beforeAll, describe, expect, it } from "vitest";
import type { Id } from "../../../types";
import { registerDatabase } from "../../client";
import type { Actor } from "../../models/actor";
import type { PatientProfile } from "../../models/patient-profile";
import { createMemoryDatabase, practitionerActor } from "../../test-helpers";
import { listAuditEvents, recordAuditEvent } from "../audit";
import {
  countMealEntriesAwaitingFeedback,
  getMealEntry,
  listArchivedMealEntries,
  listMealEntries,
  updateMealEntry,
  addMealEntry,
} from "../meal-entries";
import {
  addPantryEssential,
  listArchivedPantryEssentials,
  listPantryEssentials,
} from "../pantry-essentials";
import {
  listPatientAnamnesis,
  setPatientAnamnesis,
} from "../patient-anamnesis";
import {
  getCurrentChallenge,
  listChallengeSignals,
  listPastChallenges,
  startChallenge,
} from "../patient-challenges";
import { consentsOf } from "../patient-consents";
import {
  addPatientDocumentLink,
  getPatientDocument,
  listPatientDocuments,
} from "../patient-documents";
import {
  addGoalCheckIn,
  addPatientGoal,
  countGoalCheckInsAwaitingAttention,
  getWeeklyCheckIn,
  listArchivedPatientGoals,
  listGoalCheckIns,
  listGoalScoreStrips,
  listPatientGoals,
} from "../patient-goals";
import {
  getPatientInstruction,
  listArchivedPatientInstructions,
  setPatientInstruction,
} from "../patient-instructions";
import {
  countUnreadPatientMessages,
  listPatientMessages,
  listUnreadMessageCounts,
  sendPatientMessage,
} from "../patient-messages";
import { addPatientNote, listPatientNotes } from "../patient-notes";
import {
  addPatientObservation,
  listArchivedPatientObservations,
  listPatientLearnings,
  listPatientObservations,
} from "../patient-observations";
import {
  getPatientQuestionnaire,
  missingQuestionnaireFields,
  savePatientQuestionnaire,
} from "../patient-questionnaire";
import {
  addPatientRecommendation,
  listArchivedPatientRecommendations,
  listPatientRecommendations,
  updatePatientRecommendation,
} from "../patient-recommendations";
import { getPatientSummary, setPatientSummary } from "../patient-summaries";
import {
  addPatientSupplement,
  listArchivedPatientSupplements,
  listPatientSupplements,
} from "../patient-supplements";
import {
  createPatient,
  getPatient,
  patientListOf,
  patientOf,
  patientsOf,
  updatePatient,
} from "../patients";
import {
  assignRecipes,
  listArchivedPatientRecipes,
  listPatientRecipes,
} from "../recipe-assignments";
import { createRecipe } from "../recipes";
import {
  adminOpenablePatient,
  operatorActor,
  patientActor,
  systemActor,
} from "./index";

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

const unwrapOk = <T>(
  result: { ok: true; data: T } | { ok: false; message: string },
): T => {
  if (!result.ok) {
    throw new Error(`expected ok, got ${result.message}`);
  }
  return result.data;
};

/** Two practitioners, one file each. The rows below sit in Alice's file. */
const alice = "00000000-0000-4000-8000-00000000a11c";
const bruno = "00000000-0000-4000-8000-00000000b2a0";
const remiAdmin = "00000000-0000-4000-8000-00000000ad00";

type Fixture = {
  file: PatientProfile;
  otherFile: PatientProfile;
  goalId: Id;
  mealEntryId: Id;
  documentId: Id;
  recommendationId: Id;
};

let fixture: Fixture;

beforeAll(async () => {
  const file = unwrapOk(
    await createPatient(systemActor, {
      practitionerId: alice,
      pseudonym: "Hirondelle",
    }),
  );
  const otherFile = unwrapOk(
    await createPatient(systemActor, {
      practitionerId: bruno,
      pseudonym: "Martinet",
    }),
  );
  const id = file.id;
  const recommendation = unwrapOk(
    await addPatientRecommendation(systemActor, id, {
      category: "nutrition",
      title: "Hydratation",
    }),
  );
  unwrapOk(await addPatientSupplement(systemActor, id, { name: "Magnésium" }));
  unwrapOk(await addPantryEssential(systemActor, id, { item: "Sardines" }));
  const meal = unwrapOk(
    await addMealEntry(
      systemActor,
      id,
      {
        eatenOn: "2026-11-01",
        intent: "eaten",
        slot: "dejeuner",
        description: "Salade",
      },
      "patient",
    ),
  );
  unwrapOk(
    await addPatientObservation(systemActor, id, {
      body: "Moins de fatigue",
      observedOn: "2026-11-01",
    }),
  );
  const goal = unwrapOk(
    await addPatientGoal(systemActor, id, {
      title: "Sommeil",
      baseline: "4/10",
    }),
  );
  unwrapOk(
    await addGoalCheckIn(
      systemActor,
      id,
      goal.id,
      { checkedOn: "2026-11-01", direction: "better" },
      "patient",
    ),
  );
  unwrapOk(
    await startChallenge(systemActor, id, {
      text: "Un verre d'eau au réveil",
      why: "",
      startedOn: "2026-11-01",
    }),
  );
  unwrapOk(await sendPatientMessage(systemActor, id, "Bonjour"));
  const recipe = unwrapOk(
    await createRecipe({ title: "Sardines au four", body: "En prose." }),
  );
  unwrapOk(
    await assignRecipes(systemActor, id, [recipe.id], {
      note: "",
      assignedOn: "2026-11-01",
    }),
  );
  unwrapOk(
    await addPatientNote(systemActor, id, {
      occurredAt: "2026-11-01",
      title: "Première consultation",
      body: "Anamnèse prise.",
    }),
  );
  const document = unwrapOk(
    await addPatientDocumentLink(
      systemActor,
      id,
      { title: "Liste", url: "https://example.org/liste", tag: "document" },
      "alice@example.org",
    ),
  );
  unwrapOk(
    await setPatientInstruction(systemActor, id, {
      body: "Priorité énergie",
      patientBody: "",
    }),
  );
  unwrapOk(
    await setPatientAnamnesis(systemActor, id, "digestion", "Ballonnements."),
  );
  unwrapOk(await setPatientSummary(systemActor, id, "Contexte : fatigue."));
  unwrapOk(
    await savePatientQuestionnaire(systemActor, id, {
      consultationReason: "Fatigue après les repas.",
    }),
  );
  fixture = {
    file,
    otherFile,
    goalId: goal.id,
    mealEntryId: meal.id,
    documentId: document.id,
    recommendationId: recommendation.id,
  };
});

/**
 * What a refused read returns: an empty list, no row, a zero, a failed
 * `Result`, an empty map of consents, or a weekly question with no answer.
 */
const isRefused = (value: unknown): boolean => {
  if (value === null || value === 0) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if ("ok" in record) {
      return record.ok === false;
    }
    if ("lastOn" in record) {
      return record.lastOn === null;
    }
    return Object.keys(record).length === 0;
  }
  return false;
};

/**
 * Every service function that reads patient data, called on Alice's file
 * (story 3, criterion 5). Each one is one case of the table.
 */
const reads: Record<string, (actor: Actor) => Promise<unknown>> = {
  getPatient: (actor) => getPatient(actor, fixture.file.id),
  patientOf: (actor) => patientOf(actor, fixture.file.id),
  listPatientRecommendations: (actor) =>
    listPatientRecommendations(actor, fixture.file.id),
  listArchivedPatientRecommendations: (actor) =>
    listArchivedPatientRecommendations(actor, fixture.file.id),
  listPatientSupplements: (actor) =>
    listPatientSupplements(actor, fixture.file.id),
  listArchivedPatientSupplements: (actor) =>
    listArchivedPatientSupplements(actor, fixture.file.id),
  listPantryEssentials: (actor) => listPantryEssentials(actor, fixture.file.id),
  listArchivedPantryEssentials: (actor) =>
    listArchivedPantryEssentials(actor, fixture.file.id),
  listMealEntries: (actor) => listMealEntries(actor, fixture.file.id),
  listArchivedMealEntries: (actor) =>
    listArchivedMealEntries(actor, fixture.file.id),
  countMealEntriesAwaitingFeedback: (actor) =>
    countMealEntriesAwaitingFeedback(actor, fixture.file.id),
  getMealEntry: (actor) => getMealEntry(actor, fixture.mealEntryId),
  listPatientObservations: (actor) =>
    listPatientObservations(actor, fixture.file.id),
  listArchivedPatientObservations: (actor) =>
    listArchivedPatientObservations(actor, fixture.file.id),
  listPatientLearnings: (actor) => listPatientLearnings(actor, fixture.file.id),
  listPatientGoals: (actor) => listPatientGoals(actor, fixture.file.id),
  listArchivedPatientGoals: (actor) =>
    listArchivedPatientGoals(actor, fixture.file.id),
  listGoalCheckIns: (actor) => listGoalCheckIns(actor, fixture.goalId),
  listGoalScoreStrips: (actor) => listGoalScoreStrips(actor, fixture.file.id),
  countGoalCheckInsAwaitingAttention: (actor) =>
    countGoalCheckInsAwaitingAttention(actor, fixture.file.id),
  getWeeklyCheckIn: (actor) =>
    getWeeklyCheckIn(actor, fixture.file.id, "2026-11-02"),
  getCurrentChallenge: (actor) => getCurrentChallenge(actor, fixture.file.id),
  listPastChallenges: (actor) => listPastChallenges(actor, fixture.file.id),
  listPatientMessages: (actor) => listPatientMessages(actor, fixture.file.id),
  countUnreadPatientMessages: (actor) =>
    countUnreadPatientMessages(actor, fixture.file.id),
  listPatientRecipes: (actor) => listPatientRecipes(actor, fixture.file.id),
  listArchivedPatientRecipes: (actor) =>
    listArchivedPatientRecipes(actor, fixture.file.id),
  listPatientNotes: (actor) => listPatientNotes(actor, fixture.file.id),
  listPatientDocuments: (actor) => listPatientDocuments(actor, fixture.file.id),
  getPatientDocument: (actor) => getPatientDocument(actor, fixture.documentId),
  getPatientInstruction: (actor) =>
    getPatientInstruction(actor, fixture.file.id),
  listArchivedPatientInstructions: (actor) =>
    listArchivedPatientInstructions(actor, fixture.file.id),
  listPatientAnamnesis: (actor) => listPatientAnamnesis(actor, fixture.file.id),
  getPatientSummary: (actor) => getPatientSummary(actor, fixture.file.id),
  getPatientQuestionnaire: (actor) =>
    getPatientQuestionnaire(actor, fixture.file.id),
  missingQuestionnaireFields: (actor) =>
    missingQuestionnaireFields(actor, fixture.file.id),
  consentsOf: (actor) => consentsOf(actor, fixture.file.id),
};

/** The reads whose answer for Alice is not empty, so a pass proves the read. */
const nonEmptyForHolder = [
  "getPatient",
  "patientOf",
  "listPatientRecommendations",
  "listPatientSupplements",
  "listPantryEssentials",
  "listMealEntries",
  "countMealEntriesAwaitingFeedback",
  "getMealEntry",
  "listPatientObservations",
  "listPatientGoals",
  "listGoalCheckIns",
  "getWeeklyCheckIn",
  "getCurrentChallenge",
  "listPatientMessages",
  "countUnreadPatientMessages",
  "listPatientRecipes",
  "listPatientNotes",
  "listPatientDocuments",
  "getPatientDocument",
  "getPatientInstruction",
  "listPatientAnamnesis",
  "getPatientSummary",
  "getPatientQuestionnaire",
];

describe("a practitioner reads only their own patients", () => {
  it.each(Object.keys(reads))(
    "%s refuses another practitioner",
    async (name) => {
      expect(isRefused(await reads[name](practitionerActor(bruno)))).toBe(true);
    },
  );

  it.each(nonEmptyForHolder)(
    "%s answers the holding practitioner",
    async (name) => {
      expect(isRefused(await reads[name](practitionerActor(alice)))).toBe(
        false,
      );
    },
  );

  it("lists only the practitioner's own files", async () => {
    const listed = await patientsOf(practitionerActor(bruno));
    expect(listed.map((file) => file.id)).toEqual([fixture.otherFile.id]);
    const rows = await patientListOf(practitionerActor(bruno), {
      scope: "all",
    });
    expect(rows.map((file) => file.id)).toEqual([fixture.otherFile.id]);
  });

  it("shows no signal of another practitioner's patient", async () => {
    expect(
      (await listUnreadMessageCounts(practitionerActor(bruno))).has(
        fixture.file.id,
      ),
    ).toBe(false);
    expect(
      (await listUnreadMessageCounts(practitionerActor(alice))).get(
        fixture.file.id,
      ),
    ).toBe(1);
    expect(
      (await listChallengeSignals(practitionerActor(bruno))).has(
        fixture.file.id,
      ),
    ).toBe(false);
  });

  it("refuses a write into another practitioner's file", async () => {
    const refused = await updatePatientRecommendation(
      practitionerActor(bruno),
      fixture.recommendationId,
      { category: "nutrition", title: "Changé" },
    );
    expect(refused.ok).toBe(false);
    expect(
      (
        await updatePatient(practitionerActor(bruno), fixture.file.id, {
          objective: "changé",
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await createPatient(practitionerActor(bruno), {
          practitionerId: alice,
          pseudonym: "Intrus",
        })
      ).ok,
    ).toBe(false);
  });
});

describe("an admin opens a file with a reason, read-only", () => {
  const admin = (opened: readonly Id[] = []) =>
    operatorActor({ id: remiAdmin, role: "admin" }, opened);

  it("reads nothing before the open", async () => {
    expect((await patientOf(admin(), fixture.file.id)).ok).toBe(false);
    expect(await listPatientRecommendations(admin(), fixture.file.id)).toEqual(
      [],
    );
  });

  it("may open any file, and a practitioner may open none", async () => {
    expect(
      unwrapOk(await adminOpenablePatient(admin(), fixture.file.id)).pseudonym,
    ).toBe("Hirondelle");
    expect(
      (await adminOpenablePatient(practitionerActor(bruno), fixture.file.id))
        .ok,
    ).toBe(false);
  });

  it("reads the opened file", async () => {
    const opened = admin([fixture.file.id]);
    for (const name of nonEmptyForHolder) {
      expect(isRefused(await reads[name](opened))).toBe(false);
    }
  });

  it("writes nothing into the opened file", async () => {
    const opened = admin([fixture.file.id]);
    expect(
      (
        await updatePatientRecommendation(opened, fixture.recommendationId, {
          category: "nutrition",
          title: "Changé",
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await updateMealEntry(opened, fixture.mealEntryId, {
          eatenOn: "2026-11-01",
          intent: "eaten",
          slot: "diner",
          description: "Soupe",
        })
      ).ok,
    ).toBe(false);
  });

  it("lists every file only when it asks for all", async () => {
    const mine = await patientListOf(admin(), {});
    expect(mine).toEqual([]);
    const all = await patientListOf(admin(), { scope: "all" });
    expect(all.map((file) => file.id).sort()).toEqual(
      [fixture.file.id, fixture.otherFile.id].sort(),
    );
  });

  it("never passes its open list to a practitioner", () => {
    const actor = operatorActor({ id: bruno, role: "practitioner" }, [
      fixture.file.id,
    ]);
    expect(actor.kind === "operator" && actor.openedPatientIds).toEqual([]);
  });
});

describe("a patient session reaches only its own rows", () => {
  it.each(Object.keys(reads))("%s refuses another patient", async (name) => {
    expect(
      isRefused(await reads[name](patientActor(fixture.otherFile.id))),
    ).toBe(true);
  });

  it("reads its own file", async () => {
    const own = patientActor(fixture.file.id);
    expect(unwrapOk(await getPatient(own, fixture.file.id)).id).toBe(
      fixture.file.id,
    );
    expect(await listPatientRecommendations(own, fixture.file.id)).toHaveLength(
      1,
    );
  });

  it("writes nothing into another patient's file", async () => {
    const other = patientActor(fixture.otherFile.id);
    expect(
      (await sendPatientMessage(other, fixture.file.id, "Intrus")).ok,
    ).toBe(false);
    expect(
      (
        await addMealEntry(
          other,
          fixture.file.id,
          {
            eatenOn: "2026-11-02",
            intent: "eaten",
            slot: "diner",
            description: "Intrus",
          },
          "patient",
        )
      ).ok,
    ).toBe(false);
  });
});

describe("the journal of a practitioner", () => {
  it("hides the events on another practitioner's files", async () => {
    await recordAuditEvent({
      actor: { id: alice, email: "alice@example.org", name: "Alice" },
      action: "patient.updated",
      targetType: "patient",
      targetId: fixture.file.id,
      targetLabel: "Hirondelle",
    });
    await recordAuditEvent({
      actor: { id: remiAdmin, email: "remi@example.org", name: "REMI" },
      action: "patient.admin_opened",
      targetType: "patient",
      targetId: fixture.file.id,
      targetLabel: "Hirondelle",
      detail: "Support technique",
    });
    const brunos = await listAuditEvents(practitionerActor(bruno));
    expect(brunos.some((event) => event.targetId === fixture.file.id)).toBe(
      false,
    );
    const alices = await listAuditEvents(practitionerActor(alice));
    expect(
      alices.some(
        (event) =>
          event.action === "patient.admin_opened" &&
          event.detail === "Support technique",
      ),
    ).toBe(true);
    const admins = await listAuditEvents(
      operatorActor({ id: remiAdmin, role: "admin" }),
      { action: "patient.admin_opened" },
    );
    expect(admins.map((event) => event.actorName)).toEqual(["REMI"]);
  });
});
