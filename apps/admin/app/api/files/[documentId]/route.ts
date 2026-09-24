import { getPatientDocument, signedFileUrl } from "@remi/services/server";
import { getOperatorSession } from "@/lib/auth/session";
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
    return new Response("Not signed in", { status: 401 });
  }
  const { documentId } = await params;
  const document = await getPatientDocument(documentId);
  if (!document || document.kind !== "file" || !document.blobKey) {
    return new Response("Not found", { status: 404 });
  }
  if (!fileStoreReady()) {
    return new Response("No file store is configured", { status: 503 });
  }
  const url = await signedFileUrl(document.blobKey);
  return new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": "no-store" },
  });
};
