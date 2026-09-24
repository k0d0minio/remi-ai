import { answerUploadRequest, getPatient } from "@remi/services/server";
import { patientFilesPrefix } from "@remi/services/shared";
import { getOperatorSession } from "@/lib/auth/session";
import { fileStoreReady } from "@/lib/files";

/**
 * The browser uploader's grant endpoint. A trust boundary on its own: it is
 * reached by the console's upload widget, not through the `(admin)` layout, so
 * it checks the operator session itself and answers 401 without one rather
 * than redirecting a machine request to a sign-in page.
 *
 * A grant is given only for a key under the named patient's prefix, for a
 * patient that exists; the types and the size the grant carries are the files
 * seam's, never this route's. The row that points at the file is written
 * afterwards by `addDocumentFileAction`, which re-checks what landed.
 */

/**
 * The patient the widget names, or `null`. Only the shape is read here —
 * `getPatient` validates the id itself and answers `not_found` for anything
 * that is not one of hers.
 */
const patientIdOf = (clientPayload: string | null): string | null => {
  try {
    const parsed: unknown = JSON.parse(clientPayload ?? "");
    return parsed !== null &&
      typeof parsed === "object" &&
      "patientId" in parsed &&
      typeof parsed.patientId === "string"
      ? parsed.patientId
      : null;
  } catch {
    return null;
  }
};

export const POST = async (request: Request): Promise<Response> => {
  const operator = await getOperatorSession();
  if (!operator) {
    return Response.json({ error: "not signed in" }, { status: 401 });
  }
  if (!fileStoreReady()) {
    return Response.json(
      { error: "no file store is configured" },
      { status: 503 },
    );
  }
  return answerUploadRequest(request, async (key, clientPayload) => {
    const patientId = patientIdOf(clientPayload);
    if (!patientId) {
      return false;
    }
    const patient = await getPatient(patientId);
    return (
      patient.ok &&
      key.startsWith(patientFilesPrefix(patientId)) &&
      !key.includes("..")
    );
  });
};
