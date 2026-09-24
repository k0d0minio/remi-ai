import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { registerDatabase } from "../../client";
import type { Operator } from "../../models/operator";
import type { PatientProfile } from "../../models/patient-profile";
import { createMemoryDatabase } from "../../test-helpers";
import { createOperator } from "../operators";
import { writeThroughPatientLink } from "../patient-link-writes";
import { createPatient } from "../patients";
import {
  countUnreadPatientMessages,
  listPatientMessages,
  listUnreadMessageCounts,
  markPatientMessageRead,
  replyToPatient,
  sendPatientMessage,
} from "./index";

let morgane: Operator;

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  const created = await createOperator({
    email: "morgane@example.test",
    name: "Morgane",
    password: "a long enough password",
  });
  if (!created.ok) {
    throw new Error(created.message);
  }
  morgane = created.data;
});

afterEach(() => {
  vi.useRealTimers();
});

/** A fresh patient per test, so no test inherits another's thread. */
const newPatient = async (pseudonym: string): Promise<PatientProfile> => {
  const created = await createPatient({ pseudonym });
  if (!created.ok) {
    throw new Error(created.message);
  }
  return created.data;
};

/** Pins the clock, so the order of a thread is the order it was written in. */
const at = (iso: string) => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(iso));
};

const send = async (patientId: string, body: string) => {
  const result = await sendPatientMessage(patientId, body);
  if (!result.ok) {
    throw new Error(`message "${body}" refused: ${result.message}`);
  }
  return result.data;
};

describe("the patient's message", () => {
  it("is stored as the patient's, unread, with its words trimmed", async () => {
    const patient = await newPatient("Claire");
    const message = await send(patient.id, "  Une bonne semaine.  ");

    expect(message.author).toBe("patient");
    expect(message.body).toBe("Une bonne semaine.");
    expect(message.readAt).toBeNull();
    expect(message.operatorId).toBeNull();
    expect(await countUnreadPatientMessages(patient.id)).toBe(1);
  });

  it("refuses an empty message and stores nothing", async () => {
    const patient = await newPatient("Inès");
    const result = await sendPatientMessage(patient.id, "   ");

    expect(!result.ok && result.error).toBe("invalid_input");
    expect(await listPatientMessages(patient.id)).toHaveLength(0);
  });

  it("refuses a message over 2000 characters and stores nothing", async () => {
    const patient = await newPatient("Léa");
    const result = await sendPatientMessage(patient.id, "a".repeat(2001));

    expect(!result.ok && result.error).toBe("invalid_input");
    expect(await listPatientMessages(patient.id)).toHaveLength(0);
  });

  it("accepts exactly 2000 characters", async () => {
    const patient = await newPatient("Nora");
    const result = await sendPatientMessage(patient.id, "a".repeat(2000));

    expect(result.ok).toBe(true);
  });

  it("goes through the link path and is recorded to the patient", async () => {
    const patient = await newPatient("Marc");
    const result = await writeThroughPatientLink({
      token: patient.shareToken,
      action: "message.sent",
      text: { bodies: ["Les recettes me plaisent."] },
      target: { type: "patient_message" },
      write: async (resolved) =>
        sendPatientMessage(resolved.id, "Les recettes me plaisent."),
    });

    expect(result.ok).toBe(true);
    const [message] = await listPatientMessages(patient.id);
    expect(message.author).toBe("patient");
    expect(message.patientId).toBe(patient.id);
  });
});

describe("the thread", () => {
  it("reads newest first, her replies under her name", async () => {
    const patient = await newPatient("Paul");
    at("2026-09-21T09:00:00Z");
    await send(patient.id, "Première semaine");
    at("2026-09-22T09:00:00Z");
    await replyToPatient(patient.id, morgane.id, "Merci Paul");
    at("2026-09-28T09:00:00Z");
    await send(patient.id, "Deuxième semaine");

    const thread = await listPatientMessages(patient.id);
    expect(thread.map((message) => message.body)).toEqual([
      "Deuxième semaine",
      "Merci Paul",
      "Première semaine",
    ]);
    expect(thread[1].author).toBe("practitioner");
    expect(thread[1].operatorId).toBe(morgane.id);
    expect(thread[1].operatorName).toBe("Morgane");
    expect(thread[0].operatorName).toBeNull();
  });
});

describe("unread, and what clears it", () => {
  it("a reply marks every earlier patient message read, and a later one stays unread", async () => {
    const patient = await newPatient("Rita");
    at("2026-09-21T09:00:00Z");
    await send(patient.id, "Lundi");
    at("2026-09-22T09:00:00Z");
    await send(patient.id, "Mardi");
    at("2026-09-23T09:00:00Z");
    const replied = await replyToPatient(patient.id, morgane.id, "Bien reçu");
    at("2026-09-24T09:00:00Z");
    await send(patient.id, "Mercredi");

    expect(replied.ok && replied.data.markedRead).toBe(2);
    expect(await countUnreadPatientMessages(patient.id)).toBe(1);
    const unread = (await listPatientMessages(patient.id)).filter(
      (message) => message.author === "patient" && message.readAt === null,
    );
    expect(unread.map((message) => message.body)).toEqual(["Mercredi"]);
  });

  it("a reply is never itself unread", async () => {
    const patient = await newPatient("Sam");
    await replyToPatient(patient.id, morgane.id, "Comment allez-vous ?");

    expect(await countUnreadPatientMessages(patient.id)).toBe(0);
  });

  it("refuses an empty reply and changes nothing", async () => {
    const patient = await newPatient("Ugo");
    await send(patient.id, "Une question");
    const result = await replyToPatient(patient.id, morgane.id, "  ");

    expect(!result.ok && result.error).toBe("invalid_input");
    expect(await countUnreadPatientMessages(patient.id)).toBe(1);
    expect(await listPatientMessages(patient.id)).toHaveLength(1);
  });

  it("« Marquer comme lu » clears one message without a reply", async () => {
    const patient = await newPatient("Vera");
    const first = await send(patient.id, "Tout va bien");
    await send(patient.id, "Et une question");

    const result = await markPatientMessageRead(first.id);
    expect(result.ok && result.data.readAt).toBeInstanceOf(Date);
    expect(await countUnreadPatientMessages(patient.id)).toBe(1);
  });

  it("marking a read message again is a no-op, not a refusal", async () => {
    const patient = await newPatient("Zoé");
    const message = await send(patient.id, "Merci");
    const first = await markPatientMessageRead(message.id);
    const second = await markPatientMessageRead(message.id);

    expect(second.ok).toBe(true);
    expect(first.ok && second.ok && second.data.readAt).toEqual(
      first.ok && first.data.readAt,
    );
  });

  it("refuses to mark her own reply, or an unknown id", async () => {
    const patient = await newPatient("Yann");
    const replied = await replyToPatient(patient.id, morgane.id, "Bonjour");
    if (!replied.ok) {
      throw new Error(replied.message);
    }

    const own = await markPatientMessageRead(replied.data.reply.id);
    const unknown = await markPatientMessageRead("not-a-uuid");
    expect(!own.ok && own.error).toBe("not_found");
    expect(!unknown.ok && unknown.error).toBe("not_found");
  });

  it("reading the thread clears nothing", async () => {
    const patient = await newPatient("Xavier");
    await send(patient.id, "Une nouvelle");
    await listPatientMessages(patient.id);

    expect(await countUnreadPatientMessages(patient.id)).toBe(1);
  });

  it("the roster counts per patient, and only unread ones", async () => {
    const busy = await newPatient("Wanda");
    const answered = await newPatient("Victor");
    await send(busy.id, "Un");
    await send(busy.id, "Deux");
    await send(answered.id, "Trois");
    await replyToPatient(answered.id, morgane.id, "Merci");

    const counts = await listUnreadMessageCounts();
    expect(counts.get(busy.id)).toBe(2);
    expect(counts.has(answered.id)).toBe(false);
  });
});
