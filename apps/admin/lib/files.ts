import {
  createVercelBlobFileStore,
  env,
  isFileStoreConfigured,
  registerFileStore,
} from "@remi/services/server";

/**
 * This app's registration point for the files seam — the one place in the
 * admin app that names the file vendor. Lazily, from the code that stores,
 * never from `instrumentation.ts`, for the reason `lib/mailer.ts` gives; and
 * through `/server`, the entrypoint `deletePatient` reads the store from.
 *
 * With `BLOB_READ_WRITE_TOKEN` unset nothing is registered: the log names the
 * variable, the console says uploads are unavailable where it offers one, and
 * links still work.
 */
const ensureFileStore = () => {
  if (isFileStoreConfigured()) {
    return;
  }
  if (!env().BLOB_READ_WRITE_TOKEN) {
    console.error(
      "[files] no file store registered — BLOB_READ_WRITE_TOKEN is unset on this deployment. Uploads are refused. See .icm/docs/ENV.md § Files.",
    );
    return;
  }
  registerFileStore(createVercelBlobFileStore());
};

/**
 * Whether this deployment can store a file, registering the adapter on the
 * way. Asked before offering an upload and before anything that removes one —
 * the same single question `mailerReady()` answers for mail.
 */
export const fileStoreReady = () => {
  ensureFileStore();
  return isFileStoreConfigured();
};
