import { beforeAll, describe, expect, it } from "vitest";
import {
  activityLevelDetails,
  activityLevels,
  allergenLabels,
  allergens,
  allergenSubLabels,
  allergenSubLists,
  dietLabels,
  diets,
  intoleranceLabels,
  intolerances,
} from "../../../shared/questionnaire";
import { getDatabase, registerDatabase } from "../../client";
import { createMemoryDatabase, testPractitionerId } from "../../test-helpers";
import { listAuditEvents } from "../audit";
import { recordConsent } from "../patient-consents";
import { createPatient, getPatient, updatePatient } from "../patients";
import {
  checkAllergenAnswer,
  checkQuestionnaireInput,
  getPatientQuestionnaire,
  macroProfileOf,
  markReadyWhenComplete,
  missingQuestionnaireFields,
  savePatientProfileAnswers,
  savePatientQuestionnaire,
  setPatientAllergens,
} from "./index";
import { systemActor } from "../../services/access";

let patientId: string;

const newPatient = async (pseudonym: string) => {
  const created = await createPatient(systemActor, {
    practitionerId: testPractitionerId,
    pseudonym,
    sex: "other",
  });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  return created.data;
};

/** One decision of the patient, on the current version 1 text. */
const decide = async (
  patient: { id: string; pseudonym: string },
  key: "care" | "genetic",
  decision: "given" | "refused" | "withdrawn",
) => {
  const recorded = await recordConsent(systemActor, {
    patientId: patient.id,
    key,
    version: "1",
    locale: "fr-BE",
    decision,
    actor: { kind: "patient", id: patient.id, name: patient.pseudonym },
  });
  if (!recorded.ok) {
    throw new Error(recorded.message);
  }
};

/** Two rows share a millisecond otherwise, and the latest is chosen by time. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  const claire = await newPatient("Claire");
  patientId = claire.id;
  // Claire gave both consents: the answers below are about storage, not consent.
  await decide(claire, "care", "given");
  await decide(claire, "genetic", "given");
});

const unwrapOk = <T>(result: { ok: true; data: T } | { ok: false }): T => {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error("unreachable");
  }
  return result.data;
};

const errorOf = (result: { ok: boolean; error?: string }) =>
  result.ok ? null : result.error;

describe("the questionnaire vocabulary", () => {
  it("gives every key a French label", () => {
    const tables = [
      [diets, dietLabels],
      [allergens, allergenLabels],
      [intolerances, intoleranceLabels],
    ] as const;
    for (const [keys, labels] of tables) {
      for (const key of keys) {
        const label = (labels as Record<string, { fr: string }>)[key];
        expect(label.fr.length).toBeGreaterThan(0);
      }
    }
    for (const [category, keys] of Object.entries(allergenSubLists)) {
      const labels = allergenSubLabels[
        category as keyof typeof allergenSubLabels
      ] as Record<string, { fr: string }>;
      for (const key of keys) {
        expect(labels[key].fr.length).toBeGreaterThan(0);
      }
    }
  });

  it("carries the story's NAP coefficient on each activity level", () => {
    expect(
      activityLevels.map((level) => activityLevelDetails[level].nap),
    ).toEqual([1.4, 1.6, 1.8, 2.0]);
  });

  it("opens a sub-list under gluten, tree nuts, fish, crustaceans and molluscs only", () => {
    expect(Object.keys(allergenSubLists).sort()).toEqual(
      ["crustaceans", "fish", "gluten", "molluscs", "tree_nuts"].sort(),
    );
    expect(allergenSubLists.gluten).toContain("wheat");
  });
});

describe("the questionnaire's answers", () => {
  it("starts with every answer « Non renseigné »", async () => {
    const view = unwrapOk(
      await getPatientQuestionnaire(systemActor, patientId),
    );
    expect(Object.values(view.answers).every((value) => value === null)).toBe(
      true,
    );
    expect(view.allergens).toEqual([]);
  });

  it("saves a subset and leaves the other answers as they are", async () => {
    unwrapOk(
      await savePatientQuestionnaire(systemActor, patientId, {
        sexForCalculation: "female",
        activityLevel: "moderate",
        consultationReason: "  Fatigue après les repas.  ",
      }),
    );
    const answers = unwrapOk(
      await savePatientQuestionnaire(systemActor, patientId, {
        desiredWeightKg: 62.5,
      }),
    );
    expect(answers.sexForCalculation).toBe("female");
    expect(answers.activityLevel).toBe("moderate");
    expect(answers.consultationReason).toBe("Fatigue après les repas.");
    expect(answers.desiredWeightKg).toBe(62.5);
    expect(answers.diet).toBe(null);
  });

  it("keeps the identity sex apart from the sex for the calculation", async () => {
    const profile = unwrapOk(await getPatient(systemActor, patientId));
    expect(profile.sex).toBe("other");
    const view = unwrapOk(
      await getPatientQuestionnaire(systemActor, patientId),
    );
    expect(view.answers.sexForCalculation).toBe("female");
  });

  it("clears a field on an empty string, and never stores the empty string", async () => {
    const answers = unwrapOk(
      await savePatientQuestionnaire(systemActor, patientId, {
        consultationReason: "",
        activityLevel: "",
      }),
    );
    expect(answers.consultationReason).toBe(null);
    expect(answers.activityLevel).toBe(null);
  });

  it("stores the diet, its note, the pathologies and celiac disease", async () => {
    const answers = unwrapOk(
      await savePatientQuestionnaire(systemActor, patientId, {
        diet: "other",
        dietNote: "Sans porc",
        pathologies: "Hypothyroïdie",
        celiacDisease: true,
        consultationDate: "2026-11-14",
      }),
    );
    expect(answers.diet).toBe("other");
    expect(answers.dietNote).toBe("Sans porc");
    expect(answers.celiacDisease).toBe(true);
    expect(answers.consultationDate).toBe("2026-11-14");
  });

  it("stores the genotype gate and the three results as given", async () => {
    const answers = unwrapOk(
      await savePatientQuestionnaire(systemActor, patientId, {
        geneticTest: "yes",
        apoe: "E3/E4",
        dio2: "H",
      }),
    );
    expect(answers.geneticTest).toBe("yes");
    expect(answers.apoe).toBe("E3/E4");
    expect(answers.dio2).toBe("H");
    // A missing result stays empty: nothing is invented.
    expect(answers.amy1a).toBe(null);
  });

  it("refuses a key outside its list", async () => {
    expect(
      errorOf(
        await savePatientQuestionnaire(systemActor, patientId, {
          activityLevel: "extreme" as never,
        }),
      ),
    ).toBe("invalid_input");
    expect(
      errorOf(
        await savePatientQuestionnaire(systemActor, patientId, {
          apoe: "E1/E1" as never,
        }),
      ),
    ).toBe("invalid_input");
  });

  it("refuses a weight that is not a positive number", async () => {
    expect(
      errorOf(
        await savePatientQuestionnaire(systemActor, patientId, {
          desiredWeightKg: -4,
        }),
      ),
    ).toBe("invalid_input");
  });

  it("refuses a field it does not know", async () => {
    expect(
      errorOf(
        await savePatientQuestionnaire(systemActor, patientId, {
          noKnownAllergies: true,
        } as never),
      ),
    ).toBe("invalid_input");
  });

  it("answers not found for an unknown or malformed patient", async () => {
    expect(
      errorOf(
        await getPatientQuestionnaire(
          systemActor,
          "00000000-0000-4000-8000-000000000000",
        ),
      ),
    ).toBe("not_found");
    expect(
      errorOf(await savePatientQuestionnaire(systemActor, "nope", {})),
    ).toBe("not_found");
  });
});

describe("the allergy and intolerance lists", () => {
  it("records the checked boxes and marks the list answered", async () => {
    const rows = unwrapOk(
      await setPatientAllergens(systemActor, patientId, "allergy", {
        state: "declared",
        items: [
          { key: "fish", subKey: "salmon" },
          { key: "peanuts" },
          { key: "fish", subKey: "cod" },
        ],
      }),
    );
    expect(rows.map((row) => [row.key, row.subKey])).toEqual([
      ["fish", "salmon"],
      ["fish", "cod"],
      ["peanuts", null],
    ]);
    const view = unwrapOk(
      await getPatientQuestionnaire(systemActor, patientId),
    );
    expect(view.answers.noKnownAllergies).toBe(false);
  });

  it("keeps « Tous » alone when individual boxes of its category come with it", async () => {
    const rows = unwrapOk(
      await setPatientAllergens(systemActor, patientId, "allergy", {
        state: "declared",
        items: [
          { key: "tree_nuts", subKey: "almond" },
          { key: "tree_nuts", subKey: "all" },
        ],
      }),
    );
    expect(rows.map((row) => [row.key, row.subKey])).toEqual([
      ["tree_nuts", "all"],
    ]);
  });

  it("stores a bare category as « Tous », and drops it under sub-boxes", async () => {
    const bare = unwrapOk(
      await setPatientAllergens(systemActor, patientId, "allergy", {
        state: "declared",
        items: [{ key: "crustaceans" }, { key: "peanuts" }],
      }),
    );
    expect(bare.map((row) => [row.key, row.subKey])).toEqual([
      ["crustaceans", "all"],
      ["peanuts", null],
    ]);
    const intolerance = unwrapOk(
      await setPatientAllergens(systemActor, patientId, "intolerance", {
        state: "declared",
        items: [{ key: "gluten" }],
      }),
    );
    expect(intolerance.map((row) => [row.key, row.subKey])).toEqual([
      ["gluten", null],
    ]);
    const precise = unwrapOk(
      await setPatientAllergens(systemActor, patientId, "allergy", {
        state: "declared",
        items: [{ key: "crustaceans" }, { key: "crustaceans", subKey: "crab" }],
      }),
    );
    expect(precise.map((row) => [row.key, row.subKey])).toEqual([
      ["crustaceans", "crab"],
    ]);
  });

  it("declares a wheat allergy on its own, under gluten", async () => {
    const rows = unwrapOk(
      await setPatientAllergens(systemActor, patientId, "allergy", {
        state: "declared",
        items: [{ key: "gluten", subKey: "wheat" }],
      }),
    );
    expect(rows.map((row) => [row.key, row.subKey])).toEqual([
      ["gluten", "wheat"],
    ]);
  });

  it("needs a text on « Autre » and refuses one anywhere else", async () => {
    expect(
      errorOf(
        await setPatientAllergens(systemActor, patientId, "allergy", {
          state: "declared",
          items: [{ key: "other" }],
        }),
      ),
    ).toBe("invalid_input");
    expect(
      errorOf(
        await setPatientAllergens(systemActor, patientId, "allergy", {
          state: "declared",
          items: [{ key: "soy", otherText: "beaucoup" }],
        }),
      ),
    ).toBe("invalid_input");
    const rows = unwrapOk(
      await setPatientAllergens(systemActor, patientId, "allergy", {
        state: "declared",
        items: [
          { key: "other", otherText: "  Kiwi  " },
          { key: "fish", subKey: "other", otherText: "Bar" },
        ],
      }),
    );
    expect(rows.map((row) => [row.key, row.subKey, row.otherText])).toEqual([
      ["fish", "other", "Bar"],
      ["other", null, "Kiwi"],
    ]);
  });

  it("refuses a box outside the lists, a sub-key under the wrong category, and a twice-checked box", async () => {
    const refused = [
      { key: "kiwi" },
      { key: "soy", subKey: "all" },
      { key: "fish", subKey: "crab" },
    ];
    for (const item of refused) {
      expect(
        errorOf(
          await setPatientAllergens(systemActor, patientId, "allergy", {
            state: "declared",
            items: [item],
          }),
        ),
      ).toBe("invalid_input");
    }
    expect(
      errorOf(
        await setPatientAllergens(systemActor, patientId, "allergy", {
          state: "declared",
          items: [{ key: "soy" }, { key: "soy" }],
        }),
      ),
    ).toBe("invalid_input");
    // Intolerances have no sub-lists.
    expect(
      errorOf(
        await setPatientAllergens(systemActor, patientId, "intolerance", {
          state: "declared",
          items: [{ key: "gluten", subKey: "wheat" }],
        }),
      ),
    ).toBe("invalid_input");
  });

  it("refuses an empty declaration: no box is not « none known »", async () => {
    expect(
      errorOf(
        await setPatientAllergens(systemActor, patientId, "allergy", {
          state: "declared",
          items: [],
        }),
      ),
    ).toBe("invalid_input");
  });

  it("keeps the three states apart: none known, declared, no answer", async () => {
    unwrapOk(
      await setPatientAllergens(systemActor, patientId, "intolerance", {
        state: "none_known",
      }),
    );
    let view = unwrapOk(await getPatientQuestionnaire(systemActor, patientId));
    expect(view.answers.noKnownIntolerances).toBe(true);
    expect(view.allergens.filter((row) => row.kind === "intolerance")).toEqual(
      [],
    );

    unwrapOk(
      await setPatientAllergens(systemActor, patientId, "intolerance", {
        state: "declared",
        items: [{ key: "lactose" }],
      }),
    );
    view = unwrapOk(await getPatientQuestionnaire(systemActor, patientId));
    expect(view.answers.noKnownIntolerances).toBe(false);

    unwrapOk(
      await setPatientAllergens(systemActor, patientId, "intolerance", {
        state: "unanswered",
      }),
    );
    view = unwrapOk(await getPatientQuestionnaire(systemActor, patientId));
    expect(view.answers.noKnownIntolerances).toBe(null);
    expect(view.allergens.filter((row) => row.kind === "intolerance")).toEqual(
      [],
    );
  });

  it("leaves the other list untouched when one list changes", async () => {
    const before = unwrapOk(
      await getPatientQuestionnaire(systemActor, patientId),
    );
    const allergiesBefore = before.allergens.filter(
      (row) => row.kind === "allergy",
    );
    unwrapOk(
      await setPatientAllergens(systemActor, patientId, "intolerance", {
        state: "declared",
        items: [{ key: "histamine" }],
      }),
    );
    const after = unwrapOk(
      await getPatientQuestionnaire(systemActor, patientId),
    );
    expect(after.allergens.filter((row) => row.kind === "allergy")).toEqual(
      allergiesBefore,
    );
    expect(after.answers.noKnownAllergies).toBe(
      before.answers.noKnownAllergies,
    );
  });

  it("refuses a list that does not exist, and an unknown patient", async () => {
    expect(
      errorOf(
        await setPatientAllergens(systemActor, patientId, "preference", {
          state: "none_known",
        }),
      ),
    ).toBe("invalid_input");
    expect(
      errorOf(
        await setPatientAllergens(
          systemActor,
          "00000000-0000-4000-8000-000000000000",
          "allergy",
          { state: "none_known" },
        ),
      ),
    ).toBe("not_found");
  });
});

describe("checking a submit before any write", () => {
  it("accepts valid answers and refuses an unknown value with its field", () => {
    expect(checkQuestionnaireInput({ activityLevel: "high" }).ok).toBe(true);
    const refused = checkQuestionnaireInput({
      activityLevel: "extreme" as "high",
    });
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.message).toMatch(/^activityLevel:/);
    }
  });

  it("checks one list's answer like the write would", () => {
    expect(checkAllergenAnswer("allergy", { state: "none_known" }).ok).toBe(
      true,
    );
    expect(
      checkAllergenAnswer("allergy", {
        state: "declared",
        items: [{ key: "fish", subKey: "salmon" }],
      }).ok,
    ).toBe(true);
    expect(
      errorOf(checkAllergenAnswer("allergy", { state: "declared", items: [] })),
    ).toBe("invalid_input");
    expect(
      errorOf(
        checkAllergenAnswer("allergy", {
          state: "declared",
          items: [{ key: "other" }],
        }),
      ),
    ).toBe("invalid_input");
    expect(errorOf(checkAllergenAnswer("food", { state: "none_known" }))).toBe(
      "invalid_input",
    );
  });
});

describe("the missing fields and the move to « Prêt pour consultation »", () => {
  const newFile = async (pseudonym: string) =>
    unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym,
      }),
    );

  it("lists every mandatory field on an empty file, in the list's order", async () => {
    const file = await newFile("Empty");
    expect(
      unwrapOk(await missingQuestionnaireFields(systemActor, file.id)),
    ).toEqual([
      "sexForCalculation",
      "heightCm",
      "weightKg",
      "activityLevel",
      "consultationReason",
      "allergies",
      "intolerances",
    ]);
  });

  it("keeps the file « Dossier à compléter » while a field is missing", async () => {
    const file = await newFile("Partial");
    await savePatientQuestionnaire(systemActor, file.id, {
      sexForCalculation: "female",
      activityLevel: "moderate",
    });
    expect(
      unwrapOk(await markReadyWhenComplete(systemActor, file.id, null)),
    ).toBe("to_complete");
    expect(
      unwrapOk(await missingQuestionnaireFields(systemActor, file.id)),
    ).toEqual([
      "heightCm",
      "weightKg",
      "consultationReason",
      "allergies",
      "intolerances",
    ]);
  });

  it("moves the file to ready once the last mandatory field is saved, and audits it", async () => {
    const file = await newFile("Complete");
    await updatePatient(systemActor, file.id, { heightCm: 168, weightKg: 61 });
    await savePatientQuestionnaire(systemActor, file.id, {
      sexForCalculation: "female",
      activityLevel: "moderate",
      consultationReason: "Fatigue",
    });
    await setPatientAllergens(systemActor, file.id, "allergy", {
      state: "none_known",
    });
    expect(
      unwrapOk(await markReadyWhenComplete(systemActor, file.id, null)),
    ).toBe("to_complete");
    await setPatientAllergens(systemActor, file.id, "intolerance", {
      state: "declared",
      items: [{ key: "lactose" }],
    });
    expect(
      unwrapOk(await missingQuestionnaireFields(systemActor, file.id)),
    ).toEqual([]);
    expect(
      unwrapOk(await markReadyWhenComplete(systemActor, file.id, null)),
    ).toBe("ready");
    expect(unwrapOk(await getPatient(systemActor, file.id)).fileStatus).toBe(
      "ready",
    );
    const events = await listAuditEvents(systemActor, {
      action: "patient.file_status_changed",
      targetId: file.id,
    });
    expect(events).toHaveLength(1);
  });

  it("never moves a file back when a field is cleared later", async () => {
    const file = await newFile("Cleared");
    await updatePatient(systemActor, file.id, { heightCm: 170, weightKg: 70 });
    await savePatientQuestionnaire(systemActor, file.id, {
      sexForCalculation: "male",
      activityLevel: "low",
      consultationReason: "Sommeil",
    });
    await setPatientAllergens(systemActor, file.id, "allergy", {
      state: "none_known",
    });
    await setPatientAllergens(systemActor, file.id, "intolerance", {
      state: "none_known",
    });
    expect(
      unwrapOk(await markReadyWhenComplete(systemActor, file.id, null)),
    ).toBe("ready");
    await savePatientQuestionnaire(systemActor, file.id, {
      consultationReason: "",
    });
    expect(
      unwrapOk(await markReadyWhenComplete(systemActor, file.id, null)),
    ).toBe("ready");
    expect(
      unwrapOk(await missingQuestionnaireFields(systemActor, file.id)),
    ).toEqual(["consultationReason"]);
  });

  it("answers not found for a missing file", async () => {
    expect(
      errorOf(await missingQuestionnaireFields(systemActor, "not-a-uuid")),
    ).toBe("not_found");
    expect(
      errorOf(
        await markReadyWhenComplete(
          systemActor,
          "00000000-0000-4000-8000-0000000000ab",
          null,
        ),
      ),
    ).toBe("not_found");
  });
});

describe("optional data under its consent", () => {
  it("refuses a genotype value without a given genetic consent, and stores the gate answer", async () => {
    const patient = await newPatient("Sans génétique");
    await decide(patient, "care", "given");
    expect(
      errorOf(
        await savePatientQuestionnaire(systemActor, patient.id, {
          geneticTest: "yes",
          apoe: "E3/E4",
        }),
      ),
    ).toBe("not_permitted");
    // Nothing of the refused save was written.
    let view = unwrapOk(await getPatientQuestionnaire(systemActor, patient.id));
    expect(view.answers.geneticTest).toBe(null);
    expect(view.answers.apoe).toBe(null);

    unwrapOk(
      await savePatientQuestionnaire(systemActor, patient.id, {
        geneticTest: "yes",
      }),
    );
    // A clear needs no consent.
    unwrapOk(
      await savePatientQuestionnaire(systemActor, patient.id, { apoe: "" }),
    );
    view = unwrapOk(await getPatientQuestionnaire(systemActor, patient.id));
    expect(view.answers.geneticTest).toBe("yes");
  });

  it("stores a refusal and changes nothing else", async () => {
    const patient = await newPatient("Refus");
    await decide(patient, "care", "given");
    const before = unwrapOk(
      await getPatientQuestionnaire(systemActor, patient.id),
    );
    await decide(patient, "genetic", "refused");
    const after = unwrapOk(
      await getPatientQuestionnaire(systemActor, patient.id),
    );
    expect(after).toEqual(before);
    expect(
      errorOf(
        await savePatientQuestionnaire(systemActor, patient.id, { dio2: "A" }),
      ),
    ).toBe("not_permitted");
    const events = await listAuditEvents(systemActor, { targetId: patient.id });
    expect(events.map((event) => event.action).sort()).toEqual([
      "consent.given",
      "consent.refused",
    ]);
  });

  it("clears the three genotype fields on a withdrawal, with an audit event", async () => {
    const patient = await newPatient("Retrait");
    await decide(patient, "care", "given");
    await decide(patient, "genetic", "given");
    const stored = unwrapOk(
      await savePatientQuestionnaire(systemActor, patient.id, {
        geneticTest: "yes",
        apoe: "E2/E3",
        dio2: "M",
        amy1a: "A",
      }),
    );
    expect(stored.apoe).toBe("E2/E3");

    await tick();
    await decide(patient, "genetic", "withdrawn");
    const view = unwrapOk(
      await getPatientQuestionnaire(systemActor, patient.id),
    );
    expect(view.answers.apoe).toBe(null);
    expect(view.answers.dio2).toBe(null);
    expect(view.answers.amy1a).toBe(null);
    expect(view.answers.geneticTest).toBe("yes");
    // The row itself is empty, not only the read.
    const row = await getDatabase()
      .collection<{ id: string; apoe: string | null }>("patient_profiles")
      .findById(patient.id);
    expect(row?.apoe).toBe(null);

    const cleared = await listAuditEvents(systemActor, {
      targetId: patient.id,
      action: "genotype.cleared",
    });
    expect(cleared).toHaveLength(1);
    expect(cleared[0].detail).toBe("consent withdrawn");
  });

  it("hides a stored genotype from every read without the genetic consent", async () => {
    const patient = await newPatient("Masque");
    // A value written before this rule, with no consent row behind it.
    await getDatabase()
      .collection<{ id: string; apoe: string | null }>("patient_profiles")
      .update(patient.id, { apoe: "E4/E4" });
    const view = unwrapOk(
      await getPatientQuestionnaire(systemActor, patient.id),
    );
    expect(view.answers.apoe).toBe(null);
  });

  it("refuses the desired weight without a given care consent", async () => {
    const patient = await newPatient("Sans soins");
    expect(
      errorOf(
        await savePatientQuestionnaire(systemActor, patient.id, {
          desiredWeightKg: 60,
        }),
      ),
    ).toBe("not_permitted");
    unwrapOk(
      await savePatientQuestionnaire(systemActor, patient.id, {
        desiredWeightKg: "",
      }),
    );
    await decide(patient, "care", "given");
    const answers = unwrapOk(
      await savePatientQuestionnaire(systemActor, patient.id, {
        desiredWeightKg: 60,
      }),
    );
    expect(answers.desiredWeightKg).toBe(60);
  });
});

describe("the profile columns the questionnaire asks", () => {
  it("saves the identity and keeps the full name joined", async () => {
    const patient = await newPatient("Identité");
    const saved = unwrapOk(
      await savePatientProfileAnswers(systemActor, patient.id, {
        firstName: "  Claire ",
        lastName: "Dubois",
        birthDate: "1984-05-12",
        phone: "+32 470 12 34 56",
      }),
    );
    expect(saved.firstName).toBe("Claire");
    expect(saved.fullName).toBe("Claire Dubois");
    expect(saved.birthDate).toBe("1984-05-12");
    expect(saved.phone).toBe("+32470123456");

    const renamed = unwrapOk(
      await savePatientProfileAnswers(systemActor, patient.id, {
        lastName: "Martin",
      }),
    );
    expect(renamed.fullName).toBe("Claire Martin");
  });

  it("never moves the practitioner's last edit", async () => {
    const patient = await newPatient("Sans retouche");
    await tick();
    const saved = unwrapOk(
      await savePatientProfileAnswers(systemActor, patient.id, {
        heightCm: 172,
      }),
    );
    expect(saved.lastEditedAt).toEqual(patient.lastEditedAt);
  });

  it("saves and clears taille and poids", async () => {
    const patient = await newPatient("Mesures");
    const saved = unwrapOk(
      await savePatientProfileAnswers(systemActor, patient.id, {
        heightCm: 168,
        weightKg: 64.5,
      }),
    );
    expect(saved.heightCm).toBe(168);
    expect(saved.weightKg).toBe(64.5);
    const cleared = unwrapOk(
      await savePatientProfileAnswers(systemActor, patient.id, {
        weightKg: null,
      }),
    );
    expect(cleared.weightKg).toBe(null);
    expect(cleared.heightCm).toBe(168);
  });

  it("refuses a cleared identity field, a broken value and an unknown field", async () => {
    const patient = await newPatient("Refus");
    expect(
      errorOf(
        await savePatientProfileAnswers(systemActor, patient.id, {
          firstName: " ",
        }),
      ),
    ).toBe("invalid_input");
    expect(
      errorOf(
        await savePatientProfileAnswers(systemActor, patient.id, {
          phone: "12",
        }),
      ),
    ).toBe("invalid_input");
    expect(
      errorOf(
        await savePatientProfileAnswers(systemActor, patient.id, {
          heightCm: 172.5,
        }),
      ),
    ).toBe("invalid_input");
    expect(
      errorOf(
        await savePatientProfileAnswers(systemActor, patient.id, {
          pseudonym: "x",
        } as never),
      ),
    ).toBe("invalid_input");
  });

  it("needs the care consent for médicaments and compléments, never to clear them", async () => {
    const patient = await newPatient("Traitement");
    expect(
      errorOf(
        await savePatientProfileAnswers(systemActor, patient.id, {
          medications: "Levothyrox",
        }),
      ),
    ).toBe("not_permitted");
    unwrapOk(
      await savePatientProfileAnswers(systemActor, patient.id, {
        supplements: "",
      }),
    );
    await decide(patient, "care", "given");
    const saved = unwrapOk(
      await savePatientProfileAnswers(systemActor, patient.id, {
        medications: "Levothyrox",
      }),
    );
    expect(saved.medications).toBe("Levothyrox");
  });

  it("answers not_found for an unknown patient", async () => {
    expect(
      errorOf(
        await savePatientProfileAnswers(systemActor, "nope", { heightCm: 170 }),
      ),
    ).toBe("not_found");
    expect(
      errorOf(
        await savePatientProfileAnswers(
          systemActor,
          "00000000-0000-4000-8000-000000000000",
          { heightCm: 170 },
        ),
      ),
    ).toBe("not_found");
  });
});

type GenotypeRow = {
  id: string;
  geneticTest: string | null;
  apoe: string | null;
  dio2: string | null;
  amy1a: string | null;
};

describe("the genotype section", () => {
  /** A patient with both consents, the answer « Oui » and a complete trio. */
  const withTrio = async (pseudonym: string) => {
    const patient = await newPatient(pseudonym);
    await decide(patient, "care", "given");
    await decide(patient, "genetic", "given");
    unwrapOk(
      await savePatientQuestionnaire(systemActor, patient.id, {
        geneticTest: "yes",
        apoe: "E3/E3",
        dio2: "H",
        amy1a: "M",
      }),
    );
    return patient;
  };

  it("keeps the values stored and hides them under « Non / Je ne sais pas »", async () => {
    const patient = await withTrio("Non sait pas");
    unwrapOk(
      await savePatientQuestionnaire(systemActor, patient.id, {
        geneticTest: "no_or_unknown",
      }),
    );
    let view = unwrapOk(await getPatientQuestionnaire(systemActor, patient.id));
    expect(view.answers.geneticTest).toBe("no_or_unknown");
    expect(view.answers.apoe).toBe(null);
    expect(view.answers.dio2).toBe(null);
    expect(view.answers.amy1a).toBe(null);
    const row = await getDatabase()
      .collection<{ id: string; apoe: string | null }>("patient_profiles")
      .findById(patient.id);
    expect(row?.apoe).toBe("E3/E3");
    expect(unwrapOk(await macroProfileOf(systemActor, patient.id)).reason).toBe(
      "no-test",
    );

    // « Oui » again shows the stored values back.
    unwrapOk(
      await savePatientQuestionnaire(systemActor, patient.id, {
        geneticTest: "yes",
      }),
    );
    view = unwrapOk(await getPatientQuestionnaire(systemActor, patient.id));
    expect(view.answers.apoe).toBe("E3/E3");
    expect(view.answers.amy1a).toBe("M");
  });

  it("writes one audit event per changed genotype field, with no value", async () => {
    const patient = await withTrio("Trace");
    let events = await listAuditEvents(systemActor, {
      targetId: patient.id,
      action: "genotype.changed",
    });
    expect(events.map((event) => event.detail).sort()).toEqual([
      "AMY1A",
      "APOE",
      "DIO2",
    ]);

    // An equal value writes nothing. A change and a clear write one each.
    unwrapOk(
      await savePatientQuestionnaire(
        systemActor,
        patient.id,
        { apoe: "E3/E3", dio2: "A", amy1a: "" },
        { kind: "patient", id: patient.id, name: patient.pseudonym },
      ),
    );
    events = await listAuditEvents(systemActor, {
      targetId: patient.id,
      action: "genotype.changed",
    });
    expect(events).toHaveLength(5);
    const details = events.map((event) => event.detail);
    expect(details.filter((detail) => detail === "APOE")).toHaveLength(1);
    expect(details.filter((detail) => detail === "DIO2")).toHaveLength(2);
    expect(details.filter((detail) => detail === "AMY1A")).toHaveLength(2);
    for (const event of events) {
      expect(event.detail).not.toMatch(/E\d|^[AHM]$/);
    }
  });

  it("returns DEFAULT 45/30/25 from macroProfileOf for every patient today", async () => {
    const complete = await withTrio("Trio complet");
    expect(unwrapOk(await macroProfileOf(systemActor, complete.id))).toEqual({
      source: "default",
      carbohydrate: 45,
      fat: 30,
      protein: 25,
      reason: "mapping-unvalidated",
    });

    const empty = await newPatient("Section vide");
    expect(unwrapOk(await macroProfileOf(systemActor, empty.id))).toEqual({
      source: "default",
      carbohydrate: 45,
      fat: 30,
      protein: 25,
      reason: "no-test",
    });

    const partial = await newPatient("Trio partiel");
    await decide(partial, "genetic", "given");
    unwrapOk(
      await savePatientQuestionnaire(systemActor, partial.id, {
        geneticTest: "yes",
        apoe: "E2/E2",
      }),
    );
    expect(unwrapOk(await macroProfileOf(systemActor, partial.id)).reason).toBe(
      "incomplete",
    );
  });

  it("answers DEFAULT without the genetic consent, even with stored values", async () => {
    const patient = await newPatient("Valeurs sans accord");
    await getDatabase()
      .collection<GenotypeRow>("patient_profiles")
      .update(patient.id, {
        geneticTest: "yes",
        apoe: "E4/E4",
        dio2: "A",
        amy1a: "A",
      });
    expect(unwrapOk(await macroProfileOf(systemActor, patient.id)).reason).toBe(
      "no-consent",
    );
  });
});
