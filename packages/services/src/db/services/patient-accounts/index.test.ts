import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase, testPractitionerId } from "../../test-helpers";
import { createPatient } from "../patients";
import {
  createPatientAccount,
  getPatientAccountByEmail,
  getPatientAccountBySubject,
} from "./index";

let claireId: string;
let marcId: string;

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  const claire = await createPatient({
    practitionerId: testPractitionerId,
    pseudonym: "Claire",
  });
  const marc = await createPatient({
    practitionerId: testPractitionerId,
    pseudonym: "Marc",
  });
  if (!claire.ok || !marc.ok) {
    throw new Error("test patients not created");
  }
  claireId = claire.data.id;
  marcId = marc.data.id;
});

describe("patient accounts", () => {
  it("creates one account, with the e-mail lower-cased and no activation", async () => {
    const created = await createPatientAccount({
      patientProfileId: claireId,
      email: "  Claire@Example.BE ",
      authSubject: "user-claire",
    });
    expect(created.ok).toBe(true);
    if (created.ok) {
      expect(created.data.email).toBe("claire@example.be");
      expect(created.data.activatedAt).toBeNull();
    }
  });

  it("reads the account by subject and by e-mail in any case", async () => {
    const bySubject = await getPatientAccountBySubject("user-claire");
    const byEmail = await getPatientAccountByEmail("CLAIRE@example.be");
    expect(bySubject?.patientProfileId).toBe(claireId);
    expect(byEmail?.id).toBe(bySubject?.id);
  });

  it("answers null for an unknown or blank subject and e-mail", async () => {
    expect(await getPatientAccountBySubject("nobody")).toBeNull();
    expect(await getPatientAccountBySubject("  ")).toBeNull();
    expect(await getPatientAccountByEmail("")).toBeNull();
  });

  it("refuses a second account for the same patient", async () => {
    const again = await createPatientAccount({
      patientProfileId: claireId,
      email: "other@example.be",
      authSubject: "user-other",
    });
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe("conflict");
    }
  });

  it("refuses an e-mail that another patient holds, whatever the case", async () => {
    const taken = await createPatientAccount({
      patientProfileId: marcId,
      email: "CLAIRE@example.be",
      authSubject: "user-marc",
    });
    expect(taken.ok).toBe(false);
    if (!taken.ok) {
      expect(taken.error).toBe("conflict");
    }
  });

  it("refuses an auth subject that is already linked", async () => {
    const taken = await createPatientAccount({
      patientProfileId: marcId,
      email: "marc@example.be",
      authSubject: "user-claire",
    });
    expect(taken.ok).toBe(false);
    if (!taken.ok) {
      expect(taken.error).toBe("conflict");
    }
  });

  it("refuses a bad e-mail, and an unknown patient", async () => {
    const badEmail = await createPatientAccount({
      patientProfileId: marcId,
      email: "not-an-email",
      authSubject: "user-marc",
    });
    const noPatient = await createPatientAccount({
      patientProfileId: "00000000-0000-4000-8000-000000000000",
      email: "ghost@example.be",
      authSubject: "user-ghost",
    });
    expect(badEmail.ok ? null : badEmail.error).toBe("invalid_input");
    expect(noPatient.ok ? null : noPatient.error).toBe("not_found");
  });
});
