import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase, testPractitionerId } from "../../test-helpers";
import { addGoalCheckIn, addPatientGoal } from "../patient-goals";
import { addPatientRecommendation } from "../patient-recommendations";
import {
  createPatient,
  deletePatient,
  getPatient,
  getPatientByShareToken,
  patientOf,
  patientOfRecord,
  patientsOf,
  recordPatientLinkOpened,
  regenerateShareToken,
  setPatientNextConsultationPrep,
  updatePatient,
  updatePatientProfileByPatient,
  type PatientProfileEdit,
} from "./index";

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
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Claire",
      }),
    );
    expect(patient.pseudonym).toBe("Claire");
    expect(patient.fullName).toBeNull();
    expect(patient.email).toBeNull();
    expect(patient.locale).toBe("fr");
    expect(patient.status).toBe("active");
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
    const result = await createPatient({
      practitionerId: testPractitionerId,
      pseudonym: "   ",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("invalid_input");
    }
  });

  it("rejects an invalid email", async () => {
    const result = await createPatient({
      practitionerId: testPractitionerId,
      pseudonym: "Claire",
      email: "not-an-email",
    });
    expect(result.ok).toBe(false);
  });

  it("updates partially without blanking the rest", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Marc",
        objective: "sleep better",
        constraints: "no gluten",
      }),
    );
    const updated = unwrapOk(
      await updatePatient(created.id, { objective: "sleep and energy" }),
    );
    expect(updated.objective).toBe("sleep and energy");
    expect(updated.constraints).toBe("no gluten");
    expect(updated.pseudonym).toBe("Marc");
    expect(updated.shareToken).toBe(created.shareToken);
  });

  it("maps an emptied full name and email back to null", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Iris",
        fullName: "Iris Dupont",
        email: "iris@example.com",
      }),
    );
    const updated = unwrapOk(
      await updatePatient(created.id, { fullName: "", email: "" }),
    );
    expect(updated.fullName).toBeNull();
    expect(updated.email).toBeNull();
  });

  it("resolves the share token exactly, and not at all after regeneration", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Nora",
      }),
    );
    const byToken = unwrapOk(await getPatientByShareToken(created.shareToken));
    expect(byToken.id).toBe(created.id);

    const regenerated = unwrapOk(await regenerateShareToken(created.id));
    expect(regenerated.shareToken).not.toBe(created.shareToken);
    expect((await getPatientByShareToken(created.shareToken)).ok).toBe(false);
    expect((await getPatientByShareToken(regenerated.shareToken)).ok).toBe(
      true,
    );
  });

  it("treats a malformed id or token as not found, never as an error", async () => {
    expect((await getPatient("not-a-uuid")).ok).toBe(false);
    expect((await getPatientByShareToken("nope")).ok).toBe(false);
    expect((await updatePatient("not-a-uuid", {})).ok).toBe(false);
    expect((await deletePatient("not-a-uuid")).ok).toBe(false);
  });

  it("deletes, and the list reflects it", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Temp",
      }),
    );
    expect(unwrapOk(await deletePatient(created.id))).toBe(true);
    expect((await getPatient(created.id)).ok).toBe(false);
    const remaining = await patientsOf(testPractitionerId);
    expect(remaining.some((patient) => patient.id === created.id)).toBe(false);
  });
});

describe("clinical fields", () => {
  it("records a birth date, sex and measurements", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Alix",
        birthDate: "1984-03-11",
        sex: "female",
        heightCm: "168",
        weightKg: "62.5",
        medications: "levothyroxine 50 µg",
        supplements: "vitamin D",
        referral: "Dr Laurent",
      }),
    );
    expect(created.birthDate).toBe("1984-03-11");
    expect(created.sex).toBe("female");
    expect(created.heightCm).toBe(168);
    expect(created.weightKg).toBe(62.5);
    expect(created.medications).toBe("levothyroxine 50 µg");
    expect(created.referral).toBe("Dr Laurent");
  });

  it("rejects a malformed birth date and an out-of-range measurement", async () => {
    expect(
      (
        await createPatient({
          practitionerId: testPractitionerId,
          pseudonym: "Bad",
          birthDate: "11/03/1984",
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await createPatient({
          practitionerId: testPractitionerId,
          pseudonym: "Bad",
          birthDate: "1984-13-45",
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await createPatient({
          practitionerId: testPractitionerId,
          pseudonym: "Bad",
          heightCm: "0",
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await createPatient({
          practitionerId: testPractitionerId,
          pseudonym: "Bad",
          weightKg: "heavy",
        })
      ).ok,
    ).toBe(false);
  });

  it("clears an optional number and date with an empty string", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Clear",
        birthDate: "1990-01-01",
        heightCm: "170",
        weightKg: "70",
      }),
    );
    const cleared = unwrapOk(
      await updatePatient(created.id, {
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
  it("records a date and a channel", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Consented",
        consentDate: "2026-08-14",
        consentChannel: "whatsapp",
      }),
    );
    expect(created.consentDate).toBe("2026-08-14");
    expect(created.consentChannel).toBe("whatsapp");
  });

  it("records it after the fact, without touching the rest of the profile", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Later",
        objective: "sleep better",
      }),
    );
    expect(created.consentDate).toBeNull();

    const updated = unwrapOk(
      await updatePatient(created.id, {
        consentDate: "2026-09-01",
        consentChannel: "consultation",
      }),
    );
    expect(updated.consentDate).toBe("2026-09-01");
    expect(updated.consentChannel).toBe("consultation");
    expect(updated.objective).toBe("sleep better");
  });

  it("rejects a channel outside the closed set and a malformed date", async () => {
    expect(
      (
        await createPatient({
          practitionerId: testPractitionerId,
          pseudonym: "Bad",
          // The whole point of the enum: "par courrier" is not a channel.
          consentChannel: "post" as never,
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await createPatient({
          practitionerId: testPractitionerId,
          pseudonym: "Bad",
          consentDate: "14/08/2026",
        })
      ).ok,
    ).toBe(false);
  });

  it("clears both with an empty string", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Withdrawn",
        consentDate: "2026-08-14",
        consentChannel: "email",
      }),
    );
    const cleared = unwrapOk(
      await updatePatient(created.id, { consentDate: "", consentChannel: "" }),
    );
    expect(cleared.consentDate).toBeNull();
    expect(cleared.consentChannel).toBeNull();
  });

  it("blocks nothing: a profile with no consent still saves and still shares", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "No consent",
      }),
    );
    const updated = unwrapOk(
      await updatePatient(created.id, { objective: "more energy" }),
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
      await createPatient({
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
      await createPatient({
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
        await createPatient({
          practitionerId: testPractitionerId,
          pseudonym: "Cook",
          likesCooking: affinity,
        }),
      );
      expect(created.likesCooking).toBe(affinity);
    }
    expect(
      (
        await createPatient({
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
        await createPatient({
          practitionerId: testPractitionerId,
          pseudonym: "Time",
          cookingTime,
        }),
      );
      expect(created.cookingTime).toBe(cookingTime);
    }
    for (const foodBudget of ["economical", "standard", "comfort"] as const) {
      const created = unwrapOk(
        await createPatient({
          practitionerId: testPractitionerId,
          pseudonym: "Budget",
          foodBudget,
        }),
      );
      expect(created.foodBudget).toBe(foodBudget);
    }
    expect(
      (
        await createPatient({
          practitionerId: testPractitionerId,
          pseudonym: "Bad",
          foodBudget: "serré, courses au marché" as never,
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await createPatient({
          practitionerId: testPractitionerId,
          pseudonym: "Bad",
          cookingTime: "30 min" as never,
        })
      ).ok,
    ).toBe(false);
  });

  it("clears a text field and the affinity with an empty string", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Revised",
        allergies: "fruits à coque",
        likesCooking: "yes",
      }),
    );
    const cleared = unwrapOk(
      await updatePatient(created.id, { allergies: "", likesCooking: "" }),
    );
    expect(cleared.allergies).toBe("");
    expect(cleared.likesCooking).toBeNull();
  });

  it("updates one without blanking the others", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Partial",
        dietaryRegime: "sans gluten",
        allergies: "arachides",
        likesCooking: "no",
        foodBudget: "standard",
      }),
    );
    const updated = unwrapOk(
      await updatePatient(created.id, { intolerances: "lactose" }),
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
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Lina",
        allergies: "arachides",
      }),
    );
    const edited = unwrapOk(
      await updatePatientProfileByPatient(
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
    const saved = unwrapOk(await getPatient(created.id));
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
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Maé",
        allergies: "arachides",
      }),
    );
    const edited = unwrapOk(
      await updatePatientProfileByPatient(created.id, profileEdit()),
    );
    expect(edited.changed).toContain("allergies");
    const saved = unwrapOk(await getPatient(created.id));
    expect(saved.allergies).toBe("");
    expect(saved.patientEditedAt.allergies).toBeDefined();
  });

  it("changes nothing, and dates nothing, when the form is posted as it was", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Same",
        allergies: "lactose",
        likesCooking: "yes",
      }),
    );
    const edited = unwrapOk(
      await updatePatientProfileByPatient(
        created.id,
        profileEdit({ allergies: " lactose ", likesCooking: "yes" }),
      ),
    );
    expect(edited.changed).toEqual([]);
    expect(unwrapOk(await getPatient(created.id)).patientEditedAt).toEqual({});
  });

  it("never moves the roster timestamp — that one is Morgane's", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Roster",
      }),
    );
    await tick();
    unwrapOk(
      await updatePatientProfileByPatient(
        created.id,
        profileEdit({ cookingTime: "high" }),
      ),
    );
    expect(unwrapOk(await getPatient(created.id)).lastEditedAt.getTime()).toBe(
      created.lastEditedAt.getTime(),
    );
  });

  it("refuses a level outside the set and an unknown patient", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Strict",
      }),
    );
    expect(
      (
        await updatePatientProfileByPatient(
          created.id,
          profileEdit({ foodBudget: "cher" as never }),
        )
      ).ok,
    ).toBe(false);
    const missing = await updatePatientProfileByPatient(
      "00000000-0000-4000-8000-000000000000",
      profileEdit(),
    );
    expect(missing.ok).toBe(false);
  });

  it("drops the patient's date from a field only when Morgane changes that field", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Handover",
        allergies: "arachides",
      }),
    );
    unwrapOk(
      await updatePatientProfileByPatient(
        created.id,
        profileEdit({ allergies: "arachides, sésame", cookingTime: "low" }),
      ),
    );

    // Her console form posts every field; only the budget actually moves.
    const after = unwrapOk(
      await updatePatient(created.id, {
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
      await updatePatient(created.id, { allergies: "arachides" }),
    );
    expect(rewritten.patientEditedAt.allergies).toBeUndefined();
    expect(rewritten.patientEditedAt.cookingTime).toBeDefined();
  });
});

describe("the roster query", () => {
  it("searches the pseudonym, the full name and the email", async () => {
    await createPatient({
      practitionerId: testPractitionerId,
      pseudonym: "Zephyr",
      fullName: "Camille Rousseau",
      email: "camille@example.com",
    });
    expect(
      (await patientsOf(testPractitionerId, { search: "zeph" })).some(
        (patient) => patient.pseudonym === "Zephyr",
      ),
    ).toBe(true);
    expect(
      (await patientsOf(testPractitionerId, { search: "ROUSSEAU" })).some(
        (patient) => patient.pseudonym === "Zephyr",
      ),
    ).toBe(true);
    expect(
      (await patientsOf(testPractitionerId, { search: "camille@" })).some(
        (patient) => patient.pseudonym === "Zephyr",
      ),
    ).toBe(true);
    expect(
      await patientsOf(testPractitionerId, { search: "no such patient" }),
    ).toEqual([]);
  });

  it("filters by status, and 'all' is not a filter", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Paused one",
      }),
    );
    await updatePatient(created.id, { status: "paused" });

    const paused = await patientsOf(testPractitionerId, { status: "paused" });
    expect(paused.every((patient) => patient.status === "paused")).toBe(true);
    expect(paused.some((patient) => patient.id === created.id)).toBe(true);

    const active = await patientsOf(testPractitionerId, { status: "active" });
    expect(active.some((patient) => patient.id === created.id)).toBe(false);

    const all = await patientsOf(testPractitionerId, { status: "all" });
    expect(all.length).toBeGreaterThan(paused.length);
  });

  it("sorts by name, and by the last operator edit", async () => {
    const byName = await patientsOf(testPractitionerId, { sort: "name" });
    const pseudonyms = byName.map((patient) => patient.pseudonym);
    expect(pseudonyms).toEqual(
      [...pseudonyms].sort((a, b) => a.localeCompare(b, "fr")),
    );

    const target = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Most recent",
      }),
    );
    await tick();
    await updatePatient(target.id, { objective: "touched last" });
    const byRecent = await patientsOf(testPractitionerId, { sort: "recent" });
    expect(byRecent[0]?.id).toBe(target.id);
  });
});

describe("the share link's last-opened stamp", () => {
  it("records the first open and leaves the operator's edit stamp alone", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Opened",
      }),
    );
    await tick();
    await recordPatientLinkOpened(created.id);

    const opened = unwrapOk(await getPatient(created.id));
    expect(opened.linkLastOpenedAt).not.toBeNull();
    // The whole reason the two timestamps are separate columns: a patient
    // reading their page must not reorder Morgane's roster.
    expect(opened.lastEditedAt.getTime()).toBe(created.lastEditedAt.getTime());
  });

  it("does not rewrite the stamp on a second open inside the interval", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Hammered",
      }),
    );
    await recordPatientLinkOpened(created.id);
    const first = unwrapOk(await getPatient(created.id)).linkLastOpenedAt;

    await tick();
    await recordPatientLinkOpened(created.id);
    const second = unwrapOk(await getPatient(created.id)).linkLastOpenedAt;

    expect(second?.getTime()).toBe(first?.getTime());
  });

  it("forgets the stamp when the link is regenerated", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Rotated",
      }),
    );
    await recordPatientLinkOpened(created.id);
    const regenerated = unwrapOk(await regenerateShareToken(created.id));
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
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Prep",
      }),
    );
    expect(created.nextConsultationPrep).toBeNull();
  });

  it("sets the note and moves the operator edit stamp", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Prep set",
      }),
    );
    const before = created.lastEditedAt.getTime();
    await tick();

    const updated = unwrapOk(
      await setPatientNextConsultationPrep(
        created.id,
        "Revoir le petit déjeuner",
      ),
    );
    expect(updated.nextConsultationPrep).toBe("Revoir le petit déjeuner");
    expect(updated.lastEditedAt.getTime()).toBeGreaterThan(before);
  });

  it("clears with an empty string back to null", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Prep clear",
      }),
    );
    await setPatientNextConsultationPrep(created.id, "quelque chose");
    const cleared = unwrapOk(
      await setPatientNextConsultationPrep(created.id, ""),
    );
    expect(cleared.nextConsultationPrep).toBeNull();
  });

  it("writes only the prep field and no sibling fields", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Prep narrow",
        objective: "keep me",
      }),
    );
    const updated = unwrapOk(
      await setPatientNextConsultationPrep(created.id, "noter la pesée"),
    );
    expect(updated.objective).toBe("keep me");
    expect(updated.nextConsultationPrep).toBe("noter la pesée");
  });

  it("rejects an over-long note", async () => {
    const created = unwrapOk(
      await createPatient({
        practitionerId: testPractitionerId,
        pseudonym: "Prep long",
      }),
    );
    const result = await setPatientNextConsultationPrep(
      created.id,
      "x".repeat(10_001),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("invalid_input");
    }
  });

  it("ignores a malformed id", async () => {
    const result = await setPatientNextConsultationPrep("not-a-uuid", "nope");
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
      await createPatient({ practitionerId: morgane, pseudonym: "Mine" }),
    ),
    theirs: unwrapOk(
      await createPatient({ practitionerId: other, pseudonym: "Theirs" }),
    ),
  });

  it("refuses a new file without a practitioner", async () => {
    const missing = await createPatient({
      pseudonym: "Orphan",
    } as Parameters<typeof createPatient>[0]);
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.error).toBe("invalid_input");
    }
    const malformed = await createPatient({
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
    const morganes = await patientsOf(morgane);
    expect(morganes.some((patient) => patient.id === mine.id)).toBe(true);
    expect(morganes.some((patient) => patient.id === theirs.id)).toBe(false);
    expect(
      morganes.every((patient) => patient.practitionerId === morgane),
    ).toBe(true);
    const others = await patientsOf(other);
    expect(others.some((patient) => patient.id === theirs.id)).toBe(true);
    expect(others.every((patient) => patient.practitionerId === other)).toBe(
      true,
    );
  });

  it("lists nothing for a malformed practitioner id", async () => {
    await twoFiles();
    expect(await patientsOf("not-a-uuid")).toEqual([]);
  });

  it("opens a file only for its practitioner", async () => {
    const { mine, theirs } = await twoFiles();
    expect(unwrapOk(await patientOf(morgane, mine.id)).id).toBe(mine.id);
    const refused = await patientOf(morgane, theirs.id);
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe("not_found");
    }
  });

  it("never moves a file to another practitioner on update", async () => {
    const { mine } = await twoFiles();
    const updated = unwrapOk(
      await updatePatient(mine.id, {
        practitionerId: other,
        objective: "unchanged holder",
      } as Parameters<typeof updatePatient>[1]),
    );
    expect(updated.practitionerId).toBe(morgane);
  });

  it("finds the file of a row, and refuses another practitioner's", async () => {
    const { mine, theirs } = await twoFiles();
    const recommendation = unwrapOk(
      await addPatientRecommendation(theirs.id, {
        category: "nutrition",
        title: "Hydratation",
      }),
    );
    const refused = await patientOfRecord(
      morgane,
      "recommendation",
      recommendation.id,
    );
    expect(refused.ok).toBe(false);
    expect(
      unwrapOk(
        await patientOfRecord(other, "recommendation", recommendation.id),
      ).id,
    ).toBe(theirs.id);

    const goal = unwrapOk(
      await addPatientGoal(mine.id, { title: "Sommeil", baseline: "4/10" }),
    );
    const checkIn = unwrapOk(
      await addGoalCheckIn(goal.id, {
        checkedOn: "2026-11-01",
        direction: "better",
      }),
    );
    expect(
      unwrapOk(await patientOfRecord(morgane, "goalCheckIn", checkIn.id)).id,
    ).toBe(mine.id);
    expect((await patientOfRecord(other, "goalCheckIn", checkIn.id)).ok).toBe(
      false,
    );
  });

  it("answers not found for a missing or malformed row", async () => {
    expect((await patientOfRecord(morgane, "note", "not-a-uuid")).ok).toBe(
      false,
    );
    expect(
      (
        await patientOfRecord(
          morgane,
          "note",
          "00000000-0000-4000-8000-0000000000ff",
        )
      ).ok,
    ).toBe(false);
  });
});
