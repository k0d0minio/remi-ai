import { beforeEach, describe, expect, it } from "vitest";
import {
  MAX_DOCUMENT_FILE_BYTES,
  patientFileKey,
  patientFilesPrefix,
} from "../shared/files";
import {
  acceptStoredFile,
  answerUploadRequest,
  isFileStoreConfigured,
  registerFileStore,
  SIGNED_URL_SECONDS,
  signedFileUrl,
  type FileStore,
  type StoredFile,
  type UploadRules,
} from "./index";

/**
 * The seam's rules, proven against a recording store: what a grant carries,
 * what a stored object must be before a row may point at it, and how long a
 * read link lives. Written from the acceptance criteria — PDF, JPEG, PNG or
 * WebP, 10 MB at most, refused in the seam and not only in the page.
 */

const patientId = "5f0d2c1e-8a4b-4c3d-9e2f-1a2b3c4d5e6f";
const prefix = patientFilesPrefix(patientId);

type Recording = {
  granted: UploadRules | null | undefined;
  removed: string[];
  signed: { key: string; seconds: number }[];
};

const recordingStore = (
  objects: Record<string, StoredFile>,
): { store: FileStore; seen: Recording } => {
  const seen: Recording = { granted: undefined, removed: [], signed: [] };
  const store: FileStore = {
    provider: "recording",
    answerUploadRequest: async (_request, rulesFor) => {
      seen.granted = await rulesFor(`${prefix}recette.pdf`, null);
      return new Response(null, { status: seen.granted ? 200 : 403 });
    },
    inspect: async (key) => objects[key] ?? null,
    signedUrl: async (key, seconds) => {
      seen.signed.push({ key, seconds });
      return `https://signed.example/${key}`;
    },
    remove: async (key) => {
      seen.removed.push(key);
    },
    removePrefix: async () => undefined,
  };
  return { store, seen };
};

const request = () => new Request("https://admin.example/api/files/upload");

describe("the files seam", () => {
  let seen: Recording;

  beforeEach(() => {
    const recording = recordingStore({
      [`${prefix}recette-abc.pdf`]: {
        key: `${prefix}recette-abc.pdf`,
        contentType: "application/pdf",
        size: 2_000_000,
      },
      [`${prefix}photo-abc.heic`]: {
        key: `${prefix}photo-abc.heic`,
        contentType: "image/heic",
        size: 1_000_000,
      },
      [`${prefix}scan-abc.pdf`]: {
        key: `${prefix}scan-abc.pdf`,
        contentType: "application/pdf",
        size: MAX_DOCUMENT_FILE_BYTES + 1,
      },
    });
    registerFileStore(recording.store);
    seen = recording.seen;
  });

  it("grants an upload only on the four accepted types and the 10 MB cap", async () => {
    const response = await answerUploadRequest(request(), async () => true);
    expect(response.status).toBe(200);
    expect(seen.granted?.allowedContentTypes).toEqual([
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);
    expect(seen.granted?.maximumSizeInBytes).toBe(10 * 1024 * 1024);
    expect(seen.granted?.validUntil).toBeGreaterThan(Date.now());
  });

  it("grants nothing when the caller's check refuses", async () => {
    const response = await answerUploadRequest(request(), async () => false);
    expect(response.status).toBe(403);
    expect(seen.granted).toBeNull();
  });

  it("accepts a stored PDF under the patient's prefix", async () => {
    const accepted = await acceptStoredFile(
      `${prefix}recette-abc.pdf`,
      patientId,
    );
    expect(accepted.ok && accepted.data.contentType).toBe("application/pdf");
    expect(seen.removed).toEqual([]);
  });

  it("refuses a stored type outside the list and removes it from the store", async () => {
    const accepted = await acceptStoredFile(
      `${prefix}photo-abc.heic`,
      patientId,
    );
    expect(accepted.ok).toBe(false);
    expect(!accepted.ok && accepted.error).toBe("invalid_input");
    expect(seen.removed).toEqual([`${prefix}photo-abc.heic`]);
  });

  it("refuses a stored file over 10 MB and removes it from the store", async () => {
    const accepted = await acceptStoredFile(`${prefix}scan-abc.pdf`, patientId);
    expect(!accepted.ok && accepted.error).toBe("invalid_input");
    expect(seen.removed).toEqual([`${prefix}scan-abc.pdf`]);
  });

  it("refuses a key outside the patient's prefix without touching the store", async () => {
    const other = patientFilesPrefix("0e9d8c7b-6a5f-4e3d-8c2b-1a0f9e8d7c6b");
    const accepted = await acceptStoredFile(
      `${other}recette-abc.pdf`,
      patientId,
    );
    expect(!accepted.ok && accepted.error).toBe("not_permitted");
    const climbing = await acceptStoredFile(`${prefix}../x.pdf`, patientId);
    expect(!climbing.ok && climbing.error).toBe("not_permitted");
    expect(seen.removed).toEqual([]);
  });

  it("says when nothing reached the store", async () => {
    const accepted = await acceptStoredFile(`${prefix}missing.pdf`, patientId);
    expect(!accepted.ok && accepted.error).toBe("not_found");
  });

  it("issues read links that live five minutes", async () => {
    await signedFileUrl(`${prefix}recette-abc.pdf`);
    expect(SIGNED_URL_SECONDS).toBe(300);
    expect(seen.signed).toEqual([
      { key: `${prefix}recette-abc.pdf`, seconds: 300 },
    ]);
  });

  it("reports a registered store as configured", () => {
    expect(isFileStoreConfigured()).toBe(true);
  });
});

describe("patient file keys", () => {
  it("keeps the key under the patient's prefix with a safe name", () => {
    expect(patientFileKey(patientId, "Liste des 15 aliments — Été.PDF")).toBe(
      `${prefix}liste-des-15-aliments-ete.pdf`,
    );
  });

  it("names a file with nothing usable « document »", () => {
    expect(patientFileKey(patientId, "../../..")).toBe(`${prefix}document`);
  });
});
