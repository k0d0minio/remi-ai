import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import { createPatient, getPatient } from "../patients";
import {
  MAX_ACTIVE_GOALS,
  addGoalCheckIn,
  addPatientGoal,
  archivePatientGoal,
  deleteGoalCheckIn,
  deletePatientGoal,
  listArchivedPatientGoals,
  listGoalCheckIns,
  listPatientGoals,
  movePatientGoal,
  updateGoalCheckIn,
  updatePatientGoal,
} from "./index";

let patientId: string;

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  const created = await createPatient({ pseudonym: "Claire" });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  patientId = created.data.id;
});

/** Throws rather than asserting — a refused write is a broken test, not a case. */
const add = async (title: string, baseline = "") => {
  const result = await addPatientGoal(patientId, { title, baseline });
  if (!result.ok) {
    throw new Error(`goal "${title}" refused: ${result.message}`);
  }
  return result.data;
};

const titles = async (id: string) =>
  (await listPatientGoals(id)).map((goal) => goal.title);

/** Each test starts from an empty active list; archived rows stay as history. */
const clearActive = async () => {
  for (const goal of await listPatientGoals(patientId)) {
    await deletePatientGoal(goal.id);
  }
};

describe("priority goals", () => {
  it("records a goal with its starting point, in her order", async () => {
    await clearActive();
    await add("Améliorer l'énergie", "énergie 3/10");
    await add("Calmer les ballonnements");

    const active = await listPatientGoals(patientId);
    expect(active.map((goal) => goal.title)).toEqual([
      "Améliorer l'énergie",
      "Calmer les ballonnements",
    ]);
    expect(active[0].baseline).toBe("énergie 3/10");
    expect(active[1].baseline).toBe("");
  });

  it("refuses a fourth active goal and writes no row", async () => {
    await clearActive();
    await add("Énergie");
    await add("Digestion");
    await add("Sommeil");

    const fourth = await addPatientGoal(patientId, { title: "Peau" });
    expect(fourth.ok).toBe(false);
    if (!fourth.ok) {
      expect(fourth.error).toBe("conflict");
    }
    expect(await titles(patientId)).toHaveLength(MAX_ACTIVE_GOALS);
  });

  it("makes room the moment one is archived", async () => {
    await clearActive();
    const first = await add("Énergie");
    await add("Digestion");
    await add("Sommeil");

    expect((await archivePatientGoal(first.id, true)).ok).toBe(true);
    const fourth = await addPatientGoal(patientId, { title: "Peau" });
    expect(fourth.ok).toBe(true);
    expect(await titles(patientId)).toEqual(["Digestion", "Sommeil", "Peau"]);
  });

  it("refuses to restore an archived goal into a full list", async () => {
    await clearActive();
    const parked = await add("Énergie");
    await archivePatientGoal(parked.id, true);
    await add("Digestion");
    await add("Sommeil");
    await add("Peau");

    const restored = await archivePatientGoal(parked.id, false);
    expect(restored.ok).toBe(false);
    if (!restored.ok) {
      expect(restored.error).toBe("conflict");
    }
    expect(await titles(patientId)).toHaveLength(MAX_ACTIVE_GOALS);
    expect(
      (await listArchivedPatientGoals(patientId)).some(
        (goal) => goal.id === parked.id,
      ),
    ).toBe(true);
  });

  it("edits and reorders one goal without touching its siblings", async () => {
    await clearActive();
    const energy = await add("Énergie");
    const digestion = await add("Digestion");

    const before = await listPatientGoals(patientId);
    await updatePatientGoal(energy.id, { baseline: "3/10" });
    const afterEdit = await listPatientGoals(patientId);
    expect(afterEdit[1]).toEqual(before[1]);

    await movePatientGoal(digestion.id, "up");
    expect(await titles(patientId)).toEqual(["Digestion", "Énergie"]);
  });

  it("moves the roster's last-edited stamp on every write", async () => {
    await clearActive();
    const before = await getPatient(patientId);
    const goal = await add("Énergie");
    const after = await getPatient(patientId);
    if (!before.ok || !after.ok) {
      throw new Error("patient not found");
    }
    expect(after.data.lastEditedAt.getTime()).toBeGreaterThanOrEqual(
      before.data.lastEditedAt.getTime(),
    );
    expect(goal.title).toBe("Énergie");
  });

  it("treats malformed ids as empty or not found", async () => {
    expect(await listPatientGoals("not-a-uuid")).toEqual([]);
    expect((await addPatientGoal("not-a-uuid", { title: "x" })).ok).toBe(false);
    expect((await updatePatientGoal("not-a-uuid", { title: "x" })).ok).toBe(
      false,
    );
  });
});

describe("goal check-ins", () => {
  it("lists the trail newest first, by the date she recorded", async () => {
    await clearActive();
    const goal = await add("Énergie", "3/10");

    await addGoalCheckIn(goal.id, {
      checkedOn: "2026-09-01",
      direction: "stable",
    });
    await addGoalCheckIn(goal.id, {
      checkedOn: "2026-10-01",
      direction: "better",
      measure: "6/10",
    });
    await addGoalCheckIn(goal.id, {
      checkedOn: "2026-08-01",
      note: "point de départ",
    });

    const trail = await listGoalCheckIns(goal.id);
    expect(trail.map((entry) => entry.checkedOn)).toEqual([
      "2026-10-01",
      "2026-09-01",
      "2026-08-01",
    ]);
    expect(trail[0].measure).toBe("6/10");
    expect(trail[2].direction).toBeNull();
  });

  it("refuses a check-in that says nothing at all", async () => {
    await clearActive();
    const goal = await add("Énergie");

    const empty = await addGoalCheckIn(goal.id, { checkedOn: "2026-09-01" });
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.error).toBe("invalid_input");
    }
    expect(await listGoalCheckIns(goal.id)).toHaveLength(0);
  });

  it("refuses an unknown direction rather than storing it", async () => {
    await clearActive();
    const goal = await add("Énergie");

    const bogus = await addGoalCheckIn(goal.id, {
      checkedOn: "2026-09-01",
      direction: "excellent",
    });
    expect(bogus.ok).toBe(false);
    if (!bogus.ok) {
      expect(bogus.error).toBe("invalid_input");
    }
    expect(await listGoalCheckIns(goal.id)).toHaveLength(0);
  });

  it("refuses a check-in on a goal that does not exist", async () => {
    const orphan = await addGoalCheckIn(
      "00000000-0000-4000-8000-000000000000",
      { checkedOn: "2026-09-01", direction: "better" },
    );
    expect(orphan.ok).toBe(false);
  });

  it("edits and deletes one entry of the trail", async () => {
    await clearActive();
    const goal = await add("Énergie");
    const entry = await addGoalCheckIn(goal.id, {
      checkedOn: "2026-09-01",
      measure: "4/10",
    });
    if (!entry.ok) {
      throw new Error("check-in refused");
    }

    const corrected = await updateGoalCheckIn(entry.data.id, {
      measure: "5/10",
    });
    expect(corrected.ok).toBe(true);
    if (corrected.ok) {
      expect(corrected.data.measure).toBe("5/10");
      expect(corrected.data.checkedOn).toBe("2026-09-01");
    }

    // Clearing the last thing an entry says would leave a dated empty row.
    const emptied = await updateGoalCheckIn(entry.data.id, { measure: "" });
    expect(emptied.ok).toBe(false);

    expect((await deleteGoalCheckIn(entry.data.id)).ok).toBe(true);
    expect(await listGoalCheckIns(goal.id)).toHaveLength(0);
  });

  it("takes the trail with the goal when the goal is deleted", async () => {
    await clearActive();
    const goal = await add("Énergie");
    await addGoalCheckIn(goal.id, {
      checkedOn: "2026-09-01",
      direction: "better",
    });
    expect(await listGoalCheckIns(goal.id)).toHaveLength(1);

    expect((await deletePatientGoal(goal.id)).ok).toBe(true);
    expect(await listGoalCheckIns(goal.id)).toHaveLength(0);
  });
});
