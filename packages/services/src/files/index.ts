import {
  documentFileTypes,
  isDocumentFileType,
  isPatientFileKey,
  MAX_DOCUMENT_FILE_BYTES,
  type DocumentFileType,
} from "../shared/files";
import { err, ok, type Result } from "../shared/result";

/**
 * @remi/services/files — stored files, the fourth seam (decision D-18).
 *
 * Server-only. Same seam pattern as /email: the app registers one `FileStore`
 * lazily at first use and callers never name a vendor. One adapter exists —
 * `createVercelBlobFileStore()`, in ./adapters/vercel-blob.ts — and it is the
 * only server file in the repo that names the file vendor.
 *
 * The rules are the seam's, not the adapter's and not the page's: which types
 * are accepted, how large a file may be, how long a read link lives. Every
 * upload grant carries them to the store, and every stored object is checked
 * against them again before a row points at it — a grant is a promise the
 * browser was given, the second check is what the server actually received.
 *
 * Nothing here is ever public. A file is read through a signed URL that lives
 * five minutes, issued only after the caller proved the file is theirs.
 */

export type StoredFile = {
  key: string;
  contentType: string;
  size: number;
};

/** What an upload grant allows — built by the seam, carried by the adapter. */
export type UploadRules = {
  allowedContentTypes: readonly string[];
  maximumSizeInBytes: number;
  /** Milliseconds since the epoch. */
  validUntil: number;
};

export type FileStore = {
  readonly provider: string;
  /**
   * Answer the browser uploader's request for a grant. `rulesFor` receives the
   * key the browser asked to write and the payload it sent, and returns the
   * rules to grant — or `null` to refuse.
   */
  answerUploadRequest: (
    request: Request,
    rulesFor: (
      key: string,
      clientPayload: string | null,
    ) => Promise<UploadRules | null>,
  ) => Promise<Response>;
  /** What the store holds under `key`, or `null` when nothing does. */
  inspect: (key: string) => Promise<StoredFile | null>;
  signedUrl: (key: string, validForSeconds: number) => Promise<string>;
  remove: (key: string) => Promise<void>;
  removePrefix: (prefix: string) => Promise<void>;
};

/** How long a patient's read link lives once issued. */
export const SIGNED_URL_SECONDS = 5 * 60;

/** How long the browser has to finish an upload once granted. */
const UPLOAD_GRANT_SECONDS = 10 * 60;

const notConfigured = () =>
  new Error(
    "no file store registered — set BLOB_READ_WRITE_TOKEN (see .icm/docs/ENV.md § Files)",
  );

/**
 * The default: stores nothing and says so. An upload request is refused with a
 * 503 rather than granted into nowhere, a read finds nothing, and a removal
 * that would have to reach real files throws — `deletePatient` checks
 * `isFileStoreConfigured()` before relying on it, so a patient with files is
 * never deleted while their files stay behind.
 */
const unconfiguredFileStore: FileStore = {
  provider: "none",
  answerUploadRequest: async () =>
    Response.json({ error: "no file store is configured" }, { status: 503 }),
  inspect: async () => null,
  signedUrl: async () => {
    throw notConfigured();
  },
  remove: async () => {
    throw notConfigured();
  },
  removePrefix: async () => {
    throw notConfigured();
  },
};

let store: FileStore = unconfiguredFileStore;

export const registerFileStore = (adapter: FileStore) => {
  store = adapter;
};

export const getFileStore = () => store;

/**
 * Whether a real store is registered. The console asks it before offering an
 * upload: a file must never look kept when it went nowhere.
 */
export const isFileStoreConfigured = () => store !== unconfiguredFileStore;

/**
 * Hand the browser uploader a grant for one key, on the seam's rules. The
 * caller's `authorize` is the permission check — the operator's session, the
 * patient, the key sitting under that patient's prefix — and a `false` is a
 * refusal before any grant exists.
 */
export const answerUploadRequest = async (
  request: Request,
  authorize: (key: string, clientPayload: string | null) => Promise<boolean>,
): Promise<Response> =>
  store.answerUploadRequest(request, async (key, clientPayload) =>
    (await authorize(key, clientPayload))
      ? {
          allowedContentTypes: documentFileTypes,
          maximumSizeInBytes: MAX_DOCUMENT_FILE_BYTES,
          validUntil: Date.now() + UPLOAD_GRANT_SECONDS * 1000,
        }
      : null,
  );

export type AcceptedFile = StoredFile & { contentType: DocumentFileType };

/**
 * Check what actually landed under `key` before a row points at it. The key
 * must be one of this patient's (`isPatientFileKey`), and the stored object
 * must be an accepted type within the cap — an object that is not is removed
 * on the spot, so a refused upload leaves nothing behind in the store.
 */
export const acceptStoredFile = async (
  key: string,
  patientId: string,
): Promise<Result<AcceptedFile>> => {
  if (!isPatientFileKey(key, patientId)) {
    return err("not_permitted", "that file does not belong to this patient");
  }
  const stored = await store.inspect(key);
  if (!stored) {
    return err("not_found", "the file did not reach the store");
  }
  if (
    !isDocumentFileType(stored.contentType) ||
    stored.size > MAX_DOCUMENT_FILE_BYTES
  ) {
    await store.remove(key);
    return err(
      "invalid_input",
      "only a PDF or an image (JPEG, PNG, WebP) of 10 MB at most is accepted",
    );
  }
  return ok({ ...stored, contentType: stored.contentType });
};

/** A read link for one stored file, valid for `SIGNED_URL_SECONDS`. */
export const signedFileUrl = async (key: string) =>
  store.signedUrl(key, SIGNED_URL_SECONDS);

/**
 * The one adapter — Vercel Blob. This line and the registration call in each
 * app's `ensureFileStore()` are the only places the vendor is named.
 */
export { createVercelBlobFileStore } from "./adapters/vercel-blob";
