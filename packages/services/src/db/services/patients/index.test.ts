import { beforeAll, describe, expect, it } from "vitest";
import {
  registerAuthProvider,
  type AuthProvider,
} from "../../../auth/provider";
import { err, ok } from "../../../shared/result";
import { getDatabase, registerDatabase } from "../../client";
import type { PatientProfile } from "../../models/patient-profile";
import {
  createMemoryDatabase,
  practitionerActor,
  testPractitionerId,
} from "../../test-helpers";
import { createPatientAccount } from "../patient-accounts";
import { recordConsent } from "../patient-consents";
import { addGoalCheckIn, addPatientGoal } from "../patient-goals";
import { listAuditEvents, type AuditActor } from "../audit";
import { addPatientRecommendation } from "../patient-recommendations";
import {
  createPatient,
  deletePatient,
  findPatientByEmail,
  getPatient,
  getPatientByShareToken,
  patientListNames,
  patientListOf,
  patientOf,
  patientOfRecord,
  patientsOf,
  recordPatientLinkOpened,
  regenerateShareToken,
  setFileStatus,
  setPatientNextConsultationPrep,
  updatePatient,
  updatePatientProfileByPatient,
  type PatientInput,
  type PatientProfileEdit,
} from "./index";
import { systemActor } from "../../services/access";

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

const unwrapOk = <T>(result: { ok: true; data: T } | { ok: false }): T => {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error("unreachable");
  }
  return result.data;
};

/**
 * `lastEditedAt` is millisecond-resolution, so two writes in the same tick are
 * indistinguishable. The ordering assertions below need a real gap, not a
 * faster machine.
 */
const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

describe("patient profiles", () => {
  it("creates with defaults and an unguessable share token", async () => {
    const patient = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Claire",
      }),
    );
    expect(patient.pseudonym).toBe("Claire");
    expect(patient.fullName).toBeNull();
    expect(patient.email).toBeNull();
    expect(patient.locale).toBe("fr");
    expect(patient.status).toBe("active");
    expect(patient.fileStatus).toBe("to_complete");
    expect(patient.sex).toBe("unspecified");
    expect(patient.birthDate).toBeNull();
    expect(patient.heightCm).toBeNull();
    expect(patient.weightKg).toBeNull();
    expect(patient.consentDate).toBeNull();
    expect(patient.consentChannel).toBeNull();
    expect(patient.linkLastOpenedAt).toBeNull();
    expect(patient.shareToken.length).toBeGreaterThanOrEqual(24);
  });

  it("requires a pseudonym", async () => {
    const result = await createPatient(systemActor, {
      practitionerId: testPractitionerId,
      pseudonym: "   ",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("invalid_input");
    }
  });

  it("rejects an invalid email", async () => {
    const result = await createPatient(systemActor, {
      practitionerId: testPractitionerId,
      pseudonym: "Claire",
      email: "not-an-email",
    });
    expect(result.ok).toBe(false);
  });

  it("updates partially without blanking the rest", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Marc",
        objective: "sleep better",
        constraints: "no gluten",
      }),
    );
    const updated = unwrapOk(
      await updatePatient(systemActor, created.id, {
        objective: "sleep and energy",
      }),
    );
    expect(updated.objective).toBe("sleep and energy");
    expect(updated.constraints).toBe("no gluten");
    expect(updated.pseudonym).toBe("Marc");
    expect(updated.shareToken).toBe(created.shareToken);
  });

  it("maps an emptied full name and email back to null", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Iris",
        fullName: "Iris Dupont",
        email: "iris@example.com",
      }),
    );
    const updated = unwrapOk(
      await updatePatient(systemActor, created.id, { fullName: "", email: "" }),
    );
    expect(updated.fullName).toBeNull();
    expect(updated.email).toBeNull();
  });

  it("resolves the share token exactly, and not at all after regeneration", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Nora",
      }),
    );
    const byToken = unwrapOk(await getPatientByShareToken(created.shareToken));
    expect(byToken.id).toBe(created.id);

    const regenerated = unwrapOk(
      await regenerateShareToken(systemActor, created.id),
    );
    expect(regenerated.shareToken).not.toBe(created.shareToken);
    expect((await getPatientByShareToken(created.shareToken)).ok).toBe(false);
    expect((await getPatientByShareToken(regenerated.shareToken)).ok).toBe(
      true,
    );
  });

  it("treats a malformed id or token as not found, never as an error", async () => {
    expect((await getPatient(systemActor, "not-a-uuid")).ok).toBe(false);
    expect((await getPatientByShareToken("nope")).ok).toBe(false);
    expect((await updatePatient(systemActor, "not-a-uuid", {})).ok).toBe(false);
    expect((await deletePatient(systemActor, "not-a-uuid")).ok).toBe(false);
  });

  it("deletes, and the list reflects it", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Temp",
      }),
    );
    expect(unwrapOk(await deletePatient(systemActor, created.id))).toBe(true);
    expect((await getPatient(systemActor, created.id)).ok).toBe(false);
    const remaining = await patientsOf(practitionerActor(testPractitionerId));
    expect(remaining.some((patient) => patient.id === created.id)).toBe(false);
  });
});

describe("clinical fields", () => {
  it("records a birth date, sex and measurements", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Alix",
        birthDate: "1984-03-11",
        sex: "female",
        heightCm: "168",
        weightKg: "62.5",
        referral: "Dr Laurent",
      }),
    );
    expect(created.birthDate).toBe("1984-03-11");
    expect(created.sex).toBe("female");
    expect(created.heightCm).toBe(168);
    expect(created.weightKg).toBe(62.5);
    expect(created.referral).toBe("Dr Laurent");
  });

  it("rejects a malformed birth date and an out-of-range measurement", async () => {
    expect(
      (
        await createPatient(systemActor, {
          practitionerId: testPractitionerId,
          pseudonym: "Bad",
          birthDate: "11/03/1984",
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await createPatient(systemActor, {
          practitionerId: testPractitionerId,
          pseudonym: "Bad",
          birthDate: "1984-13-45",
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await createPatient(systemActor, {
          practitionerId: testPractitionerId,
          pseudonym: "Bad",
          heightCm: "0",
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await createPatient(systemActor, {
          practitionerId: testPractitionerId,
          pseudonym: "Bad",
          weightKg: "heavy",
        })
      ).ok,
    ).toBe(false);
  });

  it("clears an optional number and date with an empty string", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Clear",
        birthDate: "1990-01-01",
        heightCm: "170",
        weightKg: "70",
      }),
    );
    const cleared = unwrapOk(
      await updatePatient(systemActor, created.id, {
        birthDate: "",
        heightCm: "",
        weightKg: "",
      }),
    );
    expect(cleared.birthDate).toBeNull();
    expect(cleared.heightCm).toBeNull();
    expect(cleared.weightKg).toBeNull();
  });
});

describe("consent", () => {
  // Since `consent-texts-and-records` a consent is a row of `patient_consents`.
  // The two columns keep what Morgane recorded by hand, and nothing writes them.
  const handRecorded = {
    consentDate: "2026-08-14",
    consentChannel: "email",
  } as const;

  it("ignores the two old columns on a create", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Consented",
        ...handRecorded,
      }),
    );
    expect(created.consentDate).toBeNull();
    expect(created.consentChannel).toBeNull();
  });

  it("keeps the hand-recorded values through an update that sends others", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Later",
        objective: "sleep better",
      }),
    );
    // The values a profile holds from before: written under the service.
    await getDatabase()
      .collection<PatientProfile>("patient_profiles")
      .update(created.id, handRecorded);
    const updated = unwrapOk(
      await updatePatient(systemActor, created.id, {
        objective: "more energy",
        consentDate: "",
        consentChannel: "",
      } as PatientInput),
    );
    expect(updated.objective).toBe("more energy");
    expect(updated.consentDate).toBe("2026-08-14");
    expect(updated.consentChannel).toBe("email");
  });

  it("blocks nothing: a profile with no consent still saves and still shares", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "No consent",
      }),
    );
    const updated = unwrapOk(
      await updatePatient(systemActor, created.id, {
        objective: "more energy",
      }),
    );
    expect(updated.objective).toBe("more energy");
    expect(updated.consentDate).toBeNull();
    expect(unwrapOk(await getPatientByShareToken(created.shareToken)).id).toBe(
      created.id,
    );
  });
});

describe("the food profile", () => {
  it("records the regime, the two exclusion lists, the budget and the affinity", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Sana",
        dietaryRegime: "végétarien, sans gluten",
        allergies: "arachides",
        intolerances: "lactose",
        constraints: "hypothyroïdie",
        likesCooking: "somewhat",
        cookingTime: "low",
        foodBudget: "economical",
      }),
    );
    expect(created.dietaryRegime).toBe("végétarien, sans gluten");
    // The split is the whole point: an allergy never lands in `constraints`.
    expect(created.allergies).toBe("arachides");
    expect(created.intolerances).toBe("lactose");
    expect(created.constraints).toBe("hypothyroïdie");
    expect(created.likesCooking).toBe("somewhat");
    expect(created.cookingTime).toBe("low");
    expect(created.foodBudget).toBe("economical");
  });

  it("leaves them empty, and the affinity not recorded, when nothing is given", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Blank",
      }),
    );
    expect(created.dietaryRegime).toBe("");
    expect(created.allergies).toBe("");
    expect(created.intolerances).toBe("");
    // Not asked yet is a different answer from any level.
    expect(created.foodBudget).toBeNull();
    expect(created.cookingTime).toBeNull();
    expect(created.likesCooking).toBeNull();
    expect(created.patientEditedAt).toEqual({});
  });

  it("takes each value of the affinity, and refuses one outside the set", async () => {
    for (const affinity of ["yes", "somewhat", "no"] as const) {
      const created = unwrapOk(
        await createPatient(systemActor, {
          practitionerId: testPractitionerId,
          pseudonym: "Cook",
          likesCooking: affinity,
        }),
      );
      expect(created.likesCooking).toBe(affinity);
    }
    expect(
      (
        await createPatient(systemActor, {
          practitionerId: testPractitionerId,
          pseudonym: "Bad",
          likesCooking: "sometimes" as never,
        })
      ).ok,
    ).toBe(false);
  });

  it("takes each level of time and budget, and refuses free text", async () => {
    for (const cookingTime of ["low", "medium", "high"] as const) {
      const created = unwrapOk(
        await createPatient(systemActor, {
          practitionerId: testPractitionerId,
          pseudonym: "Time",
          cookingTime,
        }),
      );
      expect(created.cookingTime).toBe(cookingTime);
    }
    for (const foodBudget of ["economical", "standard", "comfort"] as const) {
      const created = unwrapOk(
        await createPatient(systemActor, {
          practitionerId: testPractitionerId,
          pseudonym: "Budget",
          foodBudget,
        }),
      );
      expect(created.foodBudget).toBe(foodBudget);
    }
    expect(
      (
        await createPatient(systemActor, {
          practitionerId: testPractitionerId,
          pseudonym: "Bad",
          foodBudget: "serré, courses au marché" as never,
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await createPatient(systemActor, {
          practitionerId: testPractitionerId,
          pseudonym: "Bad",
          cookingTime: "30 min" as never,
        })
      ).ok,
    ).toBe(false);
  });

  it("clears a text field and the affinity with an empty string", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Revised",
        allergies: "fruits à coque",
        likesCooking: "yes",
      }),
    );
    const cleared = unwrapOk(
      await updatePatient(systemActor, created.id, {
        allergies: "",
        likesCooking: "",
      }),
    );
    expect(cleared.allergies).toBe("");
    expect(cleared.likesCooking).toBeNull();
  });

  it("updates one without blanking the others", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Partial",
        dietaryRegime: "sans gluten",
        allergies: "arachides",
        likesCooking: "no",
        foodBudget: "standard",
      }),
    );
    const updated = unwrapOk(
      await updatePatient(systemActor, created.id, { intolerances: "lactose" }),
    );
    expect(updated.intolerances).toBe("lactose");
    expect(updated.dietaryRegime).toBe("sans gluten");
    expect(updated.allergies).toBe("arachides");
    expect(updated.likesCooking).toBe("no");
    expect(updated.foodBudget).toBe("standard");
  });
});

/** « Mon profil » as the patient's form posts it — all seven, every time. */
const profileEdit = (
  overrides: Partial<PatientProfileEdit> = {},
): PatientProfileEdit => ({
  dietaryRegime: "",
  allergies: "",
  intolerances: "",
  preferences: "",
  likesCooking: "",
  cookingTime: "",
  foodBudget: "",
  ...overrides,
});

describe("the patient editing their own food profile", () => {
  it("saves the seven fields and dates each one it changed", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Lina",
        allergies: "arachides",
      }),
    );
    const edited = unwrapOk(
      await updatePatientProfileByPatient(
        systemActor,
        created.id,
        profileEdit({
          dietaryRegime: "végétarien",
          allergies: "arachides",
          preferences: "aime les lentilles, pas le chou",
          likesCooking: "somewhat",
          cookingTime: "medium",
          foodBudget: "comfort",
        }),
      ),
    );

    expect(edited.changed).toEqual([
      "dietaryRegime",
      "preferences",
      "likesCooking",
      "cookingTime",
      "foodBudget",
    ]);
    const saved = unwrapOk(await getPatient(systemActor, created.id));
    expect(saved.dietaryRegime).toBe("végétarien");
    expect(saved.cookingTime).toBe("medium");
    expect(saved.foodBudget).toBe("comfort");
    // Allergies were posted as they were, so they are not the patient's edit.
    expect(Object.keys(saved.patientEditedAt).sort()).toEqual(
      [...edited.changed].sort(),
    );
    expect(saved.patientEditedAt.allergies).toBeUndefined();
  });

  it("lets the patient remove an allergy, and dates it", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Maé",
        allergies: "arachides",
      }),
    );
    const edited = unwrapOk(
      await updatePatientProfileByPatient(
        systemActor,
        created.id,
        profileEdit(),
      ),
    );
    expect(edited.changed).toContain("allergies");
    const saved = unwrapOk(await getPatient(systemActor, created.id));
    expect(saved.allergies).toBe("");
    expect(saved.patientEditedAt.allergies).toBeDefined();
  });

  it("changes nothing, and dates nothing, when the form is posted as it was", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Same",
        allergies: "lactose",
        likesCooking: "yes",
      }),
    );
    const edited = unwrapOk(
      await updatePatientProfileByPatient(
        systemActor,
        created.id,
        profileEdit({ allergies: " lactose ", likesCooking: "yes" }),
      ),
    );
    expect(edited.changed).toEqual([]);
    expect(
      unwrapOk(await getPatient(systemActor, created.id)).patientEditedAt,
    ).toEqual({});
  });

  it("never moves the roster timestamp — that one is Morgane's", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Roster",
      }),
    );
    await tick();
    unwrapOk(
      await updatePatientProfileByPatient(
        systemActor,
        created.id,
        profileEdit({ cookingTime: "high" }),
      ),
    );
    expect(
      unwrapOk(
        await getPatient(systemActor, created.id),
      ).lastEditedAt.getTime(),
    ).toBe(created.lastEditedAt.getTime());
  });

  it("refuses a level outside the set and an unknown patient", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Strict",
      }),
    );
    expect(
      (
        await updatePatientProfileByPatient(
          systemActor,
          created.id,
          profileEdit({ foodBudget: "cher" as never }),
        )
      ).ok,
    ).toBe(false);
    const missing = await updatePatientProfileByPatient(
      systemActor,
      "00000000-0000-4000-8000-000000000000",
      profileEdit(),
    );
    expect(missing.ok).toBe(false);
  });

  it("drops the patient's date from a field only when Morgane changes that field", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Handover",
        allergies: "arachides",
      }),
    );
    unwrapOk(
      await updatePatientProfileByPatient(
        systemActor,
        created.id,
        profileEdit({ allergies: "arachides, sésame", cookingTime: "low" }),
      ),
    );

    // Her console form posts every field; only the budget actually moves.
    const after = unwrapOk(
      await updatePatient(systemActor, created.id, {
        allergies: "arachides, sésame",
        cookingTime: "low",
        foodBudget: "standard",
      }),
    );
    expect(Object.keys(after.patientEditedAt).sort()).toEqual([
      "allergies",
      "cookingTime",
    ]);

    // Now she rewrites the allergies herself: that field is hers again.
    const rewritten = unwrapOk(
      await updatePatient(systemActor, created.id, { allergies: "arachides" }),
    );
    expect(rewritten.patientEditedAt.allergies).toBeUndefined();
    expect(rewritten.patientEditedAt.cookingTime).toBeDefined();
  });
});

describe("the roster query", () => {
  it("searches the pseudonym, the full name and the email", async () => {
    await createPatient(systemActor, {
      practitionerId: testPractitionerId,
      pseudonym: "Zephyr",
      fullName: "Camille Rousseau",
      email: "camille@example.com",
    });
    expect(
      (
        await patientsOf(practitionerActor(testPractitionerId), {
          search: "zeph",
        })
      ).some((patient) => patient.pseudonym === "Zephyr"),
    ).toBe(true);
    expect(
      (
        await patientsOf(practitionerActor(testPractitionerId), {
          search: "ROUSSEAU",
        })
      ).some((patient) => patient.pseudonym === "Zephyr"),
    ).toBe(true);
    expect(
      (
        await patientsOf(practitionerActor(testPractitionerId), {
          search: "camille@",
        })
      ).some((patient) => patient.pseudonym === "Zephyr"),
    ).toBe(true);
    expect(
      await patientsOf(practitionerActor(testPractitionerId), {
        search: "no such patient",
      }),
    ).toEqual([]);
  });

  it("filters by status, and 'all' is not a filter", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Paused one",
      }),
    );
    await updatePatient(systemActor, created.id, { status: "paused" });

    const paused = await patientsOf(practitionerActor(testPractitionerId), {
      status: "paused",
    });
    expect(paused.every((patient) => patient.status === "paused")).toBe(true);
    expect(paused.some((patient) => patient.id === created.id)).toBe(true);

    const active = await patientsOf(practitionerActor(testPractitionerId), {
      status: "active",
    });
    expect(active.some((patient) => patient.id === created.id)).toBe(false);

    const all = await patientsOf(practitionerActor(testPractitionerId), {
      status: "all",
    });
    expect(all.length).toBeGreaterThan(paused.length);
  });

  it("sorts by name, and by the last operator edit", async () => {
    const byName = await patientsOf(practitionerActor(testPractitionerId), {
      sort: "name",
    });
    const pseudonyms = byName.map((patient) => patient.pseudonym);
    expect(pseudonyms).toEqual(
      [...pseudonyms].sort((a, b) => a.localeCompare(b, "fr")),
    );

    const target = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Most recent",
      }),
    );
    await tick();
    await updatePatient(systemActor, target.id, { objective: "touched last" });
    const byRecent = await patientsOf(practitionerActor(testPractitionerId), {
      sort: "recent",
    });
    expect(byRecent[0]?.id).toBe(target.id);
  });
});

describe("the share link's last-opened stamp", () => {
  it("records the first open and leaves the operator's edit stamp alone", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Opened",
      }),
    );
    await tick();
    await recordPatientLinkOpened(created.id);

    const opened = unwrapOk(await getPatient(systemActor, created.id));
    expect(opened.linkLastOpenedAt).not.toBeNull();
    // The whole reason the two timestamps are separate columns: a patient
    // reading their page must not reorder Morgane's roster.
    expect(opened.lastEditedAt.getTime()).toBe(created.lastEditedAt.getTime());
  });

  it("does not rewrite the stamp on a second open inside the interval", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Hammered",
      }),
    );
    await recordPatientLinkOpened(created.id);
    const first = unwrapOk(
      await getPatient(systemActor, created.id),
    ).linkLastOpenedAt;

    await tick();
    await recordPatientLinkOpened(created.id);
    const second = unwrapOk(
      await getPatient(systemActor, created.id),
    ).linkLastOpenedAt;

    expect(second?.getTime()).toBe(first?.getTime());
  });

  it("forgets the stamp when the link is regenerated", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Rotated",
      }),
    );
    await recordPatientLinkOpened(created.id);
    const regenerated = unwrapOk(
      await regenerateShareToken(systemActor, created.id),
    );
    expect(regenerated.linkLastOpenedAt).toBeNull();
  });

  it("ignores a malformed id rather than throwing", async () => {
    await expect(
      recordPatientLinkOpened("not-a-uuid"),
    ).resolves.toBeUndefined();
  });
});

describe("the next-consultation prep note", () => {
  it("defaults to null on create", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Prep",
      }),
    );
    expect(created.nextConsultationPrep).toBeNull();
  });

  it("sets the note and moves the operator edit stamp", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Prep set",
      }),
    );
    const before = created.lastEditedAt.getTime();
    await tick();

    const updated = unwrapOk(
      await setPatientNextConsultationPrep(
        systemActor,
        created.id,
        "Revoir le petit déjeuner",
      ),
    );
    expect(updated.nextConsultationPrep).toBe("Revoir le petit déjeuner");
    expect(updated.lastEditedAt.getTime()).toBeGreaterThan(before);
  });

  it("clears with an empty string back to null", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Prep clear",
      }),
    );
    await setPatientNextConsultationPrep(
      systemActor,
      created.id,
      "quelque chose",
    );
    const cleared = unwrapOk(
      await setPatientNextConsultationPrep(systemActor, created.id, ""),
    );
    expect(cleared.nextConsultationPrep).toBeNull();
  });

  it("writes only the prep field and no sibling fields", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Prep narrow",
        objective: "keep me",
      }),
    );
    const updated = unwrapOk(
      await setPatientNextConsultationPrep(
        systemActor,
        created.id,
        "noter la pesée",
      ),
    );
    expect(updated.objective).toBe("keep me");
    expect(updated.nextConsultationPrep).toBe("noter la pesée");
  });

  it("rejects an over-long note", async () => {
    const created = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Prep long",
      }),
    );
    const result = await setPatientNextConsultationPrep(
      systemActor,
      created.id,
      "x".repeat(10_001),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("invalid_input");
    }
  });

  it("ignores a malformed id", async () => {
    const result = await setPatientNextConsultationPrep(
      systemActor,
      "not-a-uuid",
      "nope",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_found");
    }
  });
});

/**
 * D-27: two practitioners, one file each. Every console read goes through
 * these helpers, so each practitioner sees only their own file.
 */
describe("the care relationship", () => {
  const morgane = testPractitionerId;
  const other = "00000000-0000-4000-8000-000000000002";

  const twoFiles = async () => ({
    mine: unwrapOk(
      await createPatient(systemActor, {
        practitionerId: morgane,
        pseudonym: "Mine",
      }),
    ),
    theirs: unwrapOk(
      await createPatient(systemActor, {
        practitionerId: other,
        pseudonym: "Theirs",
      }),
    ),
  });

  it("refuses a new file without a practitioner", async () => {
    const missing = await createPatient(systemActor, {
      pseudonym: "Orphan",
    } as Parameters<typeof createPatient>[1]);
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.error).toBe("invalid_input");
    }
    const malformed = await createPatient(systemActor, {
      practitionerId: "not-a-uuid",
      pseudonym: "Orphan",
    });
    expect(malformed.ok).toBe(false);
  });

  it("stores the practitioner on the new file", async () => {
    const { mine, theirs } = await twoFiles();
    expect(mine.practitionerId).toBe(morgane);
    expect(theirs.practitionerId).toBe(other);
  });

  it("lists only the practitioner's own files", async () => {
    const { mine, theirs } = await twoFiles();
    const morganes = await patientsOf(practitionerActor(morgane));
    expect(morganes.some((patient) => patient.id === mine.id)).toBe(true);
    expect(morganes.some((patient) => patient.id === theirs.id)).toBe(false);
    expect(
      morganes.every((patient) => patient.practitionerId === morgane),
    ).toBe(true);
    const others = await patientsOf(practitionerActor(other));
    expect(others.some((patient) => patient.id === theirs.id)).toBe(true);
    expect(others.every((patient) => patient.practitionerId === other)).toBe(
      true,
    );
  });

  it("lists nothing for a malformed practitioner id", async () => {
    await twoFiles();
    expect(await patientsOf(practitionerActor("not-a-uuid"))).toEqual([]);
  });

  it("opens a file only for its practitioner", async () => {
    const { mine, theirs } = await twoFiles();
    expect(
      unwrapOk(await patientOf(practitionerActor(morgane), mine.id)).id,
    ).toBe(mine.id);
    const refused = await patientOf(practitionerActor(morgane), theirs.id);
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe("not_found");
    }
  });

  it("never moves a file to another practitioner on update", async () => {
    const { mine } = await twoFiles();
    const updated = unwrapOk(
      await updatePatient(systemActor, mine.id, {
        practitionerId: other,
        objective: "unchanged holder",
      } as Parameters<typeof updatePatient>[2]),
    );
    expect(updated.practitionerId).toBe(morgane);
  });

  it("finds the file of a row, and refuses another practitioner's", async () => {
    const { mine, theirs } = await twoFiles();
    const recommendation = unwrapOk(
      await addPatientRecommendation(systemActor, theirs.id, {
        category: "nutrition",
        title: "Hydratation",
      }),
    );
    const refused = await patientOfRecord(
      practitionerActor(morgane),
      "recommendation",
      recommendation.id,
    );
    expect(refused.ok).toBe(false);
    expect(
      unwrapOk(
        await patientOfRecord(
          practitionerActor(other),
          "recommendation",
          recommendation.id,
        ),
      ).id,
    ).toBe(theirs.id);

    const goal = unwrapOk(
      await addPatientGoal(systemActor, mine.id, {
        title: "Sommeil",
        baseline: "4/10",
      }),
    );
    const checkIn = unwrapOk(
      await addGoalCheckIn(systemActor, goal.id, {
        checkedOn: "2026-11-01",
        direction: "better",
      }),
    );
    expect(
      unwrapOk(
        await patientOfRecord(
          practitionerActor(morgane),
          "goalCheckIn",
          checkIn.id,
        ),
      ).id,
    ).toBe(mine.id);
    expect(
      (
        await patientOfRecord(
          practitionerActor(other),
          "goalCheckIn",
          checkIn.id,
        )
      ).ok,
    ).toBe(false);
  });

  it("answers not found for a missing or malformed row", async () => {
    expect(
      (await patientOfRecord(practitionerActor(morgane), "note", "not-a-uuid"))
        .ok,
    ).toBe(false);
    expect(
      (
        await patientOfRecord(
          practitionerActor(morgane),
          "note",
          "00000000-0000-4000-8000-0000000000ff",
        )
      ).ok,
    ).toBe(false);
  });
});

describe("médicaments and compléments under the care consent", () => {
  const create = async (pseudonym: string) =>
    unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym,
      }),
    );

  const giveCare = async (patient: PatientProfile) => {
    const given = await recordConsent(systemActor, {
      patientId: patient.id,
      key: "care",
      version: "1",
      locale: "fr-BE",
      decision: "given",
      actor: { kind: "patient", id: patient.id, name: patient.pseudonym },
    });
    expect(given.ok).toBe(true);
  };

  it("refuses them on a new file, which holds no consent yet", async () => {
    for (const input of [
      { medications: "levothyroxine 50 µg" },
      { supplements: "vitamin D" },
    ]) {
      const created = await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Nouveau",
        ...input,
      });
      expect(created.ok).toBe(false);
      if (!created.ok) {
        expect(created.error).toBe("not_permitted");
      }
    }
  });

  it("refuses a new value without a given care consent", async () => {
    const patient = await create("Sans consentement");
    const updated = await updatePatient(systemActor, patient.id, {
      medications: "levothyroxine 50 µg",
    });
    expect(updated.ok).toBe(false);
    if (!updated.ok) {
      expect(updated.error).toBe("not_permitted");
    }
    expect(
      unwrapOk(await getPatient(systemActor, patient.id)).medications,
    ).toBe("");
  });

  it("stores them once the care consent is given", async () => {
    const patient = await create("Avec consentement");
    await giveCare(patient);
    const updated = unwrapOk(
      await updatePatient(systemActor, patient.id, {
        medications: "levothyroxine 50 µg",
        supplements: "vitamin D",
      }),
    );
    expect(updated.medications).toBe("levothyroxine 50 µg");
    expect(updated.supplements).toBe("vitamin D");
  });

  it("refuses a new value after the care consent is withdrawn, and still clears", async () => {
    const patient = await create("Retrait");
    await giveCare(patient);
    unwrapOk(
      await updatePatient(systemActor, patient.id, {
        supplements: "vitamin D",
      }),
    );
    await tick();
    const withdrawn = await recordConsent(systemActor, {
      patientId: patient.id,
      key: "care",
      version: "1",
      locale: "fr-BE",
      decision: "withdrawn",
      actor: { kind: "patient", id: patient.id, name: patient.pseudonym },
    });
    expect(withdrawn.ok).toBe(true);

    // The form posts the stored value back on every save: that passes.
    expect(
      (
        await updatePatient(systemActor, patient.id, {
          supplements: "vitamin D",
        })
      ).ok,
    ).toBe(true);
    expect(
      (
        await updatePatient(systemActor, patient.id, {
          supplements: "magnesium",
        })
      ).ok,
    ).toBe(false);
    const cleared = unwrapOk(
      await updatePatient(systemActor, patient.id, { supplements: "" }),
    );
    expect(cleared.supplements).toBe("");
  });
});

describe("the file status", () => {
  const morgane: AuditActor = {
    id: testPractitionerId,
    email: "morgane@example.com",
    name: "Morgane",
  };

  const newFile = async (pseudonym: string) =>
    unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym,
      }),
    );

  it("moves a file through the four statuses, one step at a time", async () => {
    const file = await newFile("Steps");
    expect(file.fileStatus).toBe("to_complete");
    const ready = unwrapOk(
      await setFileStatus(
        systemActor,
        file.id,
        "ready",
        morgane,
        "mandatory fields filled",
      ),
    );
    expect(ready.fileStatus).toBe("ready");
    const toValidate = unwrapOk(
      await setFileStatus(
        systemActor,
        file.id,
        "to_validate",
        morgane,
        "first recommendation",
      ),
    );
    expect(toValidate.fileStatus).toBe("to_validate");
    const active = unwrapOk(
      await setFileStatus(systemActor, file.id, "active", morgane, "activated"),
    );
    expect(active.fileStatus).toBe("active");
    expect(unwrapOk(await getPatient(systemActor, file.id)).fileStatus).toBe(
      "active",
    );
  });

  it("refuses a skipped step with a conflict and writes nothing", async () => {
    const file = await newFile("Skip");
    const skipped = await setFileStatus(
      systemActor,
      file.id,
      "to_validate",
      morgane,
      "early",
    );
    expect(skipped.ok).toBe(false);
    if (!skipped.ok) {
      expect(skipped.error).toBe("conflict");
    }
    expect(unwrapOk(await getPatient(systemActor, file.id)).fileStatus).toBe(
      "to_complete",
    );
    expect(
      await listAuditEvents(systemActor, { targetId: file.id }),
    ).toHaveLength(0);
  });

  it("refuses every move out of active", async () => {
    const file = await newFile("Active");
    await setFileStatus(systemActor, file.id, "ready", morgane, "filled");
    await setFileStatus(
      systemActor,
      file.id,
      "to_validate",
      morgane,
      "recommended",
    );
    await setFileStatus(systemActor, file.id, "active", morgane, "activated");
    for (const next of ["to_complete", "ready", "to_validate"] as const) {
      const moved = await setFileStatus(
        systemActor,
        file.id,
        next,
        morgane,
        "a change",
      );
      expect(moved.ok).toBe(false);
      if (!moved.ok) {
        expect(moved.error).toBe("conflict");
      }
    }
    expect(unwrapOk(await getPatient(systemActor, file.id)).fileStatus).toBe(
      "active",
    );
  });

  it("writes one audit event per applied move, with both statuses and the reason", async () => {
    const file = await newFile("Trail");
    await setFileStatus(
      systemActor,
      file.id,
      "ready",
      morgane,
      "mandatory fields filled",
    );
    const events = await listAuditEvents(systemActor, {
      action: "patient.file_status_changed",
      targetId: file.id,
    });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      actorKind: "operator",
      actorId: testPractitionerId,
      targetType: "patient",
      targetLabel: "Trail",
      detail: "to_complete → ready: mandatory fields filled",
    });
  });

  it("records the patient as the actor when the patient's write moves the file", async () => {
    const file = await newFile("Self");
    await setFileStatus(
      systemActor,
      file.id,
      "ready",
      { kind: "patient", id: file.id, name: file.pseudonym },
      "questionnaire complete",
    );
    const [event] = await listAuditEvents(systemActor, {
      action: "patient.file_status_changed",
      targetId: file.id,
    });
    expect(event?.actorKind).toBe("patient");
  });

  it("answers ok for the same status and writes nothing", async () => {
    const file = await newFile("Same");
    const same = unwrapOk(
      await setFileStatus(
        systemActor,
        file.id,
        "to_complete",
        morgane,
        "no change",
      ),
    );
    expect(same.fileStatus).toBe("to_complete");
    expect(
      await listAuditEvents(systemActor, { targetId: file.id }),
    ).toHaveLength(0);
  });

  it("refuses an unknown status, a missing reason and a missing file", async () => {
    const file = await newFile("Bad");
    const unknown = await setFileStatus(
      systemActor,
      file.id,
      "ended" as Parameters<typeof setFileStatus>[2],
      morgane,
      "wrong value",
    );
    expect(unknown.ok).toBe(false);
    if (!unknown.ok) {
      expect(unknown.error).toBe("invalid_input");
    }
    const noReason = await setFileStatus(
      systemActor,
      file.id,
      "ready",
      morgane,
      "  ",
    );
    expect(noReason.ok).toBe(false);
    if (!noReason.ok) {
      expect(noReason.error).toBe("invalid_input");
    }
    const missing = await setFileStatus(
      systemActor,
      "00000000-0000-4000-8000-0000000000ee",
      "ready",
      morgane,
      "no file",
    );
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.error).toBe("not_found");
    }
    expect(
      (await setFileStatus(systemActor, "not-a-uuid", "ready", morgane, "x"))
        .ok,
    ).toBe(false);
  });

  it("leaves the retention status alone, and updatePatient never moves the file status", async () => {
    const file = await newFile("Retention");
    await setFileStatus(systemActor, file.id, "ready", morgane, "filled");
    const ended = unwrapOk(
      await updatePatient(systemActor, file.id, { status: "ended" }),
    );
    expect(ended.status).toBe("ended");
    expect(ended.fileStatus).toBe("ready");
  });
});

describe("the console's identity fields and the e-mail lookup", () => {
  const other = "00000000-0000-4000-8000-000000000003";

  it("finds this practitioner's file by e-mail, ignoring case and spaces", async () => {
    const file = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Mail",
        email: "Lea.Martin@example.com",
      }),
    );
    const found = await findPatientByEmail(
      practitionerActor(testPractitionerId),
      " lea.martin@EXAMPLE.com ",
    );
    expect(found?.id).toBe(file.id);
  });

  it("never finds another practitioner's file", async () => {
    await createPatient(systemActor, {
      practitionerId: other,
      pseudonym: "Elsewhere",
      email: "elsewhere@example.com",
    });
    expect(
      await findPatientByEmail(
        practitionerActor(testPractitionerId),
        "elsewhere@example.com",
      ),
    ).toBeNull();
    expect(
      await findPatientByEmail(practitionerActor(testPractitionerId), ""),
    ).toBeNull();
    expect(
      await findPatientByEmail(practitionerActor("not-a-uuid"), "a@b.be"),
    ).toBeNull();
  });

  it("stores the first name, the last name and the phone without its spaces", async () => {
    const file = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Names",
      }),
    );
    const updated = unwrapOk(
      await updatePatient(systemActor, file.id, {
        firstName: "Léa",
        lastName: "Martin",
        fullName: "Léa Martin",
        phone: "+32 470 12 34 56",
      }),
    );
    expect(updated.firstName).toBe("Léa");
    expect(updated.lastName).toBe("Martin");
    expect(updated.phone).toBe("+32470123456");
    const cleared = unwrapOk(
      await updatePatient(systemActor, file.id, { phone: "" }),
    );
    expect(cleared.phone).toBeNull();
  });

  it("refuses a phone that is not a number", async () => {
    const file = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Phone",
      }),
    );
    const refused = await updatePatient(systemActor, file.id, {
      phone: "call me",
    });
    expect(refused.ok).toBe(false);
    const tooShort = await updatePatient(systemActor, file.id, {
      phone: "123",
    });
    expect(tooShort.ok).toBe(false);
  });
});

describe("the practitioner's patient list", () => {
  // A practitioner of its own, so no file of another describe block lands here.
  const practitioner = "00000000-0000-4000-8000-000000000051";
  const stranger = "00000000-0000-4000-8000-000000000052";

  const file = async (
    input: {
      pseudonym: string;
      lastName?: string;
      firstName?: string;
      fullName?: string;
      consultationDate?: string;
    },
    practitionerId = practitioner,
  ) => {
    const { consultationDate, ...fields } = input;
    const created = unwrapOk(
      await createPatient(systemActor, { practitionerId, ...fields }),
    );
    if (consultationDate) {
      // The questionnaire writes this column. The list only reads it.
      await getDatabase()
        .collection<PatientProfile & { consultationDate: string | null }>(
          "patient_profiles",
        )
        .update(created.id, { consultationDate });
    }
    return created;
  };

  let seeded = false;
  const seed = async () => {
    if (seeded) {
      return;
    }
    seeded = true;
    await file({
      pseudonym: "P-late",
      lastName: "Zola",
      firstName: "Émile",
      consultationDate: "2026-12-01",
    });
    await file({ pseudonym: "P-none", lastName: "Arnaud", firstName: "Léa" });
    await file({
      pseudonym: "P-early",
      lastName: "Martin",
      firstName: "Paul",
      consultationDate: "2026-11-10",
    });
    await file({
      pseudonym: "P-accent",
      lastName: "élodie",
      firstName: "Anne",
      consultationDate: "2026-11-20",
    });
    await file({ pseudonym: "P-legacy", fullName: "Dupont Jean" });
    await file(
      {
        pseudonym: "P-theirs",
        lastName: "Aaron",
        consultationDate: "2026-01-01",
      },
      stranger,
    );
  };

  it("lists only the practitioner's own files", async () => {
    await seed();
    const rows = await patientListOf(practitionerActor(practitioner));
    expect(rows).toHaveLength(5);
    expect(rows.every((row) => row.practitionerId === practitioner)).toBe(true);
    expect(await patientListOf(practitionerActor("not-a-uuid"))).toEqual([]);
  });

  it("sorts by appointment date, oldest first, files without a date last", async () => {
    await seed();
    const rows = await patientListOf(practitionerActor(practitioner), {
      sort: "appointment",
    });
    expect(rows.map((row) => row.pseudonym)).toEqual([
      "P-early",
      "P-accent",
      "P-late",
      // No date: by name among themselves.
      "P-none",
      "P-legacy",
    ]);
    expect(rows[0]?.consultationDate).toBe("2026-11-10");
    expect(rows[4]?.consultationDate).toBeNull();
  });

  it("sorts by appointment date when no sort is given", async () => {
    await seed();
    const rows = await patientListOf(practitionerActor(practitioner));
    expect(rows[0]?.pseudonym).toBe("P-early");
  });

  it("sorts by nom, then prénom, case and accent insensitive", async () => {
    await seed();
    await file({
      pseudonym: "P-martin-anna",
      lastName: "MARTIN",
      firstName: "anna",
    });
    const rows = await patientListOf(practitionerActor(practitioner), {
      sort: "name",
    });
    expect(rows.map((row) => row.pseudonym)).toEqual([
      "P-none", // Arnaud
      "P-legacy", // Dupont Jean, from the full name
      "P-accent", // élodie sorts as « elodie »
      "P-martin-anna", // MARTIN anna before Martin Paul
      "P-early",
      "P-late", // Zola
    ]);
  });

  it("keeps the search and the status filter of the roster", async () => {
    await seed();
    const found = await patientListOf(practitionerActor(practitioner), {
      search: "dupont",
    });
    expect(found.map((row) => row.pseudonym)).toEqual(["P-legacy"]);
    const paused = await patientListOf(practitionerActor(practitioner), {
      status: "paused",
    });
    expect(paused).toEqual([]);
  });

  it("falls back to the full name, then the pseudonym, for the nom", () => {
    const names = (
      lastName: string | null,
      firstName: string | null,
      fullName: string | null,
    ) => patientListNames({ lastName, firstName, fullName, pseudonym: "P-1" });
    expect(names(" Martin ", "Paul", null)).toEqual({
      nom: "Martin",
      prenom: "Paul",
    });
    expect(names(null, null, "Dupont Jean")).toEqual({
      nom: "Dupont Jean",
      prenom: "",
    });
    expect(names("", "Léa", "")).toEqual({ nom: "P-1", prenom: "" });
  });
});

describe("which files the practitioner's list shows", () => {
  // A practitioner of its own, so no file of another describe block lands here.
  const practitioner = "00000000-0000-4000-8000-000000000061";
  const pseudonymsOf = async () =>
    (await patientListOf(practitionerActor(practitioner))).map(
      (row) => row.pseudonym,
    );

  it("saves a signed-up patient's file and keeps it out of the list while incomplete", async () => {
    const file = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: practitioner,
        pseudonym: "P-signup-incomplete",
        createdBy: "patient",
      }),
    );
    expect(file.createdBy).toBe("patient");
    expect(unwrapOk(await getPatient(systemActor, file.id)).fileStatus).toBe(
      "to_complete",
    );
    expect(await pseudonymsOf()).not.toContain("P-signup-incomplete");
  });

  it("lists the signed-up patient as « Prêt pour consultation » once the file is ready", async () => {
    const file = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: practitioner,
        pseudonym: "P-signup-ready",
        createdBy: "patient",
      }),
    );
    expect(await pseudonymsOf()).not.toContain("P-signup-ready");
    unwrapOk(
      await setFileStatus(
        systemActor,
        file.id,
        "ready",
        null,
        "every mandatory field is filled",
      ),
    );
    const row = (await patientListOf(practitionerActor(practitioner))).find(
      (patient) => patient.id === file.id,
    );
    expect(row?.fileStatus).toBe("ready");
  });

  it("lists a practitioner's file at once as « Dossier à compléter »", async () => {
    const file = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: practitioner,
        pseudonym: "P-console",
      }),
    );
    expect(file.createdBy).toBe("practitioner");
    const row = (await patientListOf(practitionerActor(practitioner))).find(
      (patient) => patient.id === file.id,
    );
    expect(row?.fileStatus).toBe("to_complete");
  });

  it("lists a practitioner's file once after the patient takes it over", async () => {
    const file = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: practitioner,
        pseudonym: "P-taken-over",
      }),
    );
    unwrapOk(
      await createPatientAccount({
        patientProfileId: file.id,
        email: "taken-over@example.test",
        authSubject: "subject-taken-over",
      }),
    );
    const rows = await patientListOf(practitionerActor(practitioner));
    expect(rows.filter((row) => row.id === file.id)).toHaveLength(1);
    expect(rows.find((row) => row.id === file.id)?.createdBy).toBe(
      "practitioner",
    );
  });
});

describe("the patient's auth user (REM-133)", () => {
  /** The subjects the fake auth store deleted, and whether it refuses. */
  const deleted: string[] = [];
  let refuse = false;

  const fakeAuth: AuthProvider = {
    name: "fake",
    signUp: async () => err("upstream_failed", "not used"),
    signIn: async () => err("upstream_failed", "not used"),
    requestMagicLink: async () => ok(null),
    signOut: async () => ok(null),
    readIdentity: async () => null,
    renewSessionCache: async () => null,
    requestPasswordReset: async () => ok(null),
    resetPassword: async () => ok(null),
    completeRedirectSignIn: async () => null,
    deleteUser: async (subject) => {
      if (refuse) {
        return err("upstream_failed", "the auth store did not delete the user");
      }
      deleted.push(subject);
      return ok(null);
    },
    routeHandlers: () => {
      throw new Error("not used");
    },
  };

  const fileWithAccount = async (name: string) => {
    const file = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: name,
      }),
    );
    unwrapOk(
      await createPatientAccount({
        patientProfileId: file.id,
        email: `${name}@example.test`,
        authSubject: `subject-${name}`,
      }),
    );
    return file;
  };

  // First, before the fake is registered: this file registers it once.
  it("refuses a patient with an account when no auth provider is registered", async () => {
    const file = await fileWithAccount("no-provider");
    const result = await deletePatient(systemActor, file.id);
    expect(result.ok ? null : result.error).toBe("upstream_failed");
    expect((await getPatient(systemActor, file.id)).ok).toBe(true);
  });

  it("deletes the auth user, then the file", async () => {
    registerAuthProvider(fakeAuth);
    const file = await fileWithAccount("with-account");
    expect(unwrapOk(await deletePatient(systemActor, file.id))).toBe(true);
    expect(deleted).toContain("subject-with-account");
    expect((await getPatient(systemActor, file.id)).ok).toBe(false);
  });

  it("keeps the file when the auth store refuses, and a retry deletes it", async () => {
    const file = await fileWithAccount("refused");
    refuse = true;
    const refused = await deletePatient(systemActor, file.id);
    expect(refused.ok ? null : refused.error).toBe("upstream_failed");
    expect((await getPatient(systemActor, file.id)).ok).toBe(true);
    refuse = false;
    expect(unwrapOk(await deletePatient(systemActor, file.id))).toBe(true);
    expect(deleted).toContain("subject-refused");
  });

  it("asks nothing of the auth store for a file without an account", async () => {
    const file = unwrapOk(
      await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "no-account",
      }),
    );
    const before = deleted.length;
    expect(unwrapOk(await deletePatient(systemActor, file.id))).toBe(true);
    expect(deleted).toHaveLength(before);
  });
});
