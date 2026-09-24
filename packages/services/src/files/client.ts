/**
 * @remi/services/files/client — the browser uploader.
 *
 * The one piece of the files seam that runs in a browser: a 10 MB file cannot
 * pass through a server action, so it travels from the page to the store under
 * a grant the server's `answerUploadRequest` issued. It imports nothing that
 * reads a secret; the server entry (`@remi/services/files`) holds the rules.
 */
export { uploadPatientFile } from "./adapters/vercel-blob-client";
