import {
  getPatientByShareToken,
  getPatientDocument,
  signedFileUrl,
} from "@remi/services/server";
import { ensureDatabase } from "@/lib/database";
import { fileStoreReady } from "@/lib/files";

/**
 * Opens one of the patient's files. The token in the path is the credential,
 * as everywhere on the link: the document must belong to the token's patient,
 * and anything else — an unknown token, another patient's document, a link
 * row — is the same 404, so the route says nothing about what exists.
 *
 * The answer is a redirect to a signed URL that lives five minutes: the store
 * is private and a file has no other address. `no-store`, so neither the
 * browser nor a proxy keeps the signed URL past its life. Opening a file
 * records nothing — the page it was opened from already did.
 */
export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ token: string; id: string }> },
): Promise<Response> => {
  const { token, id } = await params;
  ensureDatabase();
  const patient = await getPatientByShareToken(token);
  const document = patient.ok ? await getPatientDocument(id) : null;
  if (
    !patient.ok ||
    !document ||
    document.patientId !== patient.data.id ||
    document.kind !== "file" ||
    !document.blobKey
  ) {
    return new Response("Not found", { status: 404 });
  }
  if (!fileStoreReady()) {
    return new Response("Unavailable", { status: 503 });
  }
  const url = await signedFileUrl(document.blobKey);
  return new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": "no-store" },
  });
};
