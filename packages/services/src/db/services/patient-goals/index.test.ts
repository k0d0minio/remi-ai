import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import { createPatient, getPatient } from "../patients";
import {
  MAX_ACTIVE_GOALS,
  addGoalCheckIn,
  addPatientGoal,
  archivePatientGoal,
  countGoalCheckInsAwaitingAttention,
  deleteGoalCheckIn,
  deletePatientGoal,
  getWeeklyCheckIn,
  listArchivedPatientGoals,
  listGoalCheckIns,
  listGoalScoreStrips,
  listPatientGoals,
  markGoalCheckInSeen,
  movePatientGoal,
  recordWeeklyCheckIn,
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
    // Her consultation check-in. The patient's own in-page answer shares this
    // table and is told apart by this column.
    expect(trail.every((entry) => entry.writtenBy === "practitioner")).toBe(
      true,
    );
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

/**
 * The patient's weekly 0–5 per goal (D-30 to D-33), asserted from the spec's
 * acceptance criteria. Each test takes a patient of its own: the window is a
 * property of the patient, and a shared one would make the order matter.
 */
describe("the weekly check-in", () => {
  const freshPatient = async (goalTitles: readonly string[]) => {
    const created = await createPatient({ pseudonym: "Inès" });
    if (!created.ok) {
      throw new Error("test patient not created");
    }
    const goals = [];
    for (const title of goalTitles) {
      const goal = await addPatientGoal(created.data.id, { title });
      if (!goal.ok) {
        throw new Error(`goal "${title}" refused`);
      }
      goals.push(goal.data);
    }
    return { id: created.data.id, goals };
  };

  it("is open until the patient answers, then closed for the week", async () => {
    const patient = await freshPatient(["Moins de fringales"]);
    expect((await getWeeklyCheckIn(patient.id, "2026-10-01")).due).toBe(true);

    await recordWeeklyCheckIn(
      patient.id,
      [{ goalId: patient.goals[0].id, score: 3 }],
      "2026-10-01",
    );

    expect(await getWeeklyCheckIn(patient.id, "2026-10-05")).toEqual({
      due: false,
      lastOn: "2026-10-01",
      nextOn: "2026-10-08",
    });
    expect((await getWeeklyCheckIn(patient.id, "2026-10-08")).due).toBe(true);
  });

  it("writes one patient row per rated goal, and nothing for an unrated one", async () => {
    const patient = await freshPatient(["Énergie", "Ballonnements"]);
    const [energy, bloating] = patient.goals;

    const result = await recordWeeklyCheckIn(
      patient.id,
      [
        { goalId: energy.id, score: 4, note: "  mieux dormi  " },
        { goalId: bloating.id, score: null },
      ],
      "2026-10-01",
    );

    expect(result.ok).toBe(true);
    const [row] = await listGoalCheckIns(energy.id);
    expect(row).toMatchObject({
      checkedOn: "2026-10-01",
      score: 4,
      note: "mieux dormi",
      writtenBy: "patient",
      direction: null,
      seenAt: null,
    });
    expect(await listGoalCheckIns(bloating.id)).toHaveLength(0);
  });

  it("refuses a submission that rates nothing, and writes nothing", async () => {
    const patient = await freshPatient(["Énergie"]);
    const result = await recordWeeklyCheckIn(
      patient.id,
      [{ goalId: patient.goals[0].id, note: "rien à dire" }],
      "2026-10-01",
    );

    expect(result.ok).toBe(false);
    expect(await listGoalCheckIns(patient.goals[0].id)).toHaveLength(0);
  });

  it("refuses a score outside 0–5", async () => {
    const patient = await freshPatient(["Énergie"]);
    for (const score of [-1, 6, 2.5]) {
      const result = await recordWeeklyCheckIn(
        patient.id,
        [{ goalId: patient.goals[0].id, score }],
        "2026-10-01",
      );
      expect(result.ok).toBe(false);
    }
    expect(await listGoalCheckIns(patient.goals[0].id)).toHaveLength(0);
  });

  it("refuses a goal that is not this patient's, before writing any row", async () => {
    const mine = await freshPatient(["Énergie"]);
    const theirs = await freshPatient(["Sommeil"]);

    const result = await recordWeeklyCheckIn(
      mine.id,
      [
        { goalId: mine.goals[0].id, score: 3 },
        { goalId: theirs.goals[0].id, score: 1 },
      ],
      "2026-10-01",
    );

    expect(result).toMatchObject({ ok: false, error: "not_found" });
    expect(await listGoalCheckIns(mine.goals[0].id)).toHaveLength(0);
    expect(await listGoalCheckIns(theirs.goals[0].id)).toHaveLength(0);
  });

  it("writes nothing on a second submission inside the week", async () => {
    const patient = await freshPatient(["Énergie"]);
    const goalId = patient.goals[0].id;
    await recordWeeklyCheckIn(patient.id, [{ goalId, score: 3 }], "2026-10-01");

    const again = await recordWeeklyCheckIn(
      patient.id,
      [{ goalId, score: 1 }],
      "2026-10-03",
    );

    expect(again).toMatchObject({ ok: false, error: "conflict" });
    expect(await listGoalCheckIns(goalId)).toHaveLength(1);
  });

  it("reads each score against the goal's previous patient score", async () => {
    const patient = await freshPatient(["Énergie"]);
    const goalId = patient.goals[0].id;
    // Her consultation row carries no score, so it is never the baseline.
    await addGoalCheckIn(goalId, { checkedOn: "2026-10-02", measure: "4/10" });

    const weeks: [string, number][] = [
      ["2026-10-01", 3],
      ["2026-10-08", 3],
      ["2026-10-15", 1],
      ["2026-10-22", 4],
    ];
    for (const [day, score] of weeks) {
      await recordWeeklyCheckIn(patient.id, [{ goalId, score }], day);
    }

    const byDay = (await listGoalCheckIns(goalId))
      .filter((row) => row.writtenBy === "patient")
      .map((row) => [row.checkedOn, row.direction]);
    expect(byDay).toEqual([
      ["2026-10-22", "better"],
      ["2026-10-15", "worse"],
      ["2026-10-08", "stable"],
      ["2026-10-01", null],
    ]);
  });

  it("gives each active goal a strip of its last twelve scores, oldest first", async () => {
    const patient = await freshPatient(["Énergie", "Sommeil"]);
    const [energy, sleep] = patient.goals;
    let day = "2026-01-01";
    for (let week = 0; week < 14; week += 1) {
      await recordWeeklyCheckIn(
        patient.id,
        [{ goalId: energy.id, score: week % 6 }],
        day,
      );
      day = new Date(new Date(`${day}T00:00:00Z`).getTime() + 7 * 864e5)
        .toISOString()
        .slice(0, 10);
    }

    const strips = await listGoalScoreStrips(patient.id);

    expect(strips.map((strip) => strip.goalId)).toEqual([energy.id, sleep.id]);
    expect(strips[0].scores).toHaveLength(12);
    expect(strips[0].scores[0].checkedOn).toBe("2026-01-15");
    expect(strips[0].scores.at(-1)?.checkedOn).toBe("2026-04-02");
    expect(strips[1].scores).toEqual([]);
  });

  it("counts a patient's unseen lower score until she marks it seen", async () => {
    const patient = await freshPatient(["Énergie"]);
    const goalId = patient.goals[0].id;
    await recordWeeklyCheckIn(patient.id, [{ goalId, score: 4 }], "2026-10-01");
    await recordWeeklyCheckIn(patient.id, [{ goalId, score: 2 }], "2026-10-08");
    // Her own row saying "worse" is hers — it never waits for her.
    await addGoalCheckIn(goalId, {
      checkedOn: "2026-10-09",
      direction: "worse",
    });

    expect(await countGoalCheckInsAwaitingAttention(patient.id)).toBe(1);

    const worse = (await listGoalCheckIns(goalId)).find(
      (row) => row.writtenBy === "patient" && row.direction === "worse",
    );
    const seen = await markGoalCheckInSeen(worse?.id ?? "");
    expect(seen.ok && seen.data.seenAt).toBeInstanceOf(Date);
    expect(await countGoalCheckInsAwaitingAttention(patient.id)).toBe(0);

    const again = await markGoalCheckInSeen(worse?.id ?? "");
    expect(again.ok && again.data.seenAt).toEqual(seen.ok && seen.data.seenAt);
  });

  it("leaves her consultation check-ins without a score", async () => {
    const patient = await freshPatient(["Énergie"]);
    const created = await addGoalCheckIn(patient.goals[0].id, {
      checkedOn: "2026-10-01",
      direction: "better",
    });

    expect(created.ok && created.data).toMatchObject({
      score: null,
      seenAt: null,
      writtenBy: "practitioner",
    });
    // Her row does not close the patient's weekly question.
    expect((await getWeeklyCheckIn(patient.id, "2026-10-02")).due).toBe(true);
  });
});
