import { beforeAll, describe, expect, it } from "vitest";
import { getDatabase, registerDatabase } from "../../client";
import type { PatientProfile } from "../../models/patient-profile";
import type { PatientQuestionnaire } from "../../models/patient-questionnaire";
import { createMemoryDatabase, testPractitionerId } from "../../test-helpers";
import { patientActor, systemActor } from "../access";
import { createOperator } from "../operators";
import { createPatient } from "../patients";
import { getPatientWaitingView } from "./index";

let withPractitioner: string;
let withoutPractitioner: string;

const newPatient = async (practitionerId: string, pseudonym: string) => {
  const patient = await createPatient(systemActor, {
    practitionerId,
    pseudonym,
  });
  if (!patient.ok) {
    throw new Error("test patient not created");
  }
  return patient.data.id;
};

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  const operator = await createOperator({
    email: "morgane@example.be",
    name: "  Morgane Paquet ",
    password: "long enough password",
  });
  if (!operator.ok) {
    throw new Error("test operator not created");
  }
  withPractitioner = await newPatient(operator.data.id, "Patient ABCD");
  // The memory client checks no foreign key: this file has no operator row.
  withoutPractitioner = await newPatient(testPractitionerId, "Patient EFGH");
});

describe("the waiting view", () => {
  it("gives the practitioner's name and no date when none is set", async () => {
    const view = await getPatientWaitingView(
      patientActor(withPractitioner),
      withPractitioner,
    );
    expect(view).toEqual({
      ok: true,
      data: { practitionerName: "Morgane Paquet", appointmentDate: null },
    });
  });

  it("gives the appointment date of the questionnaire", async () => {
    await getDatabase()
      .collection<PatientProfile & PatientQuestionnaire>("patient_profiles")
      .update(withPractitioner, { consultationDate: "2026-12-03" });
    const view = await getPatientWaitingView(
      patientActor(withPractitioner),
      withPractitioner,
    );
    expect(view.ok ? view.data.appointmentDate : null).toBe("2026-12-03");
  });

  it("gives only the name and the date", async () => {
    const view = await getPatientWaitingView(
      patientActor(withPractitioner),
      withPractitioner,
    );
    expect(Object.keys(view.ok ? view.data : {}).sort()).toEqual([
      "appointmentDate",
      "practitionerName",
    ]);
  });

  it("gives no name when the practitioner's row is not there", async () => {
    const view = await getPatientWaitingView(
      patientActor(withoutPractitioner),
      withoutPractitioner,
    );
    expect(view.ok ? view.data.practitionerName : "").toBeNull();
  });

  it("refuses a patient who reads the file of another patient", async () => {
    const view = await getPatientWaitingView(
      patientActor(withoutPractitioner),
      withPractitioner,
    );
    expect(view.ok ? null : view.error).toBe("not_found");
  });

  it("answers not found for an id that is not an id", async () => {
    const view = await getPatientWaitingView(systemActor, "nope");
    expect(view.ok ? null : view.error).toBe("not_found");
  });
});
