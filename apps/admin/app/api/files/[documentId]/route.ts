import {
  getPatientDocument,
  patientOf,
  signedFileUrl,
} from "@remi/services/server";
import { actorOf, getOperatorSession } from "@/lib/auth/session";
import { fileStoreReady } from "@/lib/files";

/**
 * Opens one stored file for the operator: the session is checked here, since a
 * route handler sits outside the `(admin)` layout's guard, and the answer is a
 * redirect to a five-minute signed URL — the store is private, so there is no
 * address to link to directly. `no-store`, so no cache keeps the signed URL
 * past its life.
 */
export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
): Promise<Response> => {
  const operator = await getOperatorSession();
  if (!operator) {
    return new Response("Non connecté", { status: 401 });
  }
  const actor = await actorOf(operator);
  const { documentId } = await params;
  // The service answers null for a file of a patient the actor may not read
  // (D-27): another practitioner's patient answers 404, like a missing file.
  const document = await getPatientDocument(actor, documentId);
  if (!document || document.kind !== "file" || !document.blobKey) {
    return new Response("Document introuvable", { status: 404 });
  }
  if (!(await patientOf(actor, document.patientId)).ok) {
    return new Response("Document introuvable", { status: 404 });
  }
  if (!fileStoreReady()) {
    return new Response("Aucun stockage de fichiers n'est configuré", {
      status: 503,
    });
  }
  const url = await signedFileUrl(document.blobKey);
  return new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": "no-store" },
  });
};
