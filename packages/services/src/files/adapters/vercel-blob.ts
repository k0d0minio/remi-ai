import {
  BlobNotFoundError,
  del,
  head,
  issueSignedToken,
  list,
  presignUrl,
} from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireEnv } from "../../server/env";
import type { FileStore } from "../index";

/**
 * The Vercel Blob adapter for the `FileStore` seam (decision D-18).
 *
 * The store itself is created **private** and in an **EU region** — both are
 * settings of the store, fixed at its creation, not of this code — so every
 * call here passes `access: "private"` and a read is only ever a presigned URL.
 * The token is read through `requireEnv` on each call rather than left to the
 * SDK's own `process.env` lookup, so a missing variable fails naming itself.
 *
 * Uploads are the browser's (`./vercel-blob-client.ts`): a 10 MB body cannot
 * pass through a server action or a function on Vercel, so the server only
 * answers the uploader's grant request and the bytes go straight to the store.
 * The upload-completed callback is not used — it needs a public URL the
 * preview's protection would refuse; the console confirms the upload itself
 * and the seam re-checks the stored object before any row points at it.
 */

const token = () =>
  requireEnv("BLOB_READ_WRITE_TOKEN", "the Vercel Blob file store");

/** Thrown from inside the grant callback so a refusal is told from a fault. */
class UploadRefused extends Error {}

export const createVercelBlobFileStore = (): FileStore => ({
  provider: "vercel-blob",

  answerUploadRequest: async (request, rulesFor) => {
    const body = (await request
      .json()
      .catch(() => null)) as HandleUploadBody | null;
    if (body?.type !== "blob.generate-client-token") {
      return Response.json({ error: "not an upload request" }, { status: 400 });
    }
    try {
      const result = await handleUpload({
        token: token(),
        request,
        body,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          const rules = await rulesFor(pathname, clientPayload);
          if (!rules) {
            throw new UploadRefused("upload refused");
          }
          return {
            allowedContentTypes: [...rules.allowedContentTypes],
            maximumSizeInBytes: rules.maximumSizeInBytes,
            validUntil: rules.validUntil,
            addRandomSuffix: true,
            allowOverwrite: false,
          };
        },
      });
      return Response.json(result);
    } catch (error) {
      if (error instanceof UploadRefused) {
        return Response.json({ error: error.message }, { status: 403 });
      }
      throw error;
    }
  },

  inspect: async (key) => {
    try {
      const found = await head(key, { token: token() });
      return {
        key: found.pathname,
        contentType: found.contentType,
        size: found.size,
      };
    } catch (error) {
      if (error instanceof BlobNotFoundError) {
        return null;
      }
      throw error;
    }
  },

  signedUrl: async (key, validForSeconds) => {
    const validUntil = Date.now() + validForSeconds * 1000;
    const signed = await issueSignedToken({
      token: token(),
      pathname: key,
      operations: ["get"],
      validUntil,
    });
    const { presignedUrl } = await presignUrl(signed, {
      operation: "get",
      pathname: key,
      access: "private",
      validUntil,
    });
    return presignedUrl;
  },

  remove: async (key) => {
    await del(key, { token: token() });
  },

  removePrefix: async (prefix) => {
    let cursor: string | undefined;
    do {
      const page = await list({ token: token(), prefix, cursor });
      if (page.blobs.length > 0) {
        await del(
          page.blobs.map((blob) => blob.pathname),
          { token: token() },
        );
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  },
});
