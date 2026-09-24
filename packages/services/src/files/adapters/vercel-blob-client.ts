import { upload } from "@vercel/blob/client";
import { patientFileKey } from "../../shared/files";

/**
 * The browser half of the Vercel Blob adapter: the bytes go from the console
 * straight to the private store, under a grant `handleUploadUrl` answers after
 * checking the operator and the patient. Kept beside the server adapter so the
 * vendor stays inside this package — the console imports
 * `@remi/services/files/client` and never names it.
 */
export const uploadPatientFile = async (
  patientId: string,
  file: File,
  handleUploadUrl: string,
): Promise<{ key: string }> => {
  const stored = await upload(patientFileKey(patientId, file.name), file, {
    access: "private",
    handleUploadUrl,
    clientPayload: JSON.stringify({ patientId }),
    contentType: file.type,
  });
  return { key: stored.pathname };
};
