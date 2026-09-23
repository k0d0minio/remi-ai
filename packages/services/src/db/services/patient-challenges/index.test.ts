import { beforeAll, describe, expect, it } from "vitest";
import { todayAtPractice } from "../../../shared/format";
import type { Id } from "../../../types";
import {
  registerDatabase,
  type Collection,
  type DatabaseClient,
} from "../../client";
import type { PatientProfile } from "../../models/patient-profile";
import { createMemoryDatabase } from "../../test-helpers";
import { createPatient } from "../patients";
import { writeThroughPatientLink } from "../patient-link-writes";
import {
  challengeOwner,
  closeChallenge,
  getCurrentChallenge,
  listChallengeSignals,
  listPastChallenges,
  setChallengeAcquired,
  setChallengeReadyForNext,
  startChallenge,
  updateChallenge,
} from "./index";

/**
 * The memory client, wrapped so one test can make the next challenge insert
 * fail. The wrapper has to reach inside transactions too — the memory client
 * hands `fn` its own inner client — or the failure would never fire where the
 * close-and-create actually runs.
 */
let failNextChallengeInsert = false;

const failing = (inner: DatabaseClient): DatabaseClient => ({
  ...inner,
  collection: <T extends { id: Id }>(name: string): Collection<T> => {
    const collection = inner.collection<T>(name);
    if (name !== "patient_challenges") {
      return collection;
    }
    return {
      ...collection,
      insert: async (doc) => {
        if (failNextChallengeInsert) {
          failNextChallengeInsert = false;
          throw new Error("insert failed");
        }
        return collection.insert(doc);
      },
    };
  },
  transaction: (fn) => inner.transaction((tx) => fn(failing(tx))),
});

beforeAll(() => {
  registerDatabase(failing(createMemoryDatabase()));
});

/** A fresh patient per test, so no test inherits another's running challenge. */
const newPatient = async (pseudonym: string): Promise<PatientProfile> => {
  const created = await createPatient({ pseudonym });
  if (!created.ok) {
    throw new Error(created.message);
  }
  return created.data;
};

const today = todayAtPractice();

/** Throws rather than asserting — a refused start is a broken test, not a case. */
const start = async (
  patientId: string,
  text: string,
  closeCurrentWith?: "acquired" | "not_acquired" | "abandoned",
) => {
  const result = await startChallenge(
    patientId,
    { text, why: "", startedOn: today },
    closeCurrentWith,
  );
  if (!result.ok) {
    throw new Error(`challenge "${text}" refused: ${result.message}`);
  }
  return result.data;
};

describe("starting a challenge", () => {
  it("opens one current challenge with its words and start date", async () => {
    const patient = await newPatient("Claire");
    const result = await startChallenge(patient.id, {
      text: "Boire 1,5 L d'eau par jour",
      why: "Pour la digestion",
      startedOn: today,
    });

    expect(result.ok).toBe(true);
    const current = await getCurrentChallenge(patient.id);
    expect(current?.text).toBe("Boire 1,5 L d'eau par jour");
    expect(current?.why).toBe("Pour la digestion");
    expect(current?.startedOn).toBe(today);
    expect(current?.closedOn).toBeNull();
    expect(current?.outcome).toBeNull();
  });

  it("refuses a start date in the future", async () => {
    const patient = await newPatient("Inès");
    const result = await startChallenge(patient.id, {
      text: "Manger plus lentement",
      why: "",
      startedOn: "2999-01-01",
    });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toBe("invalid_input");
    expect(await getCurrentChallenge(patient.id)).toBeNull();
  });

  it("refuses an empty challenge", async () => {
    const patient = await newPatient("Léa");
    const result = await startChallenge(patient.id, {
      text: "   ",
      why: "",
      startedOn: today,
    });

    expect(!result.ok && result.error).toBe("invalid_input");
  });

  it("refuses a second challenge while one runs, unless she picks the first one's outcome", async () => {
    const patient = await newPatient("Marc");
    await start(patient.id, "Boire 1,5 L d'eau par jour");

    const second = await startChallenge(patient.id, {
      text: "Manger plus lentement",
      why: "",
      startedOn: today,
    });

    expect(!second.ok && second.error).toBe("conflict");
    expect((await getCurrentChallenge(patient.id))?.text).toBe(
      "Boire 1,5 L d'eau par jour",
    );
  });

  it("closes the running challenge with her outcome and opens the next in one step", async () => {
    const patient = await newPatient("Sofia");
    const first = await start(patient.id, "Boire 1,5 L d'eau par jour");

    const next = await start(patient.id, "Manger plus lentement", "acquired");

    expect(next.closed?.id).toBe(first.created.id);
    expect(next.closed?.outcome).toBe("acquired");
    expect(next.closed?.closedOn).toBe(today);
    expect((await getCurrentChallenge(patient.id))?.text).toBe(
      "Manger plus lentement",
    );
    const past = await listPastChallenges(patient.id);
    expect(past.map((challenge) => challenge.text)).toEqual([
      "Boire 1,5 L d'eau par jour",
    ]);
  });

  it("leaves neither half applied when the new challenge cannot be written", async () => {
    const patient = await newPatient("Hugo");
    const first = await start(patient.id, "Boire 1,5 L d'eau par jour");

    failNextChallengeInsert = true;
    await expect(
      startChallenge(
        patient.id,
        { text: "Manger plus lentement", why: "", startedOn: today },
        "not_acquired",
      ),
    ).rejects.toThrow("insert failed");

    const current = await getCurrentChallenge(patient.id);
    expect(current?.id).toBe(first.created.id);
    expect(current?.closedOn).toBeNull();
    expect(current?.outcome).toBeNull();
    expect(await listPastChallenges(patient.id)).toEqual([]);
  });
});

describe("editing and closing", () => {
  it("edits the running challenge", async () => {
    const patient = await newPatient("Anna");
    const { created } = await start(patient.id, "Boire de l'eau");

    const updated = await updateChallenge(created.id, {
      text: "Boire 1,5 L d'eau par jour",
      why: "La fatigue de l'après-midi",
      startedOn: today,
    });

    expect(updated.ok && updated.data.text).toBe("Boire 1,5 L d'eau par jour");
    expect(updated.ok && updated.data.why).toBe("La fatigue de l'après-midi");
  });

  it("closes with one of her three outcomes and keeps it", async () => {
    const patient = await newPatient("Paul");
    const { created } = await start(patient.id, "Manger plus lentement");

    const closed = await closeChallenge(created.id, "abandoned");

    expect(closed.ok && closed.data.outcome).toBe("abandoned");
    expect(await getCurrentChallenge(patient.id)).toBeNull();
    const [past] = await listPastChallenges(patient.id);
    expect(past.outcome).toBe("abandoned");
    expect(past.closedOn).toBe(today);
  });

  it("refuses an outcome that is not one of hers", async () => {
    const patient = await newPatient("Nora");
    const { created } = await start(patient.id, "Manger plus lentement");

    const closed = await closeChallenge(created.id, "maybe" as never);

    expect(!closed.ok && closed.error).toBe("invalid_input");
    expect((await getCurrentChallenge(patient.id))?.id).toBe(created.id);
  });

  it("freezes a closed challenge: no edit, no second close", async () => {
    const patient = await newPatient("Yves");
    const { created } = await start(patient.id, "Manger plus lentement");
    await closeChallenge(created.id, "acquired");

    const edited = await updateChallenge(created.id, {
      text: "Autre chose",
      why: "",
      startedOn: today,
    });
    const reclosed = await closeChallenge(created.id, "abandoned");

    expect(!edited.ok && edited.error).toBe("not_found");
    expect(!reclosed.ok && reclosed.error).toBe("not_found");
    const [past] = await listPastChallenges(patient.id);
    expect(past.text).toBe("Manger plus lentement");
    expect(past.outcome).toBe("acquired");
  });
});

describe("the patient's two taps", () => {
  it("offers « prêt(e) pour le prochain » only once « acquis » is set", async () => {
    const patient = await newPatient("Iris");
    const { created } = await start(patient.id, "Boire 1,5 L d'eau par jour");

    const tooEarly = await setChallengeReadyForNext(created.id, true);
    expect(!tooEarly.ok && tooEarly.error).toBe("conflict");

    await setChallengeAcquired(created.id, true);
    const ready = await setChallengeReadyForNext(created.id, true);

    expect(ready.ok && ready.data.acquiredAt).not.toBeNull();
    expect(ready.ok && ready.data.readyForNextAt).not.toBeNull();
  });

  it("toggles, and clearing « acquis » clears « prêt(e) » with it", async () => {
    const patient = await newPatient("Tom");
    const { created } = await start(patient.id, "Boire 1,5 L d'eau par jour");
    await setChallengeAcquired(created.id, true);
    await setChallengeReadyForNext(created.id, true);

    const unready = await setChallengeReadyForNext(created.id, false);
    expect(unready.ok && unready.data.readyForNextAt).toBeNull();
    expect(unready.ok && unready.data.acquiredAt).not.toBeNull();

    await setChallengeReadyForNext(created.id, true);
    const cleared = await setChallengeAcquired(created.id, false);
    expect(cleared.ok && cleared.data.acquiredAt).toBeNull();
    expect(cleared.ok && cleared.data.readyForNextAt).toBeNull();
  });

  it("keeps the first tap's time when the same state is posted twice", async () => {
    const patient = await newPatient("Zoé");
    const { created } = await start(patient.id, "Boire 1,5 L d'eau par jour");

    const first = await setChallengeAcquired(created.id, true);
    const again = await setChallengeAcquired(created.id, true);

    expect(first.ok && again.ok).toBe(true);
    if (first.ok && again.ok) {
      expect(again.data.acquiredAt?.getTime()).toBe(
        first.data.acquiredAt?.getTime(),
      );
    }
  });

  it("refuses a tap on a closed challenge, which keeps what the patient said", async () => {
    const patient = await newPatient("Eva");
    const { created } = await start(patient.id, "Boire 1,5 L d'eau par jour");
    await setChallengeAcquired(created.id, true);
    await closeChallenge(created.id, "acquired");

    const tapped = await setChallengeAcquired(created.id, false);

    expect(!tapped.ok && tapped.error).toBe("not_found");
    const [past] = await listPastChallenges(patient.id);
    expect(past.acquiredAt).not.toBeNull();
  });

  it("refuses, through the link, a challenge the token does not own", async () => {
    const owner = await newPatient("Luc");
    const stranger = await newPatient("Mia");
    const { created } = await start(owner.id, "Boire 1,5 L d'eau par jour");

    const result = await writeThroughPatientLink({
      token: stranger.shareToken,
      action: "challenge.acquired",
      text: {},
      target: {
        type: "patient_challenge",
        id: created.id,
        ownerOf: challengeOwner,
      },
      write: async () => setChallengeAcquired(created.id, true),
    });

    expect(!result.ok && result.error).toBe("not_found");
    expect((await getCurrentChallenge(owner.id))?.acquiredAt).toBeNull();
  });
});

describe("the console's signals", () => {
  it("reads « prêt(e) pour le prochain » over « acquis », and nothing once closed", async () => {
    const ready = await newPatient("Rita");
    const acquired = await newPatient("Sam");
    const quiet = await newPatient("Ugo");
    const closed = await newPatient("Vera");

    const a = await start(ready.id, "Boire 1,5 L d'eau par jour");
    await setChallengeAcquired(a.created.id, true);
    await setChallengeReadyForNext(a.created.id, true);

    const b = await start(acquired.id, "Manger plus lentement");
    await setChallengeAcquired(b.created.id, true);

    await start(quiet.id, "Tester deux nouveaux lunchs");

    const d = await start(closed.id, "Ajouter des protéines au petit-déjeuner");
    await setChallengeAcquired(d.created.id, true);
    await setChallengeReadyForNext(d.created.id, true);
    await start(closed.id, "Boire 1,5 L d'eau par jour", "acquired");

    const signals = await listChallengeSignals();

    expect(signals.get(ready.id)).toBe("ready_for_next");
    expect(signals.get(acquired.id)).toBe("acquired");
    expect(signals.has(quiet.id)).toBe(false);
    // Creating the next challenge clears the signal the last one raised.
    expect(signals.has(closed.id)).toBe(false);
  });
});
