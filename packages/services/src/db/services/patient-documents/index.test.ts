import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  registerFileStore,
  type FileStore,
  type StoredFile,
} from "../../../files";
import { patientFilesPrefix } from "../../../shared/files";
import { todayAtPractice } from "../../../shared/format";
import type { Id } from "../../../types";
import { getDatabase, registerDatabase } from "../../client";
import type { PatientProfile } from "../../models/patient-profile";
import { createMemoryDatabase } from "../../test-helpers";
import { createPatient, deletePatient } from "../patients";
import {
  addPatientDocumentFile,
  addPatientDocumentLink,
  listPatientDocuments,
  removePatientDocument,
  updatePatientDocument,
} from "./index";

/**
 * Written from the acceptance criteria: a file or a link with a title and a
 * tag, attached to at most one of this patient's goals or recipe assignments;
 * edited and removed, a removed file gone from the store; newest first; and a
 * deleted patient taking their files with them.
 */

/** A store the tests can fill, and that remembers what left it. */
const objects = new Map<string, StoredFile>();
const removed: string[] = [];
const removedPrefixes: string[] = [];
let failRemovals = false;

const store: FileStore = {
  provider: "memory",
  answerUploadRequest: async () => new Response(null, { status: 200 }),
  inspect: async (key) => objects.get(key) ?? null,
  signedUrl: async (key) => `https://signed.example/${key}`,
  remove: async (key) => {
    if (failRemovals) {
      throw new Error("store unavailable");
    }
    objects.delete(key);
    removed.push(key);
  },
  removePrefix: async (prefix) => {
    if (failRemovals) {
      throw new Error("store unavailable");
    }
    for (const key of [...objects.keys()]) {
      if (key.startsWith(prefix)) {
        objects.delete(key);
      }
    }
    removedPrefixes.push(prefix);
  },
};

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
  registerFileStore(store);
});

beforeEach(() => {
  failRemovals = false;
  removed.length = 0;
  removedPrefixes.length = 0;
});

const newPatient = async (pseudonym: string): Promise<PatientProfile> => {
  const created = await createPatient({ pseudonym });
  if (!created.ok) {
    throw new Error(created.message);
  }
  return created.data;
};

/** Put an object in the store as the browser upload would have. */
const uploaded = (
  patientId: Id,
  name: string,
  contentType: string,
  size = 1000,
) => {
  const key = `${patientFilesPrefix(patientId)}${name}`;
  objects.set(key, { key, contentType, size });
  return key;
};

const goalOf = async (patientId: Id) =>
  getDatabase()
    .collection<{ id: Id; patientId: Id }>("patient_goals")
    .insert({ patientId });

const assignmentOf = async (patientId: Id) =>
  getDatabase()
    .collection<{ id: Id; patientId: Id }>("patient_recipe_assignments")
    .insert({ patientId });

const link = {
  title: "Mes 15 aliments",
  url: "https://example.org/liste",
  tag: "document" as const,
};

describe("adding a document", () => {
  it("records a link with its title, tag and today's date", async () => {
    const patient = await newPatient("Claire");
    const result = await addPatientDocumentLink(
      patient.id,
      link,
      "morgane@example.org",
    );
    expect(result.ok).toBe(true);
    const [document] = await listPatientDocuments(patient.id);
    expect(document.kind).toBe("link");
    expect(document.title).toBe("Mes 15 aliments");
    expect(document.url).toBe("https://example.org/liste");
    expect(document.blobKey).toBeNull();
    expect(document.addedOn).toBe(todayAtPractice());
    expect(document.addedByEmail).toBe("morgane@example.org");
  });

  it("refuses a link that is not https", async () => {
    const patient = await newPatient("Inès");
    const result = await addPatientDocumentLink(
      patient.id,
      { ...link, url: "http://example.org/liste" },
      "",
    );
    expect(!result.ok && result.error).toBe("invalid_input");
  });

  it("refuses an empty title", async () => {
    const patient = await newPatient("Lou");
    const result = await addPatientDocumentLink(
      patient.id,
      { ...link, title: "  " },
      "",
    );
    expect(!result.ok && result.error).toBe("invalid_input");
  });

  it("records an uploaded PDF tagged as a recipe, with its type and size", async () => {
    const patient = await newPatient("Marc");
    const key = uploaded(patient.id, "gratin.pdf", "application/pdf", 42_000);
    const result = await addPatientDocumentFile(
      patient.id,
      { title: "Gratin de légumes", key, tag: "recipe" },
      "",
    );
    expect(result.ok).toBe(true);
    const [document] = await listPatientDocuments(patient.id);
    expect(document.kind).toBe("file");
    expect(document.tag).toBe("recipe");
    expect(document.blobKey).toBe(key);
    expect(document.mime).toBe("application/pdf");
    expect(document.size).toBe(42_000);
    expect(document.url).toBeNull();
  });

  it("refuses a stored file of another type and removes it from the store", async () => {
    const patient = await newPatient("Sam");
    const key = uploaded(patient.id, "photo.heic", "image/heic");
    const result = await addPatientDocumentFile(
      patient.id,
      { title: "Photo", key, tag: "document" },
      "",
    );
    expect(!result.ok && result.error).toBe("invalid_input");
    expect(removed).toEqual([key]);
    expect(await listPatientDocuments(patient.id)).toEqual([]);
  });

  it("removes the upload from the store when the add is refused", async () => {
    const patient = await newPatient("Olga");
    const other = await newPatient("Paul");
    const goal = await goalOf(other.id);
    const key = uploaded(patient.id, "liste.pdf", "application/pdf");
    const result = await addPatientDocumentFile(
      patient.id,
      { title: "Liste", key, tag: "document", goalId: goal.id },
      "",
    );
    expect(!result.ok && result.error).toBe("invalid_input");
    expect(removed).toEqual([key]);
  });

  it("answers a repeated submit with the row it already made", async () => {
    const patient = await newPatient("Quentin");
    const key = uploaded(patient.id, "menu.pdf", "application/pdf");
    const input = { title: "Menu", key, tag: "document" as const };
    const first = await addPatientDocumentFile(patient.id, input, "");
    const second = await addPatientDocumentFile(patient.id, input, "");
    expect(first.ok && second.ok && second.data.id).toBe(
      first.ok ? first.data.id : "",
    );
    expect(await listPatientDocuments(patient.id)).toHaveLength(1);
  });

  it("refuses a file uploaded under another patient's prefix", async () => {
    const patient = await newPatient("Noé");
    const other = await newPatient("Zoé");
    const key = uploaded(other.id, "liste.pdf", "application/pdf");
    const result = await addPatientDocumentFile(
      patient.id,
      { title: "Liste", key, tag: "document" },
      "",
    );
    expect(!result.ok && result.error).toBe("not_permitted");
  });
});

describe("attaching a document", () => {
  it("attaches to one of the patient's goals", async () => {
    const patient = await newPatient("Anna");
    const goal = await goalOf(patient.id);
    const result = await addPatientDocumentLink(
      patient.id,
      { ...link, goalId: goal.id },
      "",
    );
    expect(result.ok && result.data.goalId).toBe(goal.id);
  });

  it("attaches to one of the patient's recipe assignments", async () => {
    const patient = await newPatient("Basile");
    const assignment = await assignmentOf(patient.id);
    const result = await addPatientDocumentLink(
      patient.id,
      { ...link, recipeAssignmentId: assignment.id },
      "",
    );
    expect(result.ok && result.data.recipeAssignmentId).toBe(assignment.id);
  });

  it("refuses a goal and a recipe at once", async () => {
    const patient = await newPatient("Chloé");
    const goal = await goalOf(patient.id);
    const assignment = await assignmentOf(patient.id);
    const result = await addPatientDocumentLink(
      patient.id,
      { ...link, goalId: goal.id, recipeAssignmentId: assignment.id },
      "",
    );
    expect(!result.ok && result.error).toBe("invalid_input");
  });

  it("refuses another patient's goal", async () => {
    const patient = await newPatient("Denis");
    const other = await newPatient("Emma");
    const goal = await goalOf(other.id);
    const result = await addPatientDocumentLink(
      patient.id,
      { ...link, goalId: goal.id },
      "",
    );
    expect(!result.ok && result.error).toBe("invalid_input");
  });
});

describe("editing and removing a document", () => {
  it("edits the title, the tag and the attachment", async () => {
    const patient = await newPatient("Fanny");
    const goal = await goalOf(patient.id);
    const created = await addPatientDocumentLink(patient.id, link, "");
    if (!created.ok) {
      throw new Error(created.message);
    }
    const result = await updatePatientDocument(created.data.id, {
      title: "Les 15 aliments de Fanny",
      tag: "recipe",
      goalId: goal.id,
    });
    expect(result.ok).toBe(true);
    const [document] = await listPatientDocuments(patient.id);
    expect(document.title).toBe("Les 15 aliments de Fanny");
    expect(document.tag).toBe("recipe");
    expect(document.goalId).toBe(goal.id);
    expect(document.url).toBe(link.url);
  });

  it("removes a file from the store before its row", async () => {
    const patient = await newPatient("Gaël");
    const key = uploaded(patient.id, "menu.pdf", "application/pdf");
    const created = await addPatientDocumentFile(
      patient.id,
      { title: "Menu", key, tag: "document" },
      "",
    );
    if (!created.ok) {
      throw new Error(created.message);
    }
    const result = await removePatientDocument(created.data.id);
    expect(result.ok && result.data.title).toBe("Menu");
    expect(removed).toEqual([key]);
    expect(await listPatientDocuments(patient.id)).toEqual([]);
  });

  it("keeps the row when the store refuses the removal", async () => {
    const patient = await newPatient("Hugo");
    const key = uploaded(patient.id, "plan.pdf", "application/pdf");
    const created = await addPatientDocumentFile(
      patient.id,
      { title: "Plan", key, tag: "document" },
      "",
    );
    if (!created.ok) {
      throw new Error(created.message);
    }
    failRemovals = true;
    const result = await removePatientDocument(created.data.id);
    expect(!result.ok && result.error).toBe("upstream_failed");
    expect(await listPatientDocuments(patient.id)).toHaveLength(1);
  });
});

describe("listing", () => {
  it("lists newest first", async () => {
    const patient = await newPatient("Jade");
    await addPatientDocumentLink(patient.id, { ...link, title: "Premier" }, "");
    await new Promise((resolve) => setTimeout(resolve, 5));
    await addPatientDocumentLink(patient.id, { ...link, title: "Second" }, "");
    const titles = (await listPatientDocuments(patient.id)).map(
      (document) => document.title,
    );
    expect(titles).toEqual(["Second", "Premier"]);
  });
});

describe("deleting the patient", () => {
  it("removes the patient's files from the store before the patient", async () => {
    const patient = await newPatient("Karim");
    uploaded(patient.id, "a.pdf", "application/pdf");
    const result = await deletePatient(patient.id);
    expect(result.ok).toBe(true);
    expect(removedPrefixes).toEqual([patientFilesPrefix(patient.id)]);
    expect(
      [...objects.keys()].some((key) =>
        key.startsWith(patientFilesPrefix(patient.id)),
      ),
    ).toBe(false);
  });

  it("stops the deletion when the store refuses", async () => {
    const patient = await newPatient("Léa");
    failRemovals = true;
    const result = await deletePatient(patient.id);
    expect(!result.ok && result.error).toBe("upstream_failed");
    expect(
      await getDatabase().collection("patient_profiles").findById(patient.id),
    ).not.toBeNull();
  });
});
