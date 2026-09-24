import {
  createVercelBlobFileStore,
  env,
  isFileStoreConfigured,
  registerFileStore,
} from "@remi/services/server";

/**
 * This app's registration point for the files seam — the one place in the
 * web app that names the file vendor. The link only ever reads: the one route
 * that opens a patient's file asks this before issuing a signed URL. Lazily,
 * for the reason `lib/database.ts` gives.
 */
export const fileStoreReady = () => {
  if (!isFileStoreConfigured()) {
    if (!env().BLOB_READ_WRITE_TOKEN) {
      console.error(
        "[files] no file store registered — BLOB_READ_WRITE_TOKEN is unset on this deployment. Files on the patient link cannot be opened. See .icm/docs/ENV.md § Files.",
      );
      return false;
    }
    registerFileStore(createVercelBlobFileStore());
  }
  return true;
};
