import { beforeAll, describe, expect, it } from "vitest";
import { getDatabase, registerDatabase } from "../db/client";
import { systemActor } from "../db/services/access";
import { createPatient } from "../db/services/patients";
import { createMemoryDatabase, testPractitionerId } from "../db/test-helpers";
import { loadPatientSafety } from "./patient-safety";

type Answers = { pathologies: string | null; celiacDisease: boolean | null };

const newPatient = async (pseudonym: string, answers: Answers) => {
  const created = await createPatient(systemActor, {
    practitionerId: testPractitionerId,
    pseudonym,
  });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  await getDatabase()
    .collection<{ id: string } & Answers>("patient_profiles")
    .update(created.data.id, answers);
  return created.data.id;
};

const coeliacFlagOf = async (patientId: string) => {
  const loaded = await loadPatientSafety(systemActor, patientId);
  if (!loaded.ok) {
    throw new Error(loaded.message);
  }
  return loaded.data.safety.celiacDisease;
};

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

describe("the coeliac flag that the compatibility gate reads (REM-165)", () => {
  it("is set while a mention waits for the practitioner's answer", async () => {
    const id = await newPatient("Mention", {
      pathologies: "Hypothyroïdie, maladie cœliaque",
      celiacDisease: null,
    });
    expect(await coeliacFlagOf(id)).toBe(true);
  });

  it("is set for « pas de maladie cœliaque » with no answer", async () => {
    const id = await newPatient("Negation", {
      pathologies: "pas de maladie cœliaque",
      celiacDisease: null,
    });
    expect(await coeliacFlagOf(id)).toBe(true);
  });

  it("is lifted by the practitioner's « Non »", async () => {
    const id = await newPatient("Non", {
      pathologies: "maladie cœliaque",
      celiacDisease: false,
    });
    expect(await coeliacFlagOf(id)).toBe(false);
  });

  it("stays set after the practitioner's « Oui »", async () => {
    const id = await newPatient("Oui", {
      pathologies: null,
      celiacDisease: true,
    });
    expect(await coeliacFlagOf(id)).toBe(true);
  });

  it("stays unanswered with no mention", async () => {
    const id = await newPatient("None", {
      pathologies: "Diabète de type 2",
      celiacDisease: null,
    });
    expect(await coeliacFlagOf(id)).toBeNull();
  });
});
