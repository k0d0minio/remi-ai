import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import {
  acknowledgeGoalCheckIn,
  addGoalCheckIn,
  addPatientGoal,
} from "../patient-goals";
import {
  acknowledgeRecommendationCheckIn,
  addRecommendationCheckIn,
} from "../patient-recommendation-check-ins";
import { addPatientRecommendation } from "../patient-recommendations";
import { createPatient } from "../patients";
import { countCheckInsAwaitingAttention, listPatientCheckIns } from "./index";

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

const newPatient = async (pseudonym: string) => {
  const created = await createPatient({ pseudonym });
  if (!created.ok) {
    throw new Error(created.message);
  }
  return created.data;
};

const newGoal = async (patientId: string, title: string) => {
  const created = await addPatientGoal(patientId, { title });
  if (!created.ok) {
    throw new Error(created.message);
  }
  return created.data;
};

const newRecommendation = async (patientId: string, title: string) => {
  const created = await addPatientRecommendation(patientId, {
    category: "habit",
    title,
  });
  if (!created.ok) {
    throw new Error(created.message);
  }
  return created.data;
};

describe("the check-in picture for one patient", () => {
  it("carries both trails, newest answer first", async () => {
    const patient = await newPatient("Claire");
    const goal = await newGoal(patient.id, "Dormir mieux");
    const recommendation = await newRecommendation(patient.id, "Marcher");

    await addGoalCheckIn(
      goal.id,
      { checkedOn: "2026-09-10", direction: "stable" },
      "patient",
    );
    await addGoalCheckIn(
      goal.id,
      { checkedOn: "2026-09-14", direction: "better" },
      "patient",
    );
    await addRecommendationCheckIn(recommendation.id, {
      checkedOn: "2026-09-12",
      direction: "worse",
    });

    const picture = await listPatientCheckIns(patient.id);

    expect(picture.goals).toHaveLength(1);
    expect(picture.goals[0].checkIns.map((entry) => entry.checkedOn)).toEqual([
      "2026-09-14",
      "2026-09-10",
    ]);
    expect(picture.recommendations).toHaveLength(1);
    expect(picture.recommendations[0].checkIns[0].direction).toBe("worse");
  });
});

describe("what a « moins bien » is waiting on", () => {
  it("counts the patient's own unacknowledged worse answers, both kinds", async () => {
    const patient = await newPatient("Nadia");
    const goal = await newGoal(patient.id, "Moins de fringales");
    const recommendation = await newRecommendation(patient.id, "Hydratation");

    await addGoalCheckIn(
      goal.id,
      { checkedOn: "2026-09-14", direction: "worse" },
      "patient",
    );
    await addRecommendationCheckIn(recommendation.id, {
      checkedOn: "2026-09-14",
      direction: "worse",
    });

    expect(await countCheckInsAwaitingAttention(patient.id)).toBe(2);
  });

  it("ignores anything that is not a patient's « moins bien »", async () => {
    const patient = await newPatient("Sofia");
    const goal = await newGoal(patient.id, "Énergie");
    const recommendation = await newRecommendation(patient.id, "Sommeil");

    // Morgane's own check-in was never waiting on her, whichever way it went.
    await addGoalCheckIn(goal.id, {
      checkedOn: "2026-09-14",
      direction: "worse",
    });
    // A patient answer that is not a worsening raises nothing.
    await addGoalCheckIn(
      goal.id,
      { checkedOn: "2026-09-15", direction: "better" },
      "patient",
    );
    await addRecommendationCheckIn(recommendation.id, {
      checkedOn: "2026-09-15",
      direction: "stable",
    });

    expect(await countCheckInsAwaitingAttention(patient.id)).toBe(0);
  });

  it("stops counting an answer once « Vu » stamps it, and only that one", async () => {
    const patient = await newPatient("Lina");
    const goal = await newGoal(patient.id, "Digestion");
    const recommendation = await newRecommendation(patient.id, "Activité");

    const seen = await addGoalCheckIn(
      goal.id,
      { checkedOn: "2026-09-14", direction: "worse" },
      "patient",
    );
    const alsoWorse = await addRecommendationCheckIn(recommendation.id, {
      checkedOn: "2026-09-14",
      direction: "worse",
    });
    if (!seen.ok || !alsoWorse.ok) {
      throw new Error("the fixtures should have been written");
    }

    expect(await countCheckInsAwaitingAttention(patient.id)).toBe(2);

    await acknowledgeGoalCheckIn(seen.data.id);
    expect(await countCheckInsAwaitingAttention(patient.id)).toBe(1);

    await acknowledgeRecommendationCheckIn(alsoWorse.data.id);
    expect(await countCheckInsAwaitingAttention(patient.id)).toBe(0);
  });

  it("holds the stamp still when « Vu » is pressed twice", async () => {
    const patient = await newPatient("Ana");
    const goal = await newGoal(patient.id, "Stress");
    const written = await addGoalCheckIn(
      goal.id,
      { checkedOn: "2026-09-14", direction: "worse" },
      "patient",
    );
    if (!written.ok) {
      throw new Error("the fixture should have been written");
    }

    const first = await acknowledgeGoalCheckIn(written.data.id);
    const second = await acknowledgeGoalCheckIn(written.data.id);
    if (!first.ok || !second.ok) {
      throw new Error("acknowledging should succeed");
    }

    expect(second.data.acknowledgedAt).toEqual(first.data.acknowledgedAt);
    expect(await countCheckInsAwaitingAttention(patient.id)).toBe(0);
  });

  it("counts nothing for a patient with no answers at all", async () => {
    const patient = await newPatient("Yasmine");
    await newGoal(patient.id, "Rien encore");

    expect(await countCheckInsAwaitingAttention(patient.id)).toBe(0);
  });
});
